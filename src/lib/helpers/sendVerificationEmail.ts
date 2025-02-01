import { transporter } from "../../../email/transporter";

interface ISendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: ISendEmailArgs) => {
  await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to,
    subject,
    text: html,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.BASE_URL}/${process.env.VERIFY_EMAIL_ROUTE}/?token=${token}&email=${email}`;

  await sendEmail({
    to: email,
    subject: "Подтвердите ваш email",
    html: `Перейдите по ссылке для подтверждения: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
};

export const sendVerificationCode = async (email: string, code: string) => {
  await sendEmail({
    to: email,
    subject: "Ваш код подтверждения",
    html: `Ваш код подтверждения: <strong>${code}</strong>`,
  });
};
