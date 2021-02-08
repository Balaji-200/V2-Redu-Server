const nodeMailer = require("nodemailer");
const { generateResetPasswordLink } = require("./authenticate");
if(process.env.NODE_ENV == 'development')
  require("dotenv").config({ path: "./config.env" });

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports.sendConfirmationMail = (toAddr) => {
  const mailOptions = {
    from: `"V2-Redu"<noreply@${process.env.MAIL_USER}>`,
    to: toAddr,
    subject: "Confirmation of your account",
    html: `<div>
      <h1>Successfully created Account!!</h1>
      <p>This is an auto generated email.</p>
      <p><b>Please do not reply to this email</b></p>
      </div>`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
    else {
      console.log(`Email sent To ${toAddr}`);
    }
  });
};

module.exports.sendResetPasswordMail = (toAddr) => {
  const resetPasswordLink = generateResetPasswordLink({ email: toAddr });
  const mailOptions = {
    from: `"V2-Redu"<noreply@${process.env.MAIL_USER}>`,
    to: toAddr,
    subject: "Reset Password for your account",
    html: `<div>
            <p>Please click on the link to change your password.</p>
            <p><a href="${resetPasswordLink}">Click Here</a></p>
            <p>This is a auto generated email. </p>
            <p><b>Please Do not reply to this email</b></p>
            </div>`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
    else {
      console.log(`Email sent To ${toAddr}`);
    }
  });
};
