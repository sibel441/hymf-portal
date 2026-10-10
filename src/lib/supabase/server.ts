import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GECICI_OTURUM_CEREZI, oturumSecenekleri } from './hatirla';

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          const gecici = cookieStore.has(GECICI_OTURUM_CEREZI);
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, oturumSecenekleri(options, gecici))
          );
        } catch {
          // Server Component içinden çağrıldığında setAll sessizce geçilebilir
        }
      },
    },
  });
}
