const theme = require("../styles/theme");

function resetPasswordTemplate({ name, otp, expiresIn }) {
  const digits = otp.split("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>FOODSENTRY — Password Reset</title>
</head>
<body style="margin:0;background:${
    theme.background
  };font-family:Arial,Helvetica,sans-serif;color:${theme.textPrimary};">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <table width="100%" cellpadding="0" cellspacing="0" style="
        max-width:520px;
        background:${theme.card};
        border-radius:14px;
        border:1px solid ${theme.border};
      ">

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid ${
            theme.border
          };">
            <h2 style="margin:0;color:${theme.brand};">FOODSENTRY</h2>
            <p style="margin:6px 0 0;font-size:13px;color:${theme.textMuted};">
              Secure Password Reset
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <p style="font-size:14px;line-height:1.6;">
              Hello <strong>${name || "User"}</strong>,
            </p>

            <p style="font-size:14px;line-height:1.6;color:${theme.textMuted};">
              We received a request to reset the password for your FOODSENTRY account.
              Please use the One-Time Password (OTP) below to continue.
            </p>

            <!-- OTP BOXES (UPDATED) -->
            <table align="center" cellpadding="0" cellspacing="0" style="margin:24px auto;">
              <tr>
                ${digits
                  .map(
                    (d) => `
                  <td style="padding:6px;">
                    <div style="
                      width:48px;
                      height:54px;
                      background:${theme.background};
                      border:1px solid ${theme.border};
                      border-radius:8px;
                      text-align:center;
                      line-height:52px;
                      font-size:25px;
                      font-weight:700;
                      color:${theme.brand};
                    ">
                      ${d}
                    </div>
                  </td>
                `
                  )
                  .join("")}
              </tr>
            </table>

            <p style="font-size:13px;color:${theme.textMuted};">
              This OTP is valid for <b style="color:${
                theme.brand
              };">${expiresIn}</b> <span style="color:${
    theme.brand
  };">minutes</span>.Do not share this OTP with anyone.
            </p>

            <p style="font-size:13px;color:${theme.textMuted};margin-top:20px;">
              If you did not request a password reset, please ignore this email.
              Your account remains secure.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="
            padding:18px 28px;
            border-top:1px solid ${theme.border};
            font-size:12px;
            color:${theme.textMuted};
            text-align:center;
          ">
            © FOODSENTRY Security Team
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
}

module.exports = resetPasswordTemplate;
