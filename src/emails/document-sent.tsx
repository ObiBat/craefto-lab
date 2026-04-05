// System font stack matching the codebase (Space Grotesk style fallback)
const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface DocumentSentEmailProps {
  recipientName: string;
  documentNumber: string;
  documentTitle: string;
  documentType: 'proposal' | 'sow' | 'invoice' | 'change_order';
  signerName: string;
  expiresAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  proposal: 'Project Proposal',
  sow: 'Statement of Work',
  invoice: 'Invoice',
  change_order: 'Change Order',
};

export function DocumentSentEmail({
  recipientName,
  documentNumber,
  documentTitle,
  documentType,
  signerName,
  expiresAt,
}: DocumentSentEmailProps) {
  const firstName = recipientName.split(' ')[0];
  const typeLabel = TYPE_LABELS[documentType] || documentType;
  const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Sent for Signature</title>
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

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #4A4A4A; line-height: 1.3;">
                Document Sent for Signature
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                Hi ${firstName}, your <strong style="color: #4A4A4A;">${typeLabel}</strong> has been sent for signature.
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
                    <td style="padding-bottom: 12px;">
                      <span style="font-size: 13px; color: #9A9A9A;">Sent To</span><br>
                      <span style="font-size: 15px; color: #4A4A4A;">${signerName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="font-size: 13px; color: #9A9A9A;">Expires</span><br>
                      <span style="font-size: 15px; color: #4A4A4A;">${expiresDate}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                The recipient will receive an email with a secure link to review and sign the document. You'll be notified once they complete the signing process.
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

export function getDocumentSentSubject(documentNumber: string): string {
  return `Document ${documentNumber} sent for signature`;
}
