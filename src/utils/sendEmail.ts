const nodemailer = require('nodemailer');

interface MailInput {
  email: string;
  subject: string;
  message: string;
}
export const sendEmail = async (options: MailInput) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_EMAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};
