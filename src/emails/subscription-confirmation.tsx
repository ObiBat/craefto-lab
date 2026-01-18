// Logo SVG as inline data URI for email compatibility
const LOGO_SVG = `<svg width="35" height="25" viewBox="0 0 1054 752" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M749.676 71.1953C726.914 71.1953 704.151 79.1059 681.389 94.927C658.626 109.759 638.833 134.48 622.008 169.089C606.174 203.698 596.277 250.667 592.318 309.996H795.696C830.334 309.996 853.592 303.074 865.468 289.231C877.344 274.398 883.282 253.139 883.282 225.452C883.282 179.966 870.416 142.885 844.685 114.209C818.953 85.5332 787.284 71.1953 749.676 71.1953ZM751.161 752C689.801 752 634.379 740.134 584.896 716.402C536.402 692.671 496.815 658.062 466.135 612.576C432.486 649.162 401.312 677.838 372.611 698.604C344.9 718.38 317.685 732.224 290.963 740.134C264.242 748.045 235.047 752 203.377 752C144.987 752 96.493 735.684 57.8958 703.053C19.2986 670.422 0 623.453 0 562.146C0 530.504 7.42253 501.828 22.2676 476.118C37.1127 450.409 63.339 425.688 100.946 401.957C139.544 378.225 194.47 354.988 265.727 332.245C285.52 325.323 307.788 318.401 332.53 311.479C357.271 304.558 382.508 297.636 408.239 290.714V247.7C408.239 178.483 398.343 132.008 378.549 108.276C359.746 83.5556 327.086 71.1953 280.572 71.1953C262.758 71.1953 241.975 72.6785 218.223 75.645L200.408 163.156C196.45 198.753 185.563 224.957 167.749 241.767C150.925 258.577 130.142 266.982 105.4 266.982C82.6376 266.982 63.8338 261.049 48.9887 249.183C35.1333 236.329 26.2263 219.024 22.2676 197.27C31.1746 138.93 62.8441 91.4661 117.276 54.8797C172.698 18.2932 245.438 0 335.499 0C382.013 0 422.095 7.91059 455.744 23.7318C490.382 38.5641 517.598 62.7903 537.392 96.4103C599.741 32.1368 674.461 0 761.552 0C849.633 0 920.394 27.1926 973.837 81.5779C1027.28 135.963 1054 208.642 1054 299.613C1054 330.267 1051.03 356.965 1045.09 379.708H590.834C593.803 463.758 615.576 527.537 656.152 571.045C697.718 613.565 749.676 634.824 812.025 634.824C855.571 634.824 892.684 626.42 923.363 609.61C954.043 591.811 981.754 569.068 1006.5 541.381L1049.55 579.945C1020.85 634.33 981.259 676.849 930.786 707.503C881.302 737.168 821.427 752 751.161 752ZM173.687 532.481C173.687 572.034 184.574 600.71 206.346 618.509C228.119 635.319 252.861 643.724 280.572 643.724C297.396 643.724 312.736 641.746 326.592 637.791C340.447 633.836 355.787 625.925 372.611 614.059C390.425 602.193 412.693 585.383 439.414 563.629C414.672 509.244 402.301 447.937 402.301 379.708C402.301 374.764 402.301 369.82 402.301 364.876C402.301 359.932 402.796 355.482 403.786 351.527C383.992 357.46 365.189 363.887 347.375 370.809C330.55 376.742 315.705 382.18 302.839 387.124C253.356 406.901 219.212 429.149 200.408 453.87C182.594 477.602 173.687 503.805 173.687 532.481Z" fill="#1A1714"/></svg>`;

const LOGO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface SubscriptionConfirmationEmailProps {
  confirmationUrl: string;
}

export function SubscriptionConfirmationEmail({ confirmationUrl }: SubscriptionConfirmationEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your subscription</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: ${FONT_STACK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #F0EDE8;">
              <img src="${LOGO_DATA_URI}" alt="Craefto" width="35" height="25" style="display: inline-block; vertical-align: middle;" />
              <div style="margin-top: 12px; font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: #1A1714;">
                Craefto Lab Journal
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #4A4A4A; line-height: 1.3;">
                Confirm your subscription
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                Thanks for subscribing to the Craefto Lab Journal. Click the button below to confirm your email address and start receiving our updates.
              </p>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1A1714; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                  Confirm subscription
                </a>
              </div>

              <p style="margin: 0; font-size: 14px; color: #9A9A9A; line-height: 1.6;">
                If you didn't subscribe to our newsletter, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #FAF7F2; border-top: 1px solid #F0EDE8;">
              <p style="margin: 0; font-size: 14px; color: #9A9A9A; line-height: 1.6;">
                Best,<br>
                <strong style="color: #6B6B6B;">The Craefto Lab Team</strong>
              </p>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E8E5E0;">
                <p style="margin: 0; font-size: 12px; color: #9A9A9A;">
                  <a href="https://craefto.com" style="color: #9A9A9A; text-decoration: none;">craefto.com</a>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <a href="mailto:hello@craefto.com" style="color: #9A9A9A; text-decoration: none;">hello@craefto.com</a>
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Note -->
        <p style="margin: 30px 0 0; font-size: 11px; color: #9A9A9A; text-align: center;">
          This link will expire in 24 hours.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getSubscriptionConfirmationSubject(): string {
  return 'Confirm your subscription to Craefto Lab Journal';
}
