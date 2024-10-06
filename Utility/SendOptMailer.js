const nodemailer = require("nodemailer");

const sendotp = async (Email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "jeelgor10@gmail.com",
      pass: "xtbp algh gyyw ctge",
      // pass: "J@e#1105%j",
    },
  });

  const mailoption = {
    from: "jeelgor10@gmail.com",
    to: Email,
    subject: `Hello ${Email} this is your Otp`,
    text: `Your OTP is ${otp} please do not share this to anyone `,
  };
  return transporter.sendMail(mailoption);
};

module.exports = sendotp;
