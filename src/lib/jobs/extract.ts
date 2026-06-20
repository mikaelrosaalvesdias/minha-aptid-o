// Extração conservadora de e-mail de candidatura da descrição da vaga.
// Só retorna se houver um e-mail válido + palavra-chave de candidatura próxima.
const APPLY_KEYWORDS = [
  "candidatar",
  "candidatura",
  "envie",
  "enviar",
  "currículo",
  "curriculo",
  "resume",
  "apply",
  "contact",
  "contato",
  "interessado",
  "interesse"
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractApplyEmail(text?: string | null): string | null {
  if (!text) return null;

  const lower = text.toLowerCase();
  const emails = text.match(EMAIL_REGEX);
  if (!emails || emails.length === 0) return null;

  // Procura por e-mails que tenham uma palavra-chave de candidatura próxima (200 chars).
  for (const email of emails) {
    const emailIdx = lower.indexOf(email.toLowerCase());
    if (emailIdx < 0) continue;

    const windowStart = Math.max(0, emailIdx - 200);
    const windowEnd = Math.min(lower.length, emailIdx + email.length + 200);
    const window = lower.slice(windowStart, windowEnd);

    for (const keyword of APPLY_KEYWORDS) {
      if (window.includes(keyword)) {
        return email;
      }
    }
  }

  // Se só tem um e-mail na descrição inteira, é provável que seja de contato.
  if (emails.length === 1) {
    return emails[0];
  }

  return null;
}
