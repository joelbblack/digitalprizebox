// Internal helper: send a transactional email via Resend.
// Not an HTTP endpoint — imported by other /api/email/*.js handlers.
//
// Required env vars (Vercel project settings):
//   RESEND_API_KEY         — from resend.com dashboard
//   EMAIL_FROM             — verified sender, e.g. "Digital Prize Box <noreply@digitalprizebox.com>"
//   EMAIL_REPLY_TO         — (optional) inbound replies, e.g. "joel@digitalprizebox.com"

const { Resend } = require("resend");

let _client = null;
function client() {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.EMAIL_FROM || "Digital Prize Box <noreply@digitalprizebox.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

/**
 * Send an email through Resend.
 * @param {object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string} [opts.text]    — plain-text fallback (auto-generated if missing)
 * @param {object} [opts.tags]    — Resend tags for analytics: { name: "value" }
 * @returns {Promise<{ id: string }>}
 */
async function sendEmail({ to, subject, html, text, tags }) {
  const r = client();
  const payload = {
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text: text || stripHtml(html),
  };
  if (REPLY_TO) payload.reply_to = REPLY_TO;
  if (tags) {
    payload.tags = Object.entries(tags).map(([name, value]) => ({ name, value: String(value) }));
  }
  const { data, error } = await r.emails.send(payload);
  if (error) throw new Error(`Resend send failed: ${error.message || JSON.stringify(error)}`);
  return data;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { sendEmail, stripHtml };
