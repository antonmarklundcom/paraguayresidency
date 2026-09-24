# WhatsApp-first leads, no booked calls — 2026-09-24 (interactive, Anton's request)

"I don't want to do a lot of booked calls. Let them write to me on WhatsApp
and/or submit a form and collect leads in VenderCRM."

- **Contact paths**: a floating WhatsApp button on every page of all seven
  brands (`WhatsAppFab` in SiteShell), the hero's second action is WhatsApp
  (`HeroContact`, falls back to "Message us" → form when no number is set),
  the homepage `LeadPanel` and every `/contact` page (one shared `ContactPage`)
  lead with WhatsApp, then the form; the mobile sticky bar carries both.
- **`/book` is gone**: it permanently redirects to `/contact` and left the
  sitemap; `NEXT_PUBLIC_BOOKING_URL` is no longer read.
- **Copy**: every "book a call / on your call / first call" in en, es, pt and
  sv pages, MDX, brand messages, `facts.ts` hedges and the guide purchase
  email now says WhatsApp or the form, answered in writing within one working
  day. In-person appointments at Migraciones are unchanged (they are real).
- **VenderCRM**: a WhatsApp or phone number is required on every full lead
  form (the CRM keys the contact on it; `00` becomes `+`). Optional
  `VENDERCRM_API_KEY_<SITE>` per brand, shared `VENDERCRM_API_KEY` as fallback.
  The idempotency key now comes from the lead row, so a genuine second enquiry
  is never dropped and an admin retry can never duplicate a deal.
  `/api/health` reports `crm` for the requesting host's brand.

Anton still has to: create the VenderCRM site(s) for these domains, set
`VENDERCRM_API_URL=https://crm.clientes.com.py` and the key(s), and set
`NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only), then Redeploy.
