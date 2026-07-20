import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  body: string;
}

const sendEmail = async ({ to, subject, body }: SendEmailProps) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html: body,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default sendEmail;
