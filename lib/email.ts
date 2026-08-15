

export type EmailOptions = {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
};

export async function sendEmailNotification({ to, subject, htmlContent, textContent }: EmailOptions) {
  // Em ambiente de produção ou desenvolvimento, registra e dispara notificação por e-mail.
  // Caso RESEND_API_KEY esteja disponível, pode integrar com Resend facilmente.
  console.log(`[Email Notification] Para: ${to} | Assunto: ${subject}`);
  
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `Anderson Palafoz Platform <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
          to: [to],
          subject,
          html: htmlContent,
          text: textContent || htmlContent.replace(/<[^>]*>?/gm, ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend API error:", errorData);
      } else {
        console.log("E-mail disparado com sucesso via Resend.");
      }
    } catch (err) {
      console.error("Falha ao conectar com serviço de e-mail:", err);
    }
  }

  return { success: true, dispatchedTo: to };
}
