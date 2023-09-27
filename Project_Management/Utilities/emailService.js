const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({path:'./config/.env'})

const userName = process.env.MAIL_USER
const mailPassword = process.env.MAIL_PASSWORD
//console.log(userName, mailPassword)
 

const sendMail = ( to, cc, subject, html, attachments = []) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userName,
      pass: mailPassword,
    },
  });

 

  let mailOptions = {
    from: userName,
    to: to,
    cc: cc,
    subject: subject,
    html: html,
  };

 

  if (attachments.length > 0) {
    mailOptions.attachments = attachments.map((attachment) => {
      return {
        filename: attachment.fileName,
        path: path.join(__dirname, '../', attachment.filePath),
      };
    });
  }

 

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports =  {
    sendMail
}