/**
 * `next` gibi kullanıcıdan gelen yönlendirme hedefini yalnız site içi bir yola izin verecek
 * şekilde süzer. "//evil.com" ve "/\evil.com" (tarayıcılar "\"yi "/" sayar) reddedilir.
 */
export function guvenliIcYol(hedef: string | null | undefined, varsayilan = '/'): string {
  if (!hedef || !hedef.startsWith('/') || hedef.startsWith('//') || hedef.includes('\\')) return varsayilan;
  // Kontrol karakterleri (sekme, satır sonu) tarayıcıda atlanıp "//" oluşturabilir.
  if (/[\u0000-\u001f\u007f]/.test(hedef)) return varsayilan;
  return hedef;
}
