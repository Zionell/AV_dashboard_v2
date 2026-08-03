/**
 * Фиксированные ObjectId для фикстур: тесты ссылаются на сущности по этим
 * константам, а не по результату вставки. Значения читаемые, чтобы в дампах
 * и логах было видно, что за объект.
 */
const oid = (prefix: string, n: number) => (prefix + String(n).padStart(24 - prefix.length, '0')).slice(0, 24);

export const IDS = {
    company: {
        /** PRO: 5 мест, 5 проектов, 3 GB. Основная «рабочая» компания фикстур. */
        acme: oid('c0', 1),
        /** FREE: 1 место — занято владельцем, используется для гейта приглашений. */
        solo: oid('c0', 2),
        /** Чужая компания для проверок межтенантной изоляции. */
        rival: oid('c0', 3),
    },
    user: {
        acmeOwner: oid('c1', 1),
        acmeManager: oid('c1', 2),
        acmeEmployee: oid('c1', 3),
        soloOwner: oid('c1', 4),
        rivalOwner: oid('c1', 5),
        /** Зарегистрирован, но компании нет — принимает приглашения. */
        nomad: oid('c1', 6),
    },
    project: {
        /** Участники: owner, manager, employee. */
        apollo: oid('c2', 1),
        /** Только owner — manager и employee его не видят. */
        secret: oid('c2', 2),
        rivalProject: oid('c2', 3),
    },
    todo: {
        apolloOpen: oid('c3', 1),
        apolloInProgress: oid('c3', 2),
        secretTask: oid('c3', 3),
    },
    category: {
        acmeDocs: oid('c4', 1),
        rivalDocs: oid('c4', 2),
    },
    material: {
        acmeGuide: oid('c5', 1),
    },
    attachment: {
        /** Занимает место в квоте ACME. */
        apolloShot: oid('c6', 1),
    },
    invitation: {
        /** Живое приглашение в ACME на почту nomad'а. */
        pending: oid('c7', 1),
        /** Просроченное. */
        expired: oid('c7', 2),
        /** Уже принятое. */
        accepted: oid('c7', 3),
    },
} as const;

/** Пароль всех пользователей фикстур. */
export const FIXTURE_PASSWORD = 'test1234';

export const FIXTURE_EMAILS = {
    acmeOwner: 'owner@acme.test',
    acmeManager: 'manager@acme.test',
    acmeEmployee: 'employee@acme.test',
    soloOwner: 'owner@solo.test',
    rivalOwner: 'owner@rival.test',
    nomad: 'nomad@nowhere.test',
} as const;

/** Токены приглашений — тесты ходят по ним как по ссылкам из письма. */
export const FIXTURE_TOKENS = {
    pending: 'pending-invite-token-0000000000000000',
    expired: 'expired-invite-token-0000000000000000',
    accepted: 'accepted-invite-token-000000000000000',
} as const;
