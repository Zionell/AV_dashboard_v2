import { readFileSync } from 'node:fs';
import { fetch as $fetchRaw } from '@nuxt/test-utils/e2e';
import { createTestPrisma } from '../fixtures/client.ts';
import { resetDatabase } from '../fixtures/seed.ts';
import { FIXTURE_PASSWORD } from '../fixtures/ids.ts';

/**
 * Подставляет тестовую строку подключения ДО старта Nuxt: сервер поднимается
 * тем же кодом, что и в проде, но смотрит в тестовую базу.
 */
export function useTestDatabaseEnv() {
    const raw = readFileSync(new URL('../../.env.test', import.meta.url), 'utf8');
    const url = raw.match(/^DATABASE_URL=["']?(.+?)["']?$/m)?.[1];

    if (!url) throw new Error('В .env.test нет DATABASE_URL');
    if (!/test/i.test(new URL(url).pathname)) {
        throw new Error('Отказ: .env.test указывает на базу без «test» в имени');
    }

    process.env.DATABASE_URL = url;
    process.env.TEST_DATABASE_URL = url;
    // Dev-сервер под тестами наследует этот флаг и выключает CSRF (см. nuxt.config).
    process.env.NUXT_DISABLE_CSRF = 'true';
}

export const testDb = () => createTestPrisma();

/** Возвращает базу к состоянию фикстур. Вызывается перед каждым тестом. */
export async function resetFixtures() {
    const db = testDb();

    try {
        await resetDatabase(db);
    } finally {
        await db.$disconnect();
    }
}

type FetchResult<T> = { status: number; data: T; headers: Headers };

/**
 * Клиент с сессионной cookie. Nuxt-auth-utils держит сессию в cookie, а тестовый
 * $fetch их не хранит — поэтому копим Set-Cookie руками.
 */
export class ApiClient {
    private cookies = new Map<string, string>();

    private cookieHeader(): string {
        return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    }

    private absorb(headers: Headers) {
        for (const raw of headers.getSetCookie?.() ?? []) {
            const [pair] = raw.split(';');
            const idx = pair.indexOf('=');

            if (idx > 0) this.cookies.set(pair.slice(0, idx), pair.slice(idx + 1));
        }
    }

    async request<T = unknown>(
        path: string,
        options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
    ): Promise<FetchResult<T>> {
        const res = await $fetchRaw(path, {
            method: options.method ?? 'GET',
            headers: {
                ...(this.cookies.size ? { cookie: this.cookieHeader() } : {}),
                ...(options.body ? { 'content-type': 'application/json' } : {}),
                ...options.headers,
            },
            ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        });

        this.absorb(res.headers);

        const text = await res.text();

        let data: T;

        try {
            data = text ? JSON.parse(text) : (undefined as T);
        } catch {
            data = text as T;
        }

        return { status: res.status, data, headers: res.headers };
    }

    get<T = unknown>(path: string) {
        return this.request<T>(path);
    }

    post<T = unknown>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'POST', body });
    }

    patch<T = unknown>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'PATCH', body });
    }

    put<T = unknown>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'PUT', body });
    }

    delete<T = unknown>(path: string) {
        return this.request<T>(path, { method: 'DELETE' });
    }

    /** Логин через настоящий эндпоинт — сессия дальше живёт в cookie клиента. */
    async login(email: string, password: string = FIXTURE_PASSWORD) {
        const res = await this.post('/api/auth/login', { email, password });

        if (res.status !== 200) {
            throw new Error(`Не удалось войти как ${email}: ${res.status} ${JSON.stringify(res.data)}`);
        }

        return res;
    }
}

/** Клиент, уже вошедший под указанной почтой. */
export async function signedInAs(email: string): Promise<ApiClient> {
    const client = new ApiClient();

    await client.login(email);

    return client;
}
