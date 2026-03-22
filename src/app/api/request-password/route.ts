import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// ← Your email address — you'll get notified here
const NOTIFY_EMAIL = "tony@tonyhaasmusic.com";

export async function POST(req: Request) {
  const { name, contact } = await req.json();

  if (!name || !contact) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Nostalgia Vault <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: "🔐 Password Request — 72 Hours in Vegas",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0e0018;color:#fff;border-radius:12px;">
          <h2 style="color:#ff1493;margin:0 0 8px;">New Password Request</h2>
          <p style="color:#aaa;margin:0 0 24px;font-size:13px;">Someone wants access to <strong style="color:#fff;">72 Hours in Vegas</strong></p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #2a0a2a;color:#888;font-size:12px;width:80px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #2a0a2a;color:#fff;font-size:14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;font-size:12px;">Contact</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;">${contact}</td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#555;">Reach out to them directly to share the passcode.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
