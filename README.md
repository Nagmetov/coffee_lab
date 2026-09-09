# CoffeeLab

Многостраничный интернет-магазин кофейни: каталог с полнотекстовым поиском,
корзина и оформление заказа, личный кабинет с программой лояльности и
админ-панель со статистикой и управлением заказами/товарами/промокодами.

## Стек

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (на базе [Base UI](https://base-ui.com))
- PostgreSQL + [Prisma](https://www.prisma.io)
- Redis (гостевая корзина, rate limiting, кеш листингов и статистики)
- Собственная система авторизации: bcrypt + JWT access-токены + ротация
  refresh-токенов, без сторонних auth-провайдеров
- [Recharts](https://recharts.org) для графиков в админ-панели
- Vitest для модульных тестов алгоритмической части

## Архитектура и алгоритмы

Проект специально не ограничивается CRUD — ниже места, где есть нетривиальная логика:

| Что                     | Где                                                                | Идея                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Конечный автомат заказа | [`src/lib/order-state-machine.ts`](src/lib/order-state-machine.ts) | Явная таблица переходов статусов (`PENDING → PAID → PREPARING → READY → COMPLETED`, отмена), проверяется и при оформлении заказа, и при смене статуса админом; история переходов пишется в `OrderStatusHistory` |
| Резервирование остатков | [`src/server/order-service.ts`](src/server/order-service.ts)       | Оформление заказа декрементирует остаток атомарным `UPDATE ... WHERE stock >= quantity` внутри транзакции — конкурентные заказы на последнюю единицу товара не могут оба "выиграть"                             |
| Рекомендации            | [`src/lib/recommendations.ts`](src/lib/recommendations.ts)         | Контентная ранжирующая функция: совпадение категории + пересечение тегов + рейтинг, сглаженный по количеству отзывов                                                                                            |
| Промокоды               | [`src/lib/pricing.ts`](src/lib/pricing.ts)                         | Валидация правил (тип/процент, минимальная сумма, лимит использований, срок действия) с понятными причинами отказа                                                                                              |
| Лояльность              | [`src/lib/loyalty.ts`](src/lib/loyalty.ts)                         | Начисление баллов и расчёт уровня (бронза/серебро/золото/платина)                                                                                                                                               |
| Полнотекстовый поиск    | `prisma/migrations/*_product_search_vector`                        | `tsvector`-триггер на `Product` с весами полей, поиск через `websearch_to_tsquery` + `ts_rank`                                                                                                                  |
| Rate limiting           | [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts)                   | Sliding window на Redis sorted set (без проблемы всплеска на границе окна)                                                                                                                                      |
| Кеш листингов           | [`src/server/product-service.ts`](src/server/product-service.ts)   | Cache-aside в Redis с инвалидацией при записи (заказ, отзыв, изменение товара)                                                                                                                                  |

## Разработка

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

Сид создаёт тестовые аккаунты (см. вывод команды `npm run db:seed`, либо
`prisma/seed.ts`):

- Админ: `admin@coffeelab.dev` / `ChangeMe123!`
- Клиент: `customer@coffeelab.dev` / `CustomerDemo123!`

В проекте нет почтового провайдера — ссылки подтверждения email и сброса
пароля в dev-режиме возвращаются прямо в ответе API и показываются на
странице (см. `devVerificationUrl`/`devResetUrl`).

## Запуск в Docker (полностью, включая приложение)

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Приложение — [http://localhost:3000](http://localhost:3000), Postgres — `5432`, Redis — `6379`.

## Полезные команды

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Vitest
npm run format         # Prettier
npm run db:studio     # Prisma Studio
```

## Структура

```
prisma/               # схема, миграции, сид
src/app/(storefront)/ # публичная часть: меню, товар, корзина, заказы, профиль
src/app/admin/        # админ-панель (RBAC: только role=ADMIN)
src/app/api/          # route handlers
src/app/auth/         # вход/регистрация/восстановление пароля
src/components/       # UI-компоненты (ui/ — shadcn, storefront/, admin/)
src/lib/               # переиспользуемая логика без побочных эффектов
src/server/            # доступ к БД/Redis, бизнес-логика по доменам
tests/                 # модульные тесты (Vitest)
```

## CI

`.github/workflows/ci.yml` на каждый push/PR: lint → typecheck → test → build,
плюс отдельная проверка, что продакшен-образ (`Dockerfile`) собирается.
