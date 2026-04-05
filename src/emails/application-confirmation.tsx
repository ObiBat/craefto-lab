const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const SERIF_STACK = "'Source Serif 4', 'Source Serif Pro', Georgia, 'Times New Roman', serif";

interface ApplicationConfirmationProps {
  full_name: string;
  role_title: string;
  role_slug: string;
}

export function getApplicationConfirmationSubject(roleTitle: string): string {
  return `We received your application — ${roleTitle} at Craefto`;
}

export function ApplicationConfirmationEmail({
  full_name,
  role_title,
  role_slug,
}: ApplicationConfirmationProps): string {
  const firstName = full_name.split(" ")[0] || full_name;
  const roleUrl = `https://www.craefto.com/careers/${role_slug}`;
  const careersUrl = `https://www.craefto.com/careers`;
  const portfolioUrl = `https://www.craefto.com/work`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your application is in — Craefto</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EF; font-family: ${FONT_STACK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F4EF;">
    <tr>
      <td align="center" style="padding: 48px 20px;">

        <!-- Wordmark -->
        <table role="presentation" width="100%" style="max-width: 560px; margin-bottom: 24px;">
          <tr>
            <td style="text-align: left; padding-bottom: 4px;">
              <span style="font-family: ${FONT_STACK}; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #6B6B6B; text-transform: uppercase;">Craefto</span>
            </td>
          </tr>
        </table>

        <!-- Main card -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5E2DA;">

          <!-- Header band -->
          <tr>
            <td style="padding: 48px 48px 32px;">
              <p style="margin: 0 0 16px; font-family: ${FONT_STACK}; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #9A9A9A; text-transform: uppercase;">Application received</p>
              <h1 style="margin: 0; font-family: ${SERIF_STACK}; font-size: 32px; font-weight: 700; line-height: 1.15; color: #1A1A1A; letter-spacing: -0.5px;">Thank you, ${escapeHtml(firstName)}.</h1>
              <p style="margin: 14px 0 0; font-family: ${FONT_STACK}; font-size: 16px; line-height: 1.6; color: #4A4A4A;">We have your application for the <strong style="color: #1A1A1A;">${escapeHtml(role_title)}</strong> role and every answer you shared is now in front of us.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background-color: #E5E2DA;"></div>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding: 32px 48px;">
              <p style="margin: 0 0 20px; font-family: ${FONT_STACK}; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: #9A9A9A; text-transform: uppercase;">What happens next</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 18px; vertical-align: top; width: 36px;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #1A1A1A; color: #FFFFFF; text-align: center; line-height: 28px; font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600;">1</div>
                  </td>
                  <td style="padding-bottom: 18px; vertical-align: top;">
                    <p style="margin: 4px 0 2px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 600; color: #1A1A1A;">We review carefully</p>
                    <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: #6A6A6A;">A real human reads every application. We look for taste, craft, and alignment with how we work.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 18px; vertical-align: top; width: 36px;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #1A1A1A; color: #FFFFFF; text-align: center; line-height: 28px; font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600;">2</div>
                  </td>
                  <td style="padding-bottom: 18px; vertical-align: top;">
                    <p style="margin: 4px 0 2px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 600; color: #1A1A1A;">You hear back within 7 days</p>
                    <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: #6A6A6A;">Whether it is a yes, a no, or a let us talk, we will respond. No ghosting.</p>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top; width: 36px;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #1A1A1A; color: #FFFFFF; text-align: center; line-height: 28px; font-family: ${FONT_STACK}; font-size: 13px; font-weight: 600;">3</div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 4px 0 2px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 600; color: #1A1A1A;">Next step is a conversation</p>
                    <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: #6A6A6A;">If we are a match, we will set up a 30 minute call to get to know you and talk about the work.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background-color: #E5E2DA;"></div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 32px 48px 40px;">
              <p style="margin: 0 0 16px; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: #6A6A6A;">While you wait, take a look at recent work from the studio.</p>
              <a href="${portfolioUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1A1A1A; color: #FFFFFF; font-family: ${FONT_STACK}; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 999px; letter-spacing: 0.2px;">See our work →</a>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 560px; margin-top: 24px;">
          <tr>
            <td style="text-align: center; padding: 16px 0;">
              <p style="margin: 0 0 8px; font-family: ${FONT_STACK}; font-size: 13px; color: #6A6A6A;">Obi Batbileg — Craefto</p>
              <p style="margin: 0 0 4px;">
                <a href="${careersUrl}" style="font-family: ${FONT_STACK}; font-size: 12px; color: #6A6A6A; text-decoration: none; margin: 0 8px;">All roles</a>
                <span style="color: #C5C0B4;">·</span>
                <a href="${roleUrl}" style="font-family: ${FONT_STACK}; font-size: 12px; color: #6A6A6A; text-decoration: none; margin: 0 8px;">This role</a>
                <span style="color: #C5C0B4;">·</span>
                <a href="https://www.craefto.com" style="font-family: ${FONT_STACK}; font-size: 12px; color: #6A6A6A; text-decoration: none; margin: 0 8px;">craefto.com</a>
              </p>
              <p style="margin: 12px 0 0; font-family: ${FONT_STACK}; font-size: 11px; color: #9A9A9A;">You received this because you applied for a role at Craefto.</p>
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
