# Auth rework: nuxt-auth-utils, Google OAuth + email/пароль, онбординг /login/new

Дата: 2026-07-04. Ветка: feat/new-nuxt.

## Цель

Закрыть главную дыру безопасности (API без авторизации), заменить самодельный JWT на
`nuxt-auth-utils`, добавить вход по email/паролю и онбординг новых пользователей.

## Решения

- Сессии: `nuxt-auth-utils` (шифрованная httpOnly-cookie, `NUXT_SESSION_PASSWORD`).
  Payload сессии: `{ id, email, role }`. Старый JWT-код (`jsonwebtoken`, `JWT_SALT`,
  cookie `auth_token`) удаляется.
- Пароли: bcryptjs (совместимо с существующими хэшами из `users/password.put.ts`).
- Отдельной регистрации НЕТ. Одна форма входа (email + пароль):
  - email не найден → создаём пользователя (bcrypt-хэш, `hasPassword: true`,
    имя-заглушка из email до `@`) → сессия → редирект `/login/new`;
  - email найден, пароль верен → сессия → `/dashboard` (или `/login/new`, если
    онбординг не пройден);
  - email найден, пароль неверен → 401;
  - аккаунт только-Google (`hash` пуст) → 401 с подсказкой «войдите через Google».
- Признак пройденного онбординга: `companyId != null`. Изменения Prisma-схемы не нужны.
- Email-верификации нет. Инвайтов в существующую компанию нет (позже).

## Сервер

- `server/middleware/auth.ts` — для всех `/api/*`, кроме `/api/auth/*` и
  `/api/_auth/*`: требует сессию (иначе 401), кладёт юзера в `event.context.user`.
- `POST /api/auth/login` — zod (email, пароль min 6), логика login-or-create выше.
  Ответ: `{ onboarded: boolean }`.
- `POST /api/auth/onboarding` — требует сессию; zod (name, companyName, phone?);
  создаёт Company, обновляет юзера (name, phone, companyId, role: OWNER),
  обновляет сессию. Повторный вызов при `companyId != null` → 400.
- `server/routes/auth/google.get.ts` — `defineOAuthGoogleEventHandler` (state-проверка
  в модуле). onSuccess: найти по email / создать (имя, аватар из Google) → сессия →
  редирект `/login/new` (новый) или `/dashboard`.
- Удаляются: `server/api/auth/google.ts`, `server/api/auth/google/callback.ts`,
  `server/api/auth/logout.ts` (logout = встроенный `clear()` сессии).
- `users/me.get.ts` переводится на `requireUserSession`.
- Rate limiter `nuxt-security` на `/api/auth/**`.
- Заодно: убрать прод-кэш `'/api/*'` из routeRules (п.2 общего плана — ломает
  авторизованные ответы).

## Клиент

- `AuthForm.vue`: только форма логина + кнопка Google (`/auth/google`);
  `AuthRegistration.vue` удаляется.
- `AuthLogin.vue`: сабмит на `/api/auth/login`, по `onboarded` → `/dashboard` или
  `/login/new`.
- `app/pages/login/new.vue` (layout auth): имя (предзаполнено из store), название
  компании, телефон (опц.) → `POST /api/auth/onboarding` → `/dashboard`.
- `auth.global.ts`: гость → `/`; залогинен без онбординга → всегда `/login/new`;
  залогинен с онбордингом → с `/` и `/login/new` на `/dashboard`.
- `useAuth.ts`: signIn(google) → `/auth/google`; signOut → `useUserSession().clear()`.
- Store/плагин остаются: профиль из `/api/users/me`. `ERoutes` + `LOGIN_NEW`.

## Env

Добавить: `NUXT_SESSION_PASSWORD` (32+ симв.), `NUXT_OAUTH_GOOGLE_CLIENT_ID`,
`NUXT_OAUTH_GOOGLE_CLIENT_SECRET`, `NUXT_OAUTH_GOOGLE_REDIRECT_URL`.
Убрать: `JWT_SALT`, `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` из runtimeConfig.
Обновить `.env.example`.

## Вне скоупа (следующие пункты общего плана)

- Перевод всех эндпоинтов на `context.user.id` вместо userId из query/body,
  скоупинг данных по компании.
- Валидация zod и единый формат ошибок во всех эндпоинтах.
- Восстановление пароля, email-верификация, инвайты.

## Проверка

Ручная через dev-сервер: новый email → /login/new → онбординг → дашборд; повторный
вход → сразу дашборд; неверный пароль → ошибка; Google-флоу (новый/существующий);
`/api/todo` без cookie → 401; logout → редирект на /.
