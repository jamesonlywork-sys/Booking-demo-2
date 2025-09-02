/**
 * /api/email-ticket (Vercel serverless function)
 * Sends a simple ticket email using Resend (https://resend.com/).
 * Setup:
 * 1) Create a Resend account (free).
 * 2) In Vercel project settings → Environment Variables, add RESEND_API_KEY.
 * 3) Deploy.
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error: 'Method not allowed' });
    const { id, event, name, email, qty } = req.body || {};
    if (!email || !id || !event) return res.status(400).json({ ok:false, error: 'Missing fields' });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(200).json({ ok:true, info: 'RESEND_API_KEY not set; email skipped (demo)' });

    const payload = {
      from: 'tickets@yourdomain.com',
      to: [email],
      subject: `Your Booking.bt ticket (${id})`,
      html: `
        <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#111">
          <h2>🎟️ Booking.bt Ticket</h2>
          <p>Thanks ${name || ''}!</p>
          <p><strong>Event:</strong> ${event}<br/>
             <strong>Ticket ID:</strong> ${id}<br/>
             <strong>Qty:</strong> ${qty || 1}</p>
          <p>Show this email at entry. You can also validate here: <a href="https://YOUR_VERCEL_URL/checkin">Check-in</a></p>
          <p style="font-size:12px;color:#666">Demo email via Resend • Not a real purchase</p>
        </div>
      `
    };

    // Minimal fetch-based call to Resend API
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    return res.status(200).json({ ok:true, data });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e?.message || 'Unknown error' });
  }
}
