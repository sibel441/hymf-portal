import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const KORUMALI = ['/calisma-alani', '/yonetim', '/profil', '/uyeler', '/onay-bekleniyor', '/sifre-yenile'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Eğer Supabase yapılandırılmamışsa, hiçbir şey yapma
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // createServerClient ile getClaims arasında başka kod yok
  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  const korumali = KORUMALI.some((p) => path === p || path.startsWith(p + '/'));

  if (!data?.claims?.sub && korumali) {
    const url = request.nextUrl.clone();
    url.pathname = '/giris';
    url.search = '';
    url.searchParams.set('next', path);
    const yonlendir = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => yonlendir.cookies.set(c));
    return yonlendir;
  }

  return response;
}
