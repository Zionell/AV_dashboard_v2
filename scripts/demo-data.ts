/**
 * Фикстуры демо-данных: чистые данные и генераторы, без обращений к базе.
 * Заливает их в базу `scripts/seed-demo.ts`; отдельный файл — чтобы состав данных
 * можно было проверить без подключения к MongoDB.
 */
import { EUserRole } from '../shared/types/user.ts';
import { ETodoStatus } from '../shared/types/times.ts';
import { ETaskPriority } from '../shared/types/todo.ts';
import { EProjectEventType } from '../shared/types/projects.ts';

const HOUR = 60 * 60 * 1000;

/** Вход в демо. Пароль общий для всех демо-пользователей — можно залогиниться любой ролью. */
export const DEMO_EMAIL = 'test@test.com';
export const DEMO_PASSWORD = 'test12345';

/**
 * Фиксированные ObjectId — по ним скрипт находит и удаляет прошлый сид.
 * Префикс «d» во всех id, чтобы демо-сущности были узнаваемы в дампах.
 */
const oid = (prefix: string, n: number) => (prefix + String(n).padStart(24 - prefix.length, '0')).slice(0, 24);

export const IDS = {
    company: oid('d0', 1),
    user: {
        owner: oid('d1', 1),
        manager: oid('d1', 2),
        employee: oid('d1', 3),
        designer: oid('d1', 4),
    },
    project: {
        crm: oid('d2', 1),
        shop: oid('d2', 2),
        analytics: oid('d2', 3),
        site: oid('d2', 4),
    },
    category: {
        docs: oid('d4', 1),
        design: oid('d4', 2),
        reference: oid('d4', 3),
    },
} as const;

export const todoId = (n: number) => oid('d3', n);

/** Пользователи демо-компании. Роли разные — видно, как работают ограничения доступа. */
export const USERS = [
    {
        id: IDS.user.owner,
        email: DEMO_EMAIL,
        name: 'Test User',
        role: EUserRole.OWNER,
        bio: 'Product designer & founder',
        workHours: 8,
    },
    {
        id: IDS.user.manager,
        email: 'maria@preview.demo',
        name: 'Maria Chen',
        role: EUserRole.MANAGER,
        bio: 'Delivery manager',
        workHours: 8,
    },
    {
        id: IDS.user.employee,
        email: 'sam@preview.demo',
        name: 'Sam Diallo',
        role: EUserRole.EMPLOYEE,
        bio: 'Backend developer',
        workHours: 6,
    },
    {
        id: IDS.user.designer,
        email: 'nina@preview.demo',
        name: 'Nina Petrova',
        role: EUserRole.EMPLOYEE,
        bio: 'Frontend developer',
        workHours: 8,
    },
];

export const PROJECTS = [
    {
        id: IDS.project.crm,
        name: 'CRM System',
        description: 'Internal CRM revamp',
        client: 'Acme Inc',
        priority: ETaskPriority.HIGH,
        budget: 48000,
        startsInDays: -60,
        deadlineInDays: 30,
        members: [IDS.user.owner, IDS.user.manager, IDS.user.employee],
    },
    {
        id: IDS.project.shop,
        name: 'E-Commerce Platform',
        description: 'Storefront and checkout',
        client: 'ShopNow',
        priority: ETaskPriority.MEDIUM,
        budget: 75000,
        startsInDays: -45,
        deadlineInDays: 45,
        members: [IDS.user.owner, IDS.user.manager, IDS.user.employee, IDS.user.designer],
    },
    {
        id: IDS.project.analytics,
        name: 'Analytics Platform',
        description: 'Dashboards and reports',
        client: 'DataCorp',
        priority: ETaskPriority.MEDIUM,
        budget: 32000,
        startsInDays: -30,
        deadlineInDays: 60,
        members: [IDS.user.owner, IDS.user.designer],
    },
    {
        id: IDS.project.site,
        name: 'Website Redesign',
        description: 'Marketing site refresh',
        client: 'Bright Studio',
        priority: ETaskPriority.LOW,
        budget: 18000,
        startsInDays: -20,
        deadlineInDays: 14,
        members: [IDS.user.owner, IDS.user.manager, IDS.user.designer],
    },
];

