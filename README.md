# Booking.bt — Vercel Pro Demo (Operational Feel)

What you get:
- 🔒 Stripe test-ready flow (paste your Payment Link per event in `events.json`)
- 📧 Ticket email via Resend using `/api/email-ticket` (set RESEND_API_KEY in Vercel)
- 🎟️ QR ticket + Check-in page (validate/mark used) — demo-locally persisted
- 🖼️ Polished UI with images

## Quick Deploy (iPad-friendly)
1) Go to vercel.com → New Project → Deploy manually → Upload the **bookingbt-vercel-pro-demo** folder.
2) After first deploy, add a secret in Project Settings → Environment Variables:
   - `RESEND_API_KEY` = `your_resend_api_key`
3) (Optional) Edit `events.json` and paste your Stripe **test** Payment Link for each event.
4) Redeploy (Vercel auto-detects changes).

## How the Flow Works
- On **index.html**:
  - Use **Test Payment** → simulates payment and goes to `/success?id=...&event=...`
  - Or click **Stripe (test)** if you added a Payment Link (configure success URL in Stripe to `/success`)
- On **/success**:
  - It displays ticket details and calls `/api/email-ticket` to send an email (if key set).
- On **/checkin**:
  - Validate Ticket ID and mark as used. (Demo uses browser storage; not shared across devices.)

## Notes
- For real production, add a database (Supabase) and webhooks to store tickets centrally.
- This is a **demo** designed to look and feel real while keeping setup super simple.
