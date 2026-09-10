import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "CoffeeLab <onboarding@resend.dev>";

// No RESEND_API_KEY means there's no provider configured (e.g. local dev
// without one set up) — callers fall back to surfacing the link directly
// instead of pretending an email went out.
export const emailIsConfigured = resend !== null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.info(`[email] RESEND_API_KEY not set — skipping send to ${to}: "${subject}"`);
    return { sent: false as const };
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
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
      `<p style="line-height: 1.5; margin: 0 0 24px;">Привет, ${name}! Осталось подтвердить email, чтобы начать копить баллы за заказы.</p>${button(url, "Подтвердить email")}`,
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
