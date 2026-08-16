export const CONTACT_EMAIL = "palafozanderson@gmail.com";
export const CONTACT_PHONE_DISPLAY = "(71) 9 9122-2257";
export const CONTACT_WHATSAPP_URL = "https://wa.me/5571991222257";
export const CONTACT_LOCATION = "Salvador, Bahia — Brasil";
export const CONTACT_LOCATION_URL =
  "https://www.google.com/maps/search/?api=1&query=Salvador%2C%20Bahia%2C%20Brasil";
export const CONTACT_INSTAGRAM_URL = "https://instagram.com";
export const CONTACT_LINKEDIN_URL = "https://linkedin.com";

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function buildContactMailto({
  name,
  email,
  subject,
  message,
}: ContactMessage) {
  const body = [
    `Nome: ${name.trim()}`,
    `Email: ${email.trim()}`,
    "",
    message.trim(),
  ].join("\n");

  const params = new URLSearchParams({
    subject: `[Contato] ${subject.trim()}`,
    body,
  });

  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}
