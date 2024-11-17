import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lavishgarg1199@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
