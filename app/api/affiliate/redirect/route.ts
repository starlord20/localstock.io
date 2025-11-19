import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) return NextResponse.json({ error: 'target query param required' }, { status: 400 });

  try {
    const decoded = decodeURIComponent(target);
    // Basic safety: only allow http(s) targets
    if (!/^https?:\/\//i.test(decoded)) {
      return NextResponse.json({ error: 'invalid target' }, { status: 400 });
    }
    return NextResponse.redirect(decoded, 302);
  } catch (e) {
    return NextResponse.json({ error: 'failed to redirect' }, { status: 500 });
  }
}
