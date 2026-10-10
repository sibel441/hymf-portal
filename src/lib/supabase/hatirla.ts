/**
 * "Beni hatırla" işaretlenmeden giriş yapılınca bu çerez oturum çerezi olarak konur. Çerez varken
 * Supabase'in oturum çerezleri de süresiz (tarayıcı kapanınca silinen) yazılır; işaretliyse Supabase'in
 * varsayılan uzun ömürlü çerezleri kullanılır.
 */
export const GECICI_OTURUM_CEREZI = 'hymf-gecici-oturum';

type CerezSecenekleri = { maxAge?: number; expires?: Date };

export function oturumSecenekleri<T extends CerezSecenekleri>(options: T, gecici: boolean): T {
  // maxAge: 0 çerezi silmek içindir; ona dokunulmaz.
  if (!gecici || options.maxAge === 0) return options;
  const kopya = { ...options };
  delete kopya.maxAge;
  delete kopya.expires;
  return kopya;
}

/** Giriş formunda, oturum açmadan hemen önce çağrılır. */
export function hatirlamaTercihiniYaz(beniHatirla: boolean) {
  if (beniHatirla) {
    document.cookie = `${GECICI_OTURUM_CEREZI}=; path=/; max-age=0; samesite=lax`;
  } else {
    const guvenli = location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${GECICI_OTURUM_CEREZI}=1; path=/; samesite=lax${guvenli}`;
  }
}
