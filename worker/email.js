import { Resend } from "resend";

const getFrom = () => process.env.EMAIL_FROM || "DownAlert <onboarding@resend.dev>";

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const send = async ({ to, subject, text }) => {
  const client = getClient();
  const { data, error } = await client.emails.send({
    from: getFrom(),
    to,
    subject,
    text,
  });
  if (error) {
    throw new Error(error.message);
  }
  return { id: data.id };
};

export const sendDownEmail = async ({ to, monitorName, url, statusCode, error }) => {
  const subject = `DownAlert: ${monitorName} is DOWN`;
  const text = [
    `Your monitor "${monitorName}" is DOWN.`,
    ``,
    `URL: ${url}`,
    `Status code: ${statusCode ?? "no response"}`,
    `Error: ${error ?? "none"}`,
    `Checked at: ${new Date().toISOString()}`,
    ``,
    `We will notify you again when it recovers.`,
    `— DownAlert`,
  ].join("\n");
  return send({ to, subject, text });
};

export const sendRecoveryEmail = async ({ to, monitorName, url }) => {
  const subject = `DownAlert: ${monitorName} recovered`;
  const text = [
    `Good news — your monitor "${monitorName}" is back UP.`,
    ``,
    `URL: ${url}`,
    `Recovered at: ${new Date().toISOString()}`,
    ``,
    `— DownAlert`,
  ].join("\n");
  return send({ to, subject, text });
};

export default { isEmailConfigured, sendDownEmail, sendRecoveryEmail };
