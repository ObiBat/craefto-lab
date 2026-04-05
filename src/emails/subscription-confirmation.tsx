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
              
              <div style="margin-top: 12px; font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: #1A1714;">
                Craefto Journal
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
                Thanks for subscribing to the Craefto Journal. Click the button below to confirm your email address and start receiving our updates.
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
                <strong style="color: #6B6B6B;">The Craefto Team</strong>
              </p>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E8E5E0;">
                <p style="margin: 0; font-size: 12px; color: #9A9A9A;">
                  <a href="https://www.craefto.com" style="color: #9A9A9A; text-decoration: none;">craefto.com</a>
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
  return 'Confirm your subscription to Craefto Journal';
}