/** `dueInDays: null` — задача без срока; отрицательные значения дают просрочку. */
export const TODOS = [
    {
        n: 1,
        name: 'API Authentication',
        description: 'OAuth + sessions',
        status: ETodoStatus.IN_PROGRESS,
        priority: ETaskPriority.HIGH,
        dueInDays: 0,
        estimateHours: 16,
        projectId: IDS.project.crm,
        executorId: IDS.user.owner,
        authorId: IDS.user.owner,
    },
    {
        n: 2,
        name: 'Dashboard redesign',
        description: 'New KPI layout',
        status: ETodoStatus.TODO,
        priority: ETaskPriority.MEDIUM,
        dueInDays: 1,
        estimateHours: 12,
        projectId: IDS.project.shop,
        executorId: IDS.user.owner,
        authorId: IDS.user.manager,
    },
    {
        n: 3,
        name: 'Database optimization',
        description: 'Indexes and query plans',
        status: ETodoStatus.TODO,
        priority: ETaskPriority.MEDIUM,
        dueInDays: 3,
        estimateHours: 8,
        projectId: IDS.project.analytics,
        executorId: IDS.user.owner,
        authorId: IDS.user.owner,
    },
    {
        n: 4,
        name: 'User profile settings',
        description: 'Avatar and preferences',
        status: ETodoStatus.REVIEW,
        priority: ETaskPriority.LOW,
        dueInDays: 5,
        estimateHours: 6,
        projectId: IDS.project.crm,
        executorId: IDS.user.owner,
        authorId: IDS.user.employee,
    },
    {
        n: 5,
        name: 'Checkout flow',
        description: 'Payment integration',
        status: ETodoStatus.IN_PROGRESS,
        priority: ETaskPriority.HIGH,
        dueInDays: -1,
        estimateHours: 20,
        projectId: IDS.project.shop,
        executorId: IDS.user.employee,
        authorId: IDS.user.manager,
    },
    {
        n: 6,
        name: 'Product catalog',
        description: 'Category tree',
        status: ETodoStatus.DONE,
        priority: ETaskPriority.MEDIUM,
        dueInDays: -3,
        estimateHours: 10,
        projectId: IDS.project.shop,
        executorId: IDS.user.employee,
        authorId: IDS.user.manager,
    },
    {
        n: 7,
        name: 'Report builder',
        description: 'Custom reports',
        status: ETodoStatus.TODO,
        priority: ETaskPriority.MEDIUM,
        dueInDays: 7,
        estimateHours: 24,
        projectId: IDS.project.analytics,
        executorId: IDS.user.designer,
        authorId: IDS.user.owner,
    },
    {
        n: 8,
        name: 'Chart components',
        description: 'Reusable charts',
        status: ETodoStatus.DONE,
        priority: ETaskPriority.LOW,
        dueInDays: -2,
        estimateHours: 14,
        projectId: IDS.project.analytics,
        executorId: IDS.user.designer,
        authorId: IDS.user.owner,
    },
    {
        n: 9,
        name: 'Landing hero',
        description: 'Above the fold',
        status: ETodoStatus.REVIEW,
        priority: ETaskPriority.MEDIUM,
        dueInDays: 2,
        estimateHours: 8,
        projectId: IDS.project.site,
        executorId: IDS.user.manager,
        authorId: IDS.user.owner,
    },
    {
        n: 10,
        name: 'SEO metadata',
        description: 'OpenGraph + sitemap',
        status: ETodoStatus.TODO,
        priority: ETaskPriority.LOW,
        dueInDays: null,
        estimateHours: 4,
        projectId: IDS.project.site,
        executorId: IDS.user.owner,
        authorId: IDS.user.manager,
    },
    {
        n: 11,
        name: 'Contacts import',
        description: 'CSV import',
        status: ETodoStatus.DONE,
        priority: ETaskPriority.MEDIUM,
        dueInDays: -5,
        estimateHours: 6,
        projectId: IDS.project.crm,
        executorId: IDS.user.owner,
        authorId: IDS.user.owner,
    },
    {
        n: 12,
        name: 'Email templates',
        description: 'Transactional emails',
        status: ETodoStatus.TODO,
        priority: ETaskPriority.LOW,
        dueInDays: 4,
        estimateHours: 5,
        projectId: IDS.project.crm,
        executorId: IDS.user.manager,
        authorId: IDS.user.owner,
    },
];

