// System font stack matching the codebase (Space Grotesk style fallback)
const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface DocumentSignedEmailProps {
  recipientName: string;
  documentNumber: string;
  documentTitle: string;
  documentType: 'proposal' | 'sow' | 'invoice' | 'change_order';
  signedAt: string;
  downloadUrl?: string;
}

const TYPE_LABELS: Record<string, string> = {
  proposal: 'Project Proposal',
  sow: 'Statement of Work',
  invoice: 'Invoice',
  change_order: 'Change Order',
};

export function DocumentSignedEmail({
  recipientName,
  documentNumber,
  documentTitle,
  documentType,
  signedAt,
  downloadUrl,
}: DocumentSignedEmailProps) {
  const firstName = recipientName.split(' ')[0];
  const typeLabel = TYPE_LABELS[documentType] || documentType;
  const signedDate = new Date(signedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Fully Signed</title>
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
                Craefto
              </div>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #10B981; padding: 16px 40px; text-align: center;">
                <span style="display: inline-block; width: 24px; height: 24px; background-color: #FFFFFF; border-radius: 50%; line-height: 24px; text-align: center; margin-right: 8px; vertical-align: middle;">
                  <span style="color: #10B981; font-weight: bold;">&#10003;</span>
                </span>
                <span style="font-size: 16px; font-weight: 600; color: #FFFFFF; vertical-align: middle;">
                  All Signatures Complete
                </span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #4A4A4A; line-height: 1.3;">
                Great news, ${firstName}!
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                Your <strong style="color: #4A4A4A;">${typeLabel}</strong> has been fully signed by all parties.
              </p>

              <div style="margin: 30px 0; padding: 24px; background-color: #FAF7F2; border-radius: 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="font-size: 13px; color: #9A9A9A;">Document</span><br>
                      <span style="font-size: 15px; font-weight: 600; color: #4A4A4A;">${documentNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="font-size: 13px; color: #9A9A9A;">Title</span><br>
                      <span style="font-size: 15px; color: #4A4A4A;">${documentTitle}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="font-size: 13px; color: #9A9A9A;">Completed</span><br>
                      <span style="font-size: 15px; color: #10B981;">${signedDate}</span>
                    </td>
                  </tr>
                </table>
              </div>

              ${downloadUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1A1714; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                  Download Signed PDF
                </a>
              </div>
              ` : ''}

              <p style="margin: 0; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                A copy of this signed document has been securely stored for your records. If you have any questions, please don't hesitate to reach out.
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
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getDocumentSignedSubject(documentNumber: string): string {
  return `Document ${documentNumber} has been fully signed`;
}
