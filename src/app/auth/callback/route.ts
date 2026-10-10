import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { guvenliIcYol } from '@/lib/yonlendirme';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const validNext = guvenliIcYol(searchParams.get('next'));

  if (!code) {
    const errorUrl = new URL('/giris', request.url);
    errorUrl.searchParams.set('hata', 'baglanti');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL('/giris', request.url);
      errorUrl.searchParams.set('hata', 'baglanti');
      return NextResponse.redirect(errorUrl);
    }

    const redirectUrl = new URL(validNext, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('Auth callback error:', err);
    const errorUrl = new URL('/giris', request.url);
    errorUrl.searchParams.set('hata', 'baglanti');
    return NextResponse.redirect(errorUrl);
  }
}
