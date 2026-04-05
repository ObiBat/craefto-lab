// System font stack matching the codebase (Space Grotesk style fallback)
const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface InvoiceSentEmailProps {
  recipientName: string;
  invoiceNumber: string;
  projectName: string;
  total: number;
  currency: string;
  dueDate: string;
  milestoneType?: 'deposit' | 'design_approval' | 'development' | 'final' | null;
  downloadUrl?: string;
}

const MILESTONE_LABELS: Record<string, string> = {
  deposit: 'Project Deposit (50%)',
  design_approval: 'Design Approval (25%)',
  development: 'Development Milestone',
  final: 'Final Payment (25%)',
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function InvoiceSentEmail({
  recipientName,
  invoiceNumber,
  projectName,
  total,
  currency,
  dueDate,
  milestoneType,
  downloadUrl,
}: InvoiceSentEmailProps) {
  const firstName = recipientName.split(' ')[0];
  const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const milestoneLabel = milestoneType ? MILESTONE_LABELS[milestoneType] : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
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
                Invoice ${invoiceNumber}
              </h1>

              <p style="margin: 0 0 20px; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                Hi ${firstName}, here's your invoice for <strong style="color: #4A4A4A;">${projectName}</strong>.
              </p>

              <div style="margin: 30px 0; padding: 24px; background-color: #FAF7F2; border-radius: 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${milestoneLabel ? `
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="font-size: 13px; color: #9A9A9A;">Milestone</span><br>
                      <span style="font-size: 15px; color: #4A4A4A;">${milestoneLabel}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="font-size: 13px; color: #9A9A9A;">Amount Due</span><br>
                      <span style="font-size: 24px; font-weight: 600; color: #1A1714;">${formatCurrency(total, currency)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="font-size: 13px; color: #9A9A9A;">Due Date</span><br>
                      <span style="font-size: 15px; color: #4A4A4A;">${dueDateFormatted}</span>
                    </td>
                  </tr>
                </table>
              </div>

              ${downloadUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1A1714; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                  View Invoice PDF
                </a>
              </div>
              ` : ''}

              <div style="margin: 30px 0; padding: 20px; background-color: #FEF3C7; border-radius: 8px; border-left: 4px solid #F59E0B;">
                <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.6;">
                  <strong>Payment Details</strong><br><br>
                  Please transfer the amount to the bank details provided in the invoice PDF. Include your invoice number in the payment reference.
                </p>
              </div>

              <p style="margin: 0; font-size: 16px; color: #6B6B6B; line-height: 1.6;">
                If you have any questions about this invoice, please reply to this email or contact us at <a href="mailto:hello@craefto.com" style="color: #4A4A4A;">hello@craefto.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #FAF7F2; border-top: 1px solid #F0EDE8;">
              <p style="margin: 0; font-size: 14px; color: #9A9A9A; line-height: 1.6;">
                Thank you for your business,<br>
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

export function getInvoiceSentSubject(invoiceNumber: string, total: number, currency: string): string {
  const formattedTotal = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency || 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total);
  return `Invoice ${invoiceNumber} — ${formattedTotal} due`;
}
