import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import { previewDb } from '~~/server/utils/preview/store';

const HOUR = 3_600_000;

// Копия GET /api/times/stats: недельная разбивка генерится под текущую дату,
// чтобы демо всегда показывало «эту неделю».
export default defineEventHandler(() => {
    const db = previewDb();
    const from = startOfWeek(new Date(), { weekStartsOn: 1 });
    const to = endOfWeek(new Date(), { weekStartsOn: 1 });

    const sampleHours = [6.5, 7.8, 6.2, 7.1, 5.9, 1.4, 0];

    const byDay = eachDayOfInterval({ start: from, end: to }).map((d, i) => ({
        date: format(d, 'yyyy-MM-dd'),
        ms: Math.round((sampleHours[i] ?? 0) * HOUR),
    }));

    const totalMs = byDay.reduce((sum, d) => sum + d.ms, 0);
    const workingDays = byDay.filter((d) => d.ms > 0).length;
    const shares = [0.35, 0.25, 0.25, 0.15];

    const byProject = db.projects
        .map((p, i) => ({ projectId: p.id, name: p.name, ms: Math.round(totalMs * (shares[i] ?? 0)) }))
        .filter((x) => x.ms > 0);

    return {
        totals: {
            totalMs,
            workingDays,
            avgPerDayMs: workingDays ? Math.round(totalMs / workingDays) : 0,
            overtimeMs: totalMs - workingDays * db.user.workHours * HOUR,
        },
        byDay,
        byProject,
    };
});
