import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "yandex",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.BASE_URL}/${process.env.VERIFY_EMAIL_ROUTE}/?token=${token}&email=${email}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER + "@yandex.ru",
    to: email,
    subject: "Подтвердите ваш email",
    html: `Перейдите по ссылке для подтверждения: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
};
