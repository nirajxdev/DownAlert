import { Resend } from "resend";

const getFrom = () => process.env.EMAIL_FROM || "DownAlert <onboarding@resend.dev>";

const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export const sendTestEmail = async (to) => {
  const client = getClient();
  const { data, error } = await client.emails.send({
    from: getFrom(),
    to,
    subject: "DownAlert test notification",
    text: [
      `This is a test notification from DownAlert.`,
      ``,
      `If you received this email, your alert delivery is working correctly.`,
      `Sent at: ${new Date().toISOString()}`,
      ``,
      `— DownAlert`,
    ].join("\n"),
  });
  if (error) {
    throw new Error(error.message);
  }
  return { id: data.id };
};

export default { sendTestEmail };
