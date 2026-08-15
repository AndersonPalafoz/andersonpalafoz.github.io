export function buildWhatsAppMessageLink(phone: string, text: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/55${cleanPhone}?text=${encoded}`;
}

export function buildDeadlineReminderText(activityTitle: string, dueDate: Date, courseName: string) {
  const dateStr = new Date(dueDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Olá! Lembrete da atividade "${activityTitle}" do curso "${courseName}". O prazo vence em ${dateStr}. Não deixe para última hora! — Professor Anderson Palafoz`;
}
