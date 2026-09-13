import { test, expect } from "@playwright/test";

test.describe("storefront browsing", () => {
  test("home → menu → product detail", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /CoffeeLab/ })).toBeVisible();

    // Base UI's Button keeps role="button" even rendered as an <a> (via
    // render={<Link/>}), so this is a button by accessible role despite
    // navigating like a link.
    await page.getByRole("button", { name: "Смотреть меню" }).click();
    await expect(page).toHaveURL(/\/menu/);

    const firstProduct = page.getByRole("link").filter({ hasText: /₽/ }).first();
    await firstProduct.click();
    await expect(page.getByRole("button", { name: "В корзину" })).toBeVisible();
  });

  test("search narrows the menu grid", async ({ page }) => {
    await page.goto("/menu");
    await page.getByPlaceholder("Поиск по меню…").fill("эспрессо");
    await page.getByPlaceholder("Поиск по меню…").press("Enter");
    await expect(page.getByText("Эспрессо", { exact: true })).toBeVisible();
  });
});

test.describe("guest cart", () => {
  test("adding a product updates the cart badge and cart page", async ({ page }) => {
    await page.goto("/products/espresso");
    await page.getByRole("button", { name: "В корзину" }).click();
    await expect(page.getByText("Добавлено в корзину")).toBeVisible();

    await page.getByRole("button", { name: "Корзина" }).click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText("Эспрессо")).toBeVisible();
  });
});

test.describe("checkout", () => {
  test("a newly registered customer can place a pickup order", async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e-${stamp}@coffeelab.dev`;

    await page.goto("/products/espresso");
    await page.getByRole("button", { name: "В корзину" }).click();
    await expect(page.getByText("Добавлено в корзину")).toBeVisible();

    await page.goto("/auth/register");
    await page.getByLabel("Имя").fill("E2E Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Пароль").fill("TestPass123");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();
    await expect(page.getByText("Аккаунт создан!")).toBeVisible();

    await page.goto("/checkout");
    await page.getByRole("button", { name: "Подтвердить заказ" }).click();
    await expect(page).toHaveURL(/\/orders\/.+/, { timeout: 10_000 });
    // Match the heading specifically — the order number also appears in
    // Next.js's route-announcer live region, which would otherwise make a
    // plain text locator ambiguous.
    await expect(page.getByRole("heading", { name: /^CL-/ })).toBeVisible();
  });
});
