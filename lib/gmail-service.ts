import { google } from "googleapis";

export interface SendGmailOptions {
  accessToken: string;
  refreshToken?: string;
  to: string;
  subject: string;
  htmlBody: string;
}

/**
 * Envia e-mail utilizando a API oficial do Gmail com escopo restrito de envio (gmail.send).
 */
export async function sendEmailViaGmailAPI({ accessToken, refreshToken, to, subject, htmlBody }: SendGmailOptions) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth });

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlBody,
  ];
  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return { success: true, messageId: response.data.id };
}
