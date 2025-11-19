const transporter = require("../config/email");

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"FOODSENTRY" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email Sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
