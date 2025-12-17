const theme = require("../styles/theme");

function welcomeTemplate({ name }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to FOODSENTRY</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:${theme.background};
  font-family: Inter, Arial, Helvetica, sans-serif;
  color:${theme.textPrimary};
">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="
        max-width:620px;
        background:${theme.card};
        border-radius:14px;
        border:1px solid ${theme.border};
        overflow:hidden;
      ">

        <!-- Header -->
        <tr>
          <td style="
            padding:28px;
            border-bottom:1px solid ${theme.border};
          ">
            <h1 style="
              margin:0;
              font-size:22px;
              font-weight:600;
              color:${theme.brand};
              letter-spacing:0.4px;
            ">
              Welcome to FOODSENTRY
            </h1>

            <p style="
              margin:8px 0 0;
              font-size:14px;
              color:${theme.textMuted};
            ">
              Smart pantry management starts here
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:32px;">

            <p style="
              margin:0 0 14px;
              font-size:15px;
              line-height:1.7;
            ">
              Hello <strong>${name || "there"}</strong>,
            </p>

            <p style="
              margin:0 0 22px;
              font-size:14px;
              line-height:1.7;
              color:${theme.textMuted};
            ">
              We’re glad to have you onboard. FOODSENTRY helps you keep track of
              pantry items, reduce food waste, and stay organized with intelligent
              expiry tracking.
            </p>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0" style="
              margin:24px 0;
              background:${theme.background};
              border-radius:10px;
              padding:18px;
            ">
              <tr>
                <td style="font-size:14px; padding:6px 0;">
                  <strong>Track expiry dates</strong>
                </td>
              </tr>
              <tr>
                <td style="font-size:14px; padding:6px 0;">
                  <strong>Receive timely alerts</strong>
                </td>
              </tr>
              <tr>
                <td style="font-size:14px; padding:6px 0;">
                  <strong>Manage your pantry smarter</strong>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
              <tr>
                <td align="center">
                  <a href="${process.env.APP_URL || "#"}"
                    style="
                      display:inline-block;
                      padding:14px 26px;
                      background:${theme.brand};
                      color:#0f1f18;
                      text-decoration:none;
                      font-size:14px;
                      font-weight:600;
                      border-radius:10px;
                    ">
                     Access Your Dashboard
                  </a>
                </td>
              </tr>
            </table>

            <p style="
              margin:0;
              font-size:13px;
              color:${theme.textMuted};
              line-height:1.6;
            ">
              If you have any questions or need assistance, feel free to reach out.
              We’re here to help you. Make the most of FOODSENTRY.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="
            padding:20px 28px;
            border-top:1px solid ${theme.border};
            font-size:12px;
            color:${theme.textMuted};
            text-align:center;
          ">
            © ${new Date().getFullYear()} FOODSENTRY. All rights reserved.
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

module.exports = welcomeTemplate;
