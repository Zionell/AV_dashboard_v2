import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/projects/[id]: полная деталка проекта на моках.
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const project = db.projects.find((p) => p.id === id);

    if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

    const tasks = db.todos.filter((t) => t.projectId === id);
    const byStatus: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };

    for (const t of tasks) byStatus[t.status] = (byStatus[t.status] || 0) + 1;

    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const totalTimeMs = db.times
        .filter((s) => s.projectId === id)
        .reduce((sum, s) => sum + (new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime()), 0);

    // В демо участники — первые трое; часы задаём детерминированно.
    const members = db.users.slice(0, 3).map((u, i) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        todayMs: ([2, 1.5, 0][i] ?? 0) * 3_600_000,
        weekMs: ([18, 12, 9][i] ?? 0) * 3_600_000,
        tasksCount: tasks.filter((t) => t.executorId === u.id).length,
    }));

    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((t) => ({ id: t.id, name: t.name, status: t.status, updatedAt: t.updatedAt }));

    const materials = db.materials
        .filter((m) => m.projectId === id)
        .map((m) => {
            const cat = db.categories.find((c) => c.id === m.categoryId);

            return { id: m.id, name: m.name, category: cat ? { label: cat.label, color: cat.color } : null };
        });

    return {
        ...project,
        image: null,
        startDate: null,
        deadline: null,
        budget: null,
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-07-15T10:00:00.000Z',
        isClosed: tasks.length > 0 && completedTasks === tasks.length,
        stats: { totalTasks: tasks.length, completedTasks, membersCount: members.length, totalTimeMs, byStatus },
        members,
        recentTasks,
        materials,
        events: [],
    };
});
