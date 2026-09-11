import { Resend } from "resend";
import { formatPrice } from "@/lib/format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "CoffeeLab <onboarding@resend.dev>";

// No RESEND_API_KEY means there's no provider configured (e.g. local dev
// without one set up) — callers fall back to surfacing the link directly
// instead of pretending an email went out.
export const emailIsConfigured = resend !== null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function send(
  to: string,
  subject: string,
  html: string,
  options: { replyTo?: string } = {},
) {
  if (!resend) {
    console.info(`[email] RESEND_API_KEY not set — skipping send to ${to}: "${subject}"`);
    return { sent: false as const };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo: options.replyTo,
  });
  if (error) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, error);
    return { sent: false as const };
  }
  return { sent: true as const };
}

function layout(title: string, bodyHtml: string) {
  return `
    <div style="font-family: system-ui, sans-serif; background: #f4ede4; padding: 32px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; color: #2b1a12;">
        <p style="font-size: 20px; font-weight: 600; margin: 0 0 24px;">☕ CoffeeLab</p>
        <h1 style="font-size: 18px; margin: 0 0 16px;">${title}</h1>
        ${bodyHtml}
        <p style="margin-top: 32px; font-size: 12px; color: #8a7565;">
          Если вы не запрашивали это письмо, просто проигнорируйте его.
        </p>
      </div>
    </div>
  `;
}

function button(url: string, label: string) {
  return `
    <a href="${url}" style="display: inline-block; background: #6f4a2e; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
      ${label}
    </a>
  `;
}

export function sendVerificationEmail(to: string, name: string, url: string) {
  return send(
    to,
    "Подтвердите почту — CoffeeLab",
    layout(
      "Подтвердите почту",
      `<p style="line-height: 1.5; margin: 0 0 24px;">Привет, ${escapeHtml(name)}! Осталось подтвердить email, чтобы начать копить баллы за заказы.</p>${button(url, "Подтвердить email")}`,
    ),
  );
}

export function sendPasswordResetEmail(to: string, url: string) {
  return send(
    to,
    "Восстановление пароля — CoffeeLab",
    layout(
      "Сброс пароля",
      `<p style="line-height: 1.5; margin: 0 0 24px;">Мы получили запрос на сброс пароля. Ссылка действует 1 час.</p>${button(url, "Сбросить пароль")}`,
    ),
  );
}

export function sendContactNotification(name: string, fromEmail: string, message: string) {
  const inbox = process.env.CONTACT_INBOX_EMAIL;
  if (!inbox) {
    console.info(
      `[email] CONTACT_INBOX_EMAIL not set — skipping contact notification from ${fromEmail}`,
    );
    return Promise.resolve({ sent: false as const });
  }

  return send(
    inbox,
    `Сообщение с сайта — ${name}`,
    layout(
      "Новое сообщение с формы обратной связи",
      `<p style="margin: 0 0 12px;"><strong>${escapeHtml(name)}</strong> · ${escapeHtml(fromEmail)}</p>
       <p style="line-height: 1.5; white-space: pre-wrap;">${escapeHtml(message)}</p>`,
    ),
    { replyTo: fromEmail },
  );
}

export function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number | string;
    items: { productName: string; variantName: string; quantity: number; unitPrice: number | string }[];
  },
) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 6px 0; border-bottom: 1px solid #eee;">
            ${escapeHtml(item.productName)} — ${escapeHtml(item.variantName)} × ${item.quantity}
          </td>
          <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right;">
            ${formatPrice(Number(item.unitPrice) * item.quantity)}
          </td>
        </tr>`,
    )
    .join("");

  return send(
    to,
    `Заказ ${order.orderNumber} принят — CoffeeLab`,
    layout(
      `Заказ ${order.orderNumber} принят`,
      `<p style="line-height: 1.5; margin: 0 0 16px;">Привет, ${escapeHtml(name)}! Мы получили ваш заказ и уже готовим его.</p>
       <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${rows}</table>
       <p style="margin: 16px 0 24px; font-size: 16px; font-weight: 600; text-align: right;">
         Итого: ${formatPrice(order.totalAmount)}
       </p>
       ${button(`${process.env.APP_URL}/orders/${order.id}`, "Отследить заказ")}`,
    ),
  );
}

export function sendOrderStatusEmail(
  to: string,
  name: string,
  order: { id: string; orderNumber: string },
  statusLabel: string,
) {
  return send(
    to,
    `Заказ ${order.orderNumber}: ${statusLabel} — CoffeeLab`,
    layout(
      "Статус заказа изменился",
      `<p style="line-height: 1.5; margin: 0 0 24px;">Привет, ${escapeHtml(name)}! Заказ <strong>${escapeHtml(order.orderNumber)}</strong> теперь в статусе «${escapeHtml(statusLabel)}».</p>${button(`${process.env.APP_URL}/orders/${order.id}`, "Открыть заказ")}`,
    ),
  );
}
