// POST /api/email/family-invite
// Sends a family-circle invite email. Caller (the inviting parent) must be
// authenticated via Supabase JWT. Server verifies the inviter actually owns
// the kid being invited to.
//
// Body: { kidId, inviteeEmail, inviterName, kidName, inviteToken }
//
// Note: this function only sends the email. The invite token + DB row should
// already exist (created by whatever handler manages family_invites). Wire
// this from that handler so a single invite create flow both stores and emails.

const { createClient } = require("@supabase/supabase-js");
const { sendEmail } = require("./_send");
const { renderEmail } = require("./_template");

function supa() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!jwt) return res.status(401).json({ error: "Missing auth" });

  const sb = supa();
  const { data: userResp, error: authErr } = await sb.auth.getUser(jwt);
  if (authErr || !userResp?.user) return res.status(401).json({ error: "Invalid auth" });

  const { kidId, inviteeEmail, inviterName, kidName, inviteToken } = req.body || {};
  if (!kidId || !inviteeEmail || !inviteToken) {
    return res.status(400).json({ error: "Missing kidId, inviteeEmail, or inviteToken" });
  }
  if (!/.+@.+\..+/.test(inviteeEmail)) {
    return res.status(400).json({ error: "Invalid inviteeEmail" });
  }

  // Verify the caller owns this kid before sending an invite about them.
  const { data: parentRow } = await sb
    .from("users").select("id").eq("auth_id", userResp.user.id).single();
  if (!parentRow) return res.status(403).json({ error: "No profile" });

  const { data: kidRow } = await sb
    .from("kids").select("id, parent_id").eq("id", kidId).single();
  if (!kidRow || kidRow.parent_id !== parentRow.id) {
    return res.status(403).json({ error: "Not your kid" });
  }

  const inviteUrl = `https://digitalprizebox.com/invite/${encodeURIComponent(inviteToken)}`;
  const safeKid = kidName || "your family";
  const safeInviter = inviterName || "Someone in your family";

  try {
    const result = await sendEmail({
      to: inviteeEmail,
      subject: `${safeInviter} invited you to ${safeKid}'s prize box`,
      html: renderEmail({
        title: `Join ${safeKid}'s prize box`,
        preheader: `${safeInviter} added you to the family circle. Help fund a kid's wishlist.`,
        bodyHtml: `
          <p><strong>${safeInviter}</strong> just added you to <strong>${safeKid}</strong>'s
          family circle on Digital Prize Box.</p>
          <p style="margin-top:12px;">As a family contributor, you can load a few green dollars
          toward ${safeKid}'s wishlist jars whenever you like — birthdays, good grades, just because.
          The kid only sees orange progress, never real dollar amounts.</p>
          <p style="margin-top:12px;color:#555;font-size:13px;">This invite expires in 14 days.</p>
        `,
        cta: { label: "Accept invite", href: inviteUrl },
      }),
      tags: { type: "family-invite", kid: kidId },
    });
    return res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error("[email/family-invite] send failed:", err);
    return res.status(500).json({ error: err.message || "Send failed" });
  }
};
