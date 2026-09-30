import { NextResponse, type NextRequest } from 'next/server';
import { currentSite } from '@/lib/current-site';
import { parseAttribution } from '@/lib/attribution';
import { exposureLabel, readExposures } from '@/lib/experiments';
import { clientIp, takeLimit } from '@/lib/rate-limit';
import { parseTrackBody, recordSiteEvent, sourceLabel } from '@/lib/site-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The WhatsApp click beacon (O24, item 2). `WhatsAppClickTracker` posts
 * `{type: "whatsapp_click", path, placement}` with `navigator.sendBeacon` on
 * every wa.me click; the conversation itself happens in WhatsApp, so this row
 * is how `/admin/attribution` knows which page and which source started it.
 *
 * The brand comes from the host (the proxy's `x-site`), the A/B variant from
 * our own exposure cookies and the source from the first-touch cookie — never
 * from the body. Always 204: a beacon has nobody to show an error to, and a
 * probe learns nothing from the answer.
 */
const NO_CONTENT = () => new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function POST(req: NextRequest) {
  if (!takeLimit('track', clientIp(req.headers)).ok) return NO_CONTENT();

  const text = await req.text().catch(() => '');
  if (!text || text.length > 2048) return NO_CONTENT();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NO_CONTENT();
  }
  const event = parseTrackBody(raw);
  if (!event) return NO_CONTENT();

  const site = await currentSite();
  const cookie = (name: string) => req.cookies.get(name)?.value;
  await recordSiteEvent(site, event, {
    variant: exposureLabel(readExposures(cookie)),
    source: sourceLabel(parseAttribution(cookie('vc_attr'))),
  });
  return NO_CONTENT();
}
