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
  joinLink: string;
  projectName: string;
  recipientEmail: string;
  joinCode: string;
  recipientName?: string;
  signupLink?: string;
};

export const sendProjectInviteEmail = async ({
  joinLink,
  projectName,
  recipientEmail,
  joinCode,
  recipientName,
  signupLink,
}: SendProjectInviteEmailArgs) => {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const requiresSignup = Boolean(signupLink);
  const introText = requiresSignup
    ? `You have been invited to join the project "${projectName}". Please sign up first, then use the joining code below.`
    : `You have been invited to join the project "${projectName}".`;
  const actionText = requiresSignup
    ? `Sign up here: ${signupLink}

After signing up, click join workspace and enter the code below.

Join workspace here: ${joinLink}`
    : `Join here: ${joinLink}`;
  const actionHtml = requiresSignup
    ? `
        <p style="margin-top: 16px;">
          <a href="${signupLink}" style="display: inline-block; padding: 10px 16px; border-radius: 8px; background: #111827; color: #ffffff; text-decoration: none; margin-right: 8px;">
            Sign Up
          </a>
          <a href="${joinLink}" style="display: inline-block; padding: 10px 16px; border-radius: 8px; background: #374151; color: #ffffff; text-decoration: none;">
            Join Workspace
          </a>
        </p>
        <p>After signing up, click join workspace and enter the code below.</p>
      `
    : `
        <p style="margin-top: 16px;">
          <a href="${joinLink}" style="display: inline-block; padding: 10px 16px; border-radius: 8px; background: #111827; color: #ffffff; text-decoration: none;">
            Join Project
          </a>
        </p>
      `;

  return sendEmail({
    to: [
      {
        email: recipientEmail,
        name: recipientName,
      },
    ],
    subject: `Invitation to join ${projectName}`,
    textContent: `${greeting}

${introText}

Your joining code is: ${joinCode}

${actionText}
`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>${greeting}</p>
        <p>${introText.replace(projectName, `<strong>${projectName}</strong>`)}</p>
        <p>Your joining code is:</p>
        <div style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #f3f4f6; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
          ${joinCode}
        </div>
        ${actionHtml}
      </div>
    `,
  });
};
