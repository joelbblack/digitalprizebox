// Shared HTML template for transactional email — matches the pop-art design
// system (bold black borders, hard-edge shadows, Lichtenstein-style flat color).
// Inline styles only because email clients strip <style> blocks aggressively.

/**
 * @param {object} opts
 * @param {string} opts.title         — large display heading
 * @param {string} opts.bodyHtml      — inner HTML body (already trusted)
 * @param {object} [opts.cta]         — { label, href }
 * @param {string} [opts.preheader]   — hidden preview text shown in inbox lists
 */
function renderEmail({ title, bodyHtml, cta, preheader }) {
  const ctaHtml = cta ? `
    <div style="margin:28px 0 8px;">
      <a href="${escapeAttr(cta.href)}"
         style="display:inline-block;background:#0033CC;color:#FFFFFF;
                font-family:'Fredoka One',Arial,sans-serif;font-size:18px;
                padding:14px 28px;border:3px solid #000000;border-radius:14px;
                text-decoration:none;box-shadow:4px 4px 0 #000000;">
        ${escapeText(cta.label)}
      </a>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeText(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Nunito,Arial,sans-serif;color:#111111;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeText(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:3px solid #000000;border-radius:18px;box-shadow:6px 6px 0 #000000;">
        <tr><td style="padding:32px 32px 24px;">
          <div style="font-family:'Fredoka One',Arial,sans-serif;font-size:28px;color:#0033CC;line-height:1.15;margin-bottom:16px;">
            ${escapeText(title)}
          </div>
          <div style="font-size:15px;line-height:1.55;color:#111111;">
            ${bodyHtml}
          </div>
          ${ctaHtml}
        </td></tr>
      </table>
      <div style="margin-top:18px;font-size:11px;color:#555555;font-family:Nunito,Arial,sans-serif;">
        Digital Prize Box · Kids earn it. Parents control it.<br/>
        <a href="https://digitalprizebox.com" style="color:#0033CC;">digitalprizebox.com</a>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeText(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function escapeAttr(s) { return escapeText(s); }

module.exports = { renderEmail };
