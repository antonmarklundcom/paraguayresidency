/**
 * WhatsApp click-to-chat — approved extra for the two service brands (plan
 * §3b: "trivial, ship in S3/S4"). Missing env never blocks (plan §4.5): the
 * link is simply omitted when `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset.
 */
export function whatsappHref(message: string): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