export const CATEGORIES = [
    { id: IDS.category.docs, label: 'Docs', color: 'blue' },
    { id: IDS.category.design, label: 'Design', color: 'purple' },
    { id: IDS.category.reference, label: 'Reference', color: 'green' },
];

export const MATERIALS = [
    {
        name: 'Brand guidelines',
        description: 'Логотип, палитра, типографика',
        sourceLink: 'https://preview.demo/brand',
        categoryId: IDS.category.design,
        projectId: IDS.project.site,
        authorId: IDS.user.owner,
    },
    {
        name: 'API reference',
        description: 'Схемы эндпоинтов и примеры запросов',
        sourceLink: 'https://preview.demo/api',
        categoryId: IDS.category.docs,
        projectId: IDS.project.crm,
        authorId: IDS.user.manager,
    },
    {
        name: 'Component library',
        description: 'Общие UI-компоненты',
        sourceLink: 'https://preview.demo/ui',
        categoryId: IDS.category.reference,
        projectId: null,
        authorId: IDS.user.owner,
    },
];

export const COMMENTS = [
    { todo: 1, authorId: IDS.user.manager, text: 'Refresh-токены тоже нужны — добавь в этот же спринт.', agoDays: 2 },
    { todo: 1, authorId: IDS.user.owner, text: 'Ок, доделаю после сессий.', agoDays: 1 },
    { todo: 5, authorId: IDS.user.manager, text: 'Срок вчера — что по интеграции с платёжкой?', agoDays: 1 },
    { todo: 5, authorId: IDS.user.employee, text: 'Sandbox работает, жду ключи для прода.', agoDays: 0 },
    { todo: 9, authorId: IDS.user.owner, text: 'Заголовок стал лучше, беру на ревью.', agoDays: 1 },
];

/**
 * Детерминированный псевдослучайный генератор: часы в сессиях и распределение задач
 * не должны меняться от запуска к запуску — иначе графики каждый раз выглядят иначе.
 */
function makeRandom(seed: number) {
    let state = seed;

    return () => {
        state = (state * 1103515245 + 12345) % 2147483648;

        return state / 2147483648;
    };
}

/** Дата от начала текущего дня со сдвигом в днях и часом внутри дня. */
export function dayAt(offsetDays: number, hours: number, minutes = 0): Date {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    date.setHours(hours, minutes, 0, 0);

    return date;
}

/**
 * Дата не позже «сейчас». Сид запускают в любое время суток, а записи с будущими
 * датами ломают и ленты, и подсчёт времени — поэтому всё, что «на сегодня», подрезаем.
 */
function past(date: Date): Date {
    const now = Date.now();

    return date.getTime() < now ? date : new Date(now);
}

/** Время комментария: одинаковое в самом комментарии и в событии COMMENT_ADDED. */
export function commentAt(agoDays: number): Date {
    return past(dayAt(-agoDays, 16));
}

/**
 * Сессии времени за последние 14 дней (столько по умолчанию берёт times/stats) —
 * без них на страницах Times и в статистике компании пусто. Выходные пропускаем,
 * длительность сессии = updatedAt − createdAt, как её считает API.
 *
 * Сегодняшний день заполняется только по текущий момент: сессия, которая ещё не
 * успела бы состояться (или короче 20 минут), не создаётся.
 */
