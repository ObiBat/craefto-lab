import { escapeHtml, safeUrl } from "./_escape";

const FONT_STACK = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface ApplicationAnswer {
  question_id: string;
  question_text: string;
  question_type: string;
  answer: string | string[];
}

interface ApplicationEmailProps {
  application: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    role_title: string;
    role_slug: string;
    portfolio_url?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    resume_url?: string | null;
    resume_filename?: string | null;
    cover_letter_url?: string | null;
    cover_letter_filename?: string | null;
    answers: ApplicationAnswer[];
    created_at: string;
  };
}

function renderAnswerRow(a: ApplicationAnswer): string {
  const answer = Array.isArray(a.answer) ? a.answer.join(", ") : a.answer;
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #333338;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">${escapeHtml(a.question_text)}</span>
        <div style="margin-top: 4px; font-size: 15px; color: #FFFFFF; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(answer)}</div>
      </td>
    </tr>
  `;
}

function renderLinkRow(label: string, url: string): string {
  const href = safeUrl(url);
  if (!href) return "";
  return `
    <tr>
      <td style="padding: 8px 0;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">${escapeHtml(label)}</span>
        <div style="margin-top: 2px;">
          <a href="${href}" style="font-size: 14px; color: #818CF8; text-decoration: none;">${href}</a>
        </div>
      </td>
    </tr>
  `;
}

export function ApplicationNotificationEmail({ application }: ApplicationEmailProps) {
  const adminUrl = `https://www.craefto.com/admin/applications/${encodeURIComponent(application.id)}`;

  const links: string[] = [];
  if (application.portfolio_url) links.push(renderLinkRow("Portfolio", application.portfolio_url));
  if (application.linkedin_url) links.push(renderLinkRow("LinkedIn", application.linkedin_url));
  if (application.github_url) links.push(renderLinkRow("GitHub", application.github_url));

  const fileLinks: string[] = [];
  if (application.resume_url) {
    const href = safeUrl(application.resume_url);
    if (href) {
      const label = escapeHtml(application.resume_filename || "Download");
      fileLinks.push(`<a href="${href}" style="display: inline-block; padding: 10px 20px; background-color: #1a1a1f; border: 1px solid #333338; border-radius: 8px; color: #FFFFFF; font-size: 13px; text-decoration: none; margin-right: 8px;">Resume: ${label}</a>`);
    }
  }
  if (application.cover_letter_url) {
    const href = safeUrl(application.cover_letter_url);
    if (href) {
      const label = escapeHtml(application.cover_letter_filename || "Download");
      fileLinks.push(`<a href="${href}" style="display: inline-block; padding: 10px 20px; background-color: #1a1a1f; border: 1px solid #333338; border-radius: 8px; color: #FFFFFF; font-size: 13px; text-decoration: none;">Cover Letter: ${label}</a>`);
    }
  }

  const safeFullName = escapeHtml(application.full_name);
  const safeRoleTitle = escapeHtml(application.role_title);
  const safeEmail = escapeHtml(application.email);
  const safeEmailHref = safeUrl(`mailto:${application.email}`);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Application: ${safeFullName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #1a1a1f; font-family: ${FONT_STACK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a1a1f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 560px; margin-bottom: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 10px;">

              <span style="margin-left: 8px; font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; color: #6B6B6B; vertical-align: middle;">Craefto</span>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width: 560px; background-color: #252529; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #818CF8 0%, #6366F1 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="width: 12px; height: 12px; background-color: #FFFFFF; border-radius: 50%; display: inline-block; vertical-align: middle;"></div>
                    <span style="margin-left: 10px; font-family: ${FONT_STACK}; font-size: 14px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 1px; vertical-align: middle;">New Application</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 0; font-family: ${FONT_STACK}; font-size: 28px; font-weight: 700; color: #FFFFFF;">${safeFullName}</h1>
              <p style="margin: 8px 0 0; font-family: ${FONT_STACK}; font-size: 16px; color: rgba(255,255,255,0.8);">${safeRoleTitle}</p>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #333338;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #333338;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Email</span>
                    <div style="margin-top: 2px;"><a href="${safeEmailHref}" style="font-size: 15px; color: #FFFFFF; text-decoration: none;">${safeEmail}</a></div>
                  </td>
                </tr>
                ${application.phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #333338;"><span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Phone</span><div style="margin-top: 2px; font-size: 15px; color: #FFFFFF;">${escapeHtml(application.phone)}</div></td></tr>` : ""}
                ${application.location ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #333338;"><span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B;">Location</span><div style="margin-top: 2px; font-size: 15px; color: #FFFFFF;">${escapeHtml(application.location)}</div></td></tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Links -->
          ${links.length > 0 ? `
          <tr>
            <td style="padding: 20px 40px; border-bottom: 1px solid #333338;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${links.join("")}
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Answers -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #333338;">
              <span style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #818CF8;">Qualifying Answers</span>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 12px;">
                ${application.answers.map(renderAnswerRow).join("")}
              </table>
            </td>
          </tr>

          <!-- Files -->
          ${fileLinks.length > 0 ? `
          <tr>
            <td style="padding: 20px 40px; border-bottom: 1px solid #333338;">
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6B6B; display: block; margin-bottom: 12px;">Attachments</span>
              ${fileLinks.join("")}
            </td>
          </tr>
          ` : ""}

          <!-- CTA -->
          <tr>
            <td style="padding: 30px 40px;">
              <a href="${adminUrl}" style="display: inline-block; padding: 14px 28px; background-color: #818CF8; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">Review in Command Center</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #1a1a1f;">
              <p style="margin: 0; font-size: 12px; color: #6B6B6B;">
                Application ID: ${escapeHtml(application.id)}<br>
                Received: ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
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

export function getApplicationNotificationSubject(roleTitle: string, fullName: string): string {
  return `New application: ${roleTitle} — ${fullName}`;
}
