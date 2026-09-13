import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill("admin@coffeelab.dev");
  await page.getByLabel("Пароль").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("admin panel", () => {
  test("a non-admin is redirected away from /admin", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill("customer@coffeelab.dev");
    await page.getByLabel("Пароль").fill("CustomerDemo123!");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("dashboard, orders and analytics render for an admin", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
    await expect(page.getByText("Выручка сегодня")).toBeVisible();

    await page.getByRole("link", { name: "Заказы" }).click();
    await expect(page).toHaveURL(/\/admin\/orders/);
    await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();

    await page.getByRole("link", { name: "Аналитика" }).click();
    await expect(page).toHaveURL(/\/admin\/analytics/);
    await expect(page.getByText("Выручка по категориям")).toBeVisible();
  });

  test("order status transitions are constrained by the state machine", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/orders");

    const firstStatusSelect = page.getByRole("combobox").first();
    await firstStatusSelect.click();
    // Whatever the current status is, its own transition menu never offers
    // to jump straight back to "Ожидает оплаты" (PENDING) — that's not a
    // legal move for any non-initial state in the order state machine.
    await expect(page.getByRole("option", { name: "Ожидает оплаты" })).toHaveCount(0);
  });
});