export function buildTimes() {
    const random = makeRandom(20260813);
    const rows: { userId: string; todoId: string; active: boolean; createdAt: Date; updatedAt: Date }[] = [];
    const MIN_SESSION = 20 * 60 * 1000;

    const pushSession = (userId: string, todo: string, start: Date, end: Date) => {
        const finish = past(end);

        if (start.getTime() > Date.now() || finish.getTime() - start.getTime() < MIN_SESSION) return;

        rows.push({ userId, todoId: todo, active: false, createdAt: start, updatedAt: finish });
    };

    // Задачи, по которым человек может логировать время — только свои.
    const todosByUser = new Map<string, string[]>();

    for (const todo of TODOS) {
        const list = todosByUser.get(todo.executorId) ?? [];

        list.push(todoId(todo.n));
        todosByUser.set(todo.executorId, list);
    }

    for (const user of USERS) {
        const userTodos = todosByUser.get(user.id) ?? [];

        if (!userTodos.length) continue;

        for (let offset = -13; offset <= 0; offset++) {
            const weekday = dayAt(offset, 12).getDay();

            if (weekday === 0 || weekday === 6) continue;

            // Две сессии в день: до и после обеда — в логах видно дробление дня.
            const morning = 3 + random() * 1.5;
            const afternoon = 2.5 + random() * 1.5;

            const start = dayAt(offset, 9, 30);
            const lunchEnd = new Date(start.getTime() + morning * HOUR);
            const afterLunch = new Date(lunchEnd.getTime() + HOUR);

            const pick = () => userTodos[Math.floor(random() * userTodos.length) % userTodos.length]!;

            pushSession(user.id, pick(), start, lunchEnd);
            pushSession(user.id, pick(), afterLunch, new Date(afterLunch.getTime() + afternoon * HOUR));
        }
    }

    return rows;
}

/** Лента активности проектов: без событий блок на странице проекта пустой. */
export function buildEvents() {
    // `meta` не передаём вовсе, когда данных нет: для nullable Json Prisma требует
    // явный DbNull/JsonNull вместо обычного null.
    const rows: {
        type: EProjectEventType;
        projectId: string;
        actorId: string;
        targetName: string;
        meta?: Record<string, string>;
        createdAt: Date;
    }[] = [];

    for (const [i, project] of PROJECTS.entries()) {
        rows.push({
            type: EProjectEventType.PROJECT_CREATED,
            projectId: project.id,
            actorId: IDS.user.owner,
            targetName: project.name,
            createdAt: dayAt(project.startsInDays, 10),
        });

        const projectTodos = TODOS.filter((t) => t.projectId === project.id);

        // Часы внутри дня набираем сдвигом от 10:00, чтобы j не выносило событие в
        // следующие сутки: события обязаны остаться в прошлом.
        for (const [j, todo] of projectTodos.entries()) {
            rows.push({
                type: EProjectEventType.TASK_CREATED,
                projectId: project.id,
                actorId: todo.authorId,
                targetName: todo.name,
                createdAt: new Date(dayAt(-9 + i, 10).getTime() + j * 2 * HOUR),
            });

            if (todo.status === ETodoStatus.DONE) {
                rows.push({
                    type: EProjectEventType.TASK_STATUS_CHANGED,
                    projectId: project.id,
                    actorId: todo.executorId,
                    targetName: todo.name,
                    meta: { from: ETodoStatus.IN_PROGRESS, to: ETodoStatus.DONE },
                    createdAt: new Date(dayAt(-4 + i, 12).getTime() + j * HOUR),
                });
            }
        }
    }

    for (const comment of COMMENTS) {
        const todo = TODOS.find((t) => t.n === comment.todo)!;

        rows.push({
            type: EProjectEventType.COMMENT_ADDED,
            projectId: todo.projectId,
            actorId: comment.authorId,
            targetName: todo.name,
            createdAt: commentAt(comment.agoDays),
        });
    }

    return rows;
}
