import seed from './seed.json';

/**
 * Демо-режим: данные живут только в памяти процесса. Сидятся из seed.json,
 * мутируются запросами в рамках сессии и сбрасываются при рестарте сервера —
 * в БД и на диск ничего не пишется. Никаких запросов в Prisma здесь нет.
 */

export interface PreviewUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    workHours: number;
}

export interface PreviewTodo {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: number;
    dueDate: string | null;
    isCompleted: boolean;
    estimateHours: number | null;
    projectId: string;
    executorId: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PreviewProject {
    id: string;
    name: string;
    description: string;
    client: string;
    priority: number;
    companyId: string;
    links: { name: string; url: string }[];
}

export interface PreviewMaterial {
    id: string;
    name: string;
    sourceLink: string;
    categoryId: string;
    projectId: string | null;
    companyId: string;
    authorId: string;
}

export interface PreviewCategory {
    id: string;
    label: string;
    color: string;
    companyId: string;
}

export interface PreviewTimes {
    id: string;
    userId: string;
    projectId: string | null;
    todoId: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PreviewComment {
    id: string;
    text: string;
    todoId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PreviewAttachment {
    id: string;
    name: string;
    todoId: string;
    authorId: string;
    data: string;
    createdAt: string;
}

export interface PreviewDb {
    company: { id: string; name: string; plan: string };
    user: PreviewUser & { companyId: string; bio: string | null; hasPassword: boolean };
    users: PreviewUser[];
    projects: PreviewProject[];
    todos: PreviewTodo[];
    categories: PreviewCategory[];
    materials: PreviewMaterial[];
    comments: PreviewComment[];
    attachments: PreviewAttachment[];
    times: PreviewTimes[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

// Плейсхолдеры сроков (TODAY / TOMORROW / +3d / -1d) → в реальные даты, чтобы демо
// всегда выглядело свежим независимо от даты запуска.
function resolveDue(value: string | null): string | null {
    if (!value) return null;

    const date = new Date();

    if (value === 'TOMORROW') {
        date.setDate(date.getDate() + 1);
    } else if (value !== 'TODAY') {
        const match = value.match(/^([+-])(\d+)d$/);

        if (!match) return value;
        date.setDate(date.getDate() + (match[1] === '-' ? -1 : 1) * Number(match[2]));
    }

    date.setHours(18, 0, 0, 0);

    return date.toISOString();
}

function build(): PreviewDb {
    const raw = clone(seed);
    const now = Date.now();

    const todos: PreviewTodo[] = raw.todos.map((t, i) => ({
        ...t,
        dueDate: resolveDue(t.dueDate),
        isCompleted: t.status === 'DONE',
        estimateHours: null,
        createdAt: new Date(now - (i + 1) * 3_600_000).toISOString(),
        updatedAt: new Date(now - i * 1_800_000).toISOString(),
    }));

    // Сессии времени за текущую неделю — под графики/логи на странице Times.
    const day = 24 * 3_600_000;
    const monday = new Date();

    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(9, 0, 0, 0);

    const sampleHours = [6.5, 7.8, 6.2, 7.1, 5.9];
    const times: PreviewTimes[] = sampleHours.map((h, i) => {
        const start = new Date(monday.getTime() + i * day);
        const project = raw.projects[i % raw.projects.length];

        return {
            id: `tm-${i + 1}`,
            userId: raw.user.id,
            projectId: project?.id ?? null,
            todoId: todos.find((t) => t.projectId === project?.id)?.id ?? null,
            active: false,
            createdAt: start.toISOString(),
            updatedAt: new Date(start.getTime() + h * 3_600_000).toISOString(),
        };
    });

    return { ...raw, todos, comments: [], attachments: [], times } as PreviewDb;
}

let db = build();

/** Текущее in-memory состояние демо-данных. */
export const previewDb = (): PreviewDb => db;

/** Сброс к исходным фикстурам (на будущее — «сбросить демо» без рестарта). */
export function resetPreview() {
    db = build();
}

/** Короткий id для созданных в демо сущностей. */
export function previewId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Публичная карточка человека — как её отдают реальные эндпоинты. */
export function previewPerson(id: string | null) {
    const u = db.users.find((x) => x.id === id);

    return u ? { id: u.id, name: u.name, image: u.image } : null;
}
