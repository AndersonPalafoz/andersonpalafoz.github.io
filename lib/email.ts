

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

export async function notifyStudentAndTeacher({
  studentEmail,
  studentName,
  teacherEmail,
  teacherName,
  subject,
  messageHtml,
}: {
  studentEmail?: string | null;
  studentName?: string | null;
  teacherEmail?: string | null;
  teacherName?: string | null;
  subject: string;
  messageHtml: string;
}) {
  const promises = [];
  if (studentEmail) {
    promises.push(
      sendEmailNotification({
        to: studentEmail,
        subject: `[Aluno] ${subject}`,
        htmlContent: `<div style="font-family:sans-serif;color:#333;line-height:1.6"><h2>Olá, ${studentName || "Aluno(a)"}!</h2>${messageHtml}<hr/><p style="font-size:12px;color:#666">Anderson Palafoz Platform - Ensino de Inglês</p></div>`,
      })
    );
  }
  if (teacherEmail) {
    promises.push(
      sendEmailNotification({
        to: teacherEmail,
        subject: `[Professor] ${subject}`,
        htmlContent: `<div style="font-family:sans-serif;color:#333;line-height:1.6"><h2>Olá, ${teacherName || "Professor(a)"}!</h2>${messageHtml}<hr/><p style="font-size:12px;color:#666">Anderson Palafoz Platform - Painel Docente</p></div>`,
      })
    );
  }
  await Promise.allSettled(promises);
}

