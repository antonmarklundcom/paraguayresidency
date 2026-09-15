import { NextResponse } from 'next/server';
import { signOutMember } from '@/lib/member-auth';
import { currentSite } from '@/lib/current-site';
import { siteOrigin } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await currentSite();
  await signOutMember();
  return NextResponse.redirect(`${siteOrigin(site)}/login?signedOut=1`, 303);
}

export const POST = GET;
