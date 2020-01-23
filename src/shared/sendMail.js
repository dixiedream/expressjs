const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const logger = require("../config/logger");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  FROM_NAME,
  FROM_EMAIL,
  SENDGRID_API_KEY,
  NODE_ENV
} = process.env;

const sendMail = async ({ email, subject, text }) => {
  logger.info("SEND_MESSAGE_REQUEST", { email, subject });

  const message = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject,
    text,
    html: `<b>${text}</b>`
  };

  if (NODE_ENV === "production") {
    sgMail.setApiKey(SENDGRID_API_KEY);
    try {
      await sgMail.send(message);
      logger.info("SEND_MESSAGE_SUCCEEDED");
    } catch (err) {
      logger.error("SEND_MESSAGE_FAILED", { err: err.toString() });
    }
  } else {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
      }
    });

    try {
      const info = await transporter.sendMail(message);
      logger.info("SEND_MESSAGE_SUCCEEDED", { messageId: info.messageId });
    } catch (err) {
      logger.error("SEND_MESSAGE_FAILED", { err: err.toString() });
    }
  }
};

module.exports = sendMail;
