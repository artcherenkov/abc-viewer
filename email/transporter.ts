import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "yandex",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
