// const transporter = require("../config/email");

// async function sendEmail({ to, subject, text, html }) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM, 
//       to,
//       subject,
//       text,
//       html,
//     });

//     console.log("Email Sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// }

// module.exports = sendEmail;

const brevoClient = require("../config/email");

async function sendEmail({ to, subject, html }) {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);

    console.log("Brevo Email Sent:", response.messageId || response);
    return response;
  } catch (error) {
    console.error(
      "Brevo Email Error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = sendEmail;


