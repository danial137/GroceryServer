import { createTransport } from "nodemailer";
// Create a transporter using SMTP
const transporter = createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  await transporter.sendMail({
    from: "",
    to,
    subject,
    html: body,
  });
};
