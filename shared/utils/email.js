const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const html = `<h3 style="text-align: left; color:black;">${options.message}</h3><h1 style="color:red; text-align: center; color:red;">${options.verifyCode}</h1>`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: options.email,
    subject: options.subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
