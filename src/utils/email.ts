import { env } from "../config/env";

type EmailRecipient = {
  email: string;
  name?: string;
};

type SendEmailArgs = {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
};

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
}: SendEmailArgs) => {
  if (!env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing");
  }

  if (!env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL is missing");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: env.BREVO_SENDER_EMAIL,
        name: env.BREVO_SENDER_NAME,
      },
      to,
      subject,
      htmlContent,
      textContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(`Brevo email send failed: ${errorBody}`) as Error & {
      statusCode?: number;
    };

    error.statusCode = 502;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

type SendProjectInviteEmailArgs = {
  projectName: string;
  recipientEmail: string;
  joinCode: string;
  recipientName?: string;
};

export const sendProjectInviteEmail = async ({
  projectName,
  recipientEmail,
  joinCode,
  recipientName,
}: SendProjectInviteEmailArgs) => {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";

  return sendEmail({
    to: [
      {
        email: recipientEmail,
        name: recipientName,
      },
    ],
    subject: `Invitation to join ${projectName}`,
    textContent: `${greeting}

You have been invited to join the project "${projectName}".

Your joining code is: ${joinCode}
`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>${greeting}</p>
        <p>You have been invited to join the project <strong>${projectName}</strong>.</p>
        <p>Your joining code is:</p>
        <div style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
          ${joinCode}
        </div>
      </div>
    `,
  });
};
