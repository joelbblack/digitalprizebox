// POST /api/email/test
// Sends a test email — useful for verifying Resend is wired correctly.
//
// Body: { to: "you@example.com" }
//
// Auth: gated by a shared secret in EMAIL_TEST_TOKEN to prevent abuse.
// Header: x-test-token: <EMAIL_TEST_TOKEN>

const { sendEmail } = require("./_send");
const { renderEmail } = require("./_template");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-test-token");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers["x-test-token"];
  if (!process.env.EMAIL_TEST_TOKEN || token !== process.env.EMAIL_TEST_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { to } = req.body || {};
  if (!to || !/.+@.+\..+/.test(to)) {
    return res.status(400).json({ error: "Missing or invalid 'to' email" });
  }

  try {
    const result = await sendEmail({
      to,
      subject: "Digital Prize Box — test email ✓",
      html: renderEmail({
        title: "It works!",
        preheader: "Resend is correctly wired up to your domain.",
        bodyHtml: `
          <p>If you're reading this, your transactional email pipeline is live.</p>
          <p style="margin-top:14px;color:#555;font-size:13px;">
            Sender domain verified · Resend API key valid · Vercel function reachable.
          </p>
        `,
        cta: { label: "Open dashboard", href: "https://digitalprizebox.com/dashboard" },
      }),
      tags: { type: "test" },
    });
    return res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error("[email/test] send failed:", err);
    return res.status(500).json({ error: err.message || "Send failed" });
  }
};
