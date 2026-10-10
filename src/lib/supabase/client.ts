import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { GECICI_OTURUM_CEREZI, oturumSecenekleri } from './hatirla';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  // Çerezler varsayılan document.cookie davranışıyla yazılır; tek fark "Beni hatırla" kapalıyken
  // süre bilgisinin atılması (bkz. hatirla.ts).
  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return typeof document === 'undefined' ? [] : parseCookieHeader(document.cookie);
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return;
        const gecici = parseCookieHeader(document.cookie).some((c) => c.name === GECICI_OTURUM_CEREZI);
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = serializeCookieHeader(name, value, oturumSecenekleri(options, gecici));
        });
      },
    },
  });
}
