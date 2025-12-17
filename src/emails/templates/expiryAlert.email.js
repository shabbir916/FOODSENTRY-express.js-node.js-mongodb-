const theme = require("../styles/theme");

function expiryAlert(notifications) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0; background:${theme.background}; color:${
    theme.textPrimary
  }; font-family:Inter,Arial,sans-serif;">
</body>
<html>
<head>
  <meta charset="UTF-8" />
  <title>FOODSENTRY — Expiry Alert</title>
</head>
<body style="
  margin:0;
  padding:0;
  background-color:#122019;
  font-family: 'Inter', Arial, sans-serif;
  color:#e3e8e5;
">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          max-width:720px;
          background-color:#1a2c22;
          border-radius:14px;
          overflow:hidden;
          border:1px solid #2a3f33;
        ">

          <!-- Header -->
          <tr>
            <td style="
              padding:24px 28px;
              border-bottom:1px solid #2a3f33;
            ">
              <h1 style="
                margin:0;
                font-size:20px;
                font-weight:600;
                color:#34d585;
                letter-spacing:0.4px;
              ">
                FOODSENTRY
              </h1>
              <p style="
                margin:6px 0 0;
                font-size:14px;
                color:#8fa3a0;
              ">
                Pantry Expiry Notification
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px;">
              <h2 style="
                margin:0 0 10px;
                font-size:18px;
                font-weight:600;
                color:#e3e8e5;
              ">
                Items Expiring Soon
              </h2>

              <p style="
                margin:0 0 20px;
                font-size:14px;
                color:#8fa3a0;
                line-height:1.6;
              ">
                The following items in your pantry are approaching their expiry date.
                Please plan usage accordingly.
              </p>

              <!-- Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="
                border-collapse:collapse;
                background-color:#122019;
                border-radius:10px;
                overflow:hidden;
              ">

                <!-- Table Header -->
                <tr style="background-color:#16281f;">
                  <th align="left" style="
                    padding:14px 16px;
                    font-size:13px;
                    font-weight:500;
                    color:#8fa3a0;
                    border-bottom:1px solid #2a3f33;
                  ">
                    Item
                  </th>
                  <th align="right" style="
                    padding:14px 16px;
                    font-size:13px;
                    font-weight:500;
                    color:#8fa3a0;
                    border-bottom:1px solid #2a3f33;
                  ">
                    Expiry Status
                  </th>
                </tr>

                ${notifications
                  .map((i) => {
                    let badgeBg = "#fbbf24";
                    let badgeText = "#1f2937";
                    let label = `in ${i.daysLeft} day(s)`;

                    if (i.daysLeft === 0) {
                      badgeBg = "#ef4444";
                      badgeText = "#ffffff";
                      label = "Expires Today";
                    }

                    return `
                  <tr>
                    <td style="
                      padding:14px 16px;
                      font-size:14px;
                      border-bottom:1px solid #2a3f33;
                    ">
                      ${i.name}
                    </td>

                    <td align="right" style="
                      padding:14px 16px;
                      border-bottom:1px solid #2a3f33;
                    ">
                      <span style="
                        display:inline-block;
                        padding:6px 12px;
                        font-size:12px;
                        font-weight:500;
                        border-radius:999px;
                        background-color:${badgeBg};
                        color:${badgeText};
                      ">
                        ${label}
                      </span>
                    </td>
                  </tr>
                  `;
                  })
                  .join("")}

              </table>
            </td>
          </tr>

          <!-- Footer -->
<tr>
  <td style="
    padding:18px 28px;
    border-top:1px solid #2a3f33;
    font-size:12px;
    color:#8fa3a0;
  ">
    This is an automated notification from <strong style="color:#34d585;">FOODSENTRY</strong>.  
    If an item has already been consumed or discarded, no action is required.
  </td>
</tr>

<!-- Copyright -->
<tr>
  <td style="
    background-color:#122019;
    padding:14px 28px;
    text-align:center;
    border-top:1px solid #2a3f33;
  ">
    <p style="
      margin:0;
      font-size:11px;
      color:#8fa3a0;
      letter-spacing:0.3px;
    ">
      © ${new Date().getFullYear()} FOODSENTRY. All rights reserved.
    </p>
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

module.exports = expiryAlert;
