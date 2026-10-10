// Tarih yardımcıları. Sunucu (UTC) ile tarayıcı aynı sonucu versin diye saat dilimi sabit.

const TZ = 'Europe/Istanbul';

const gunBicimi = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const uzunBicim = new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
const kisaBicim = new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, day: 'numeric', month: 'short' });
const kisaYilliBicim = new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' });
const saatBicimi = new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

/** YYYY-MM-DD biçimindeki tarihi (date kolonu) gün kaymadan Date'e çevirir. */
function gunuDateYap(gun: string): Date {
  return new Date(`${gun}T12:00:00Z`);
}

function dateYap(deger: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(deger) ? gunuDateYap(deger) : new Date(deger);
}

/** İstanbul saatine göre bugünün tarihi, YYYY-MM-DD. */
export function bugunISO(simdi: Date = new Date()): string {
  return gunBicimi.format(simdi);
}

/** Bir zaman damgasının İstanbul'daki günü, YYYY-MM-DD. */
export function gunISO(deger: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(deger) ? deger : gunBicimi.format(new Date(deger));
}

/** İki YYYY-MM-DD arasındaki gün farkı (b - a). */
export function gunFarki(a: string, b: string): number {
  return Math.round((gunuDateYap(b).getTime() - gunuDateYap(a).getTime()) / 86_400_000);
}

/** "9 Ekim 2026" */
export function tarih(deger: string): string {
  return uzunBicim.format(dateYap(deger));
}

/** "9 Eki"; bu yıl değilse "9 Eki 2025" */
export function kisaTarih(deger: string, simdi: Date = new Date()): string {
  const d = dateYap(deger);
  const ayniYil = gunISO(deger).slice(0, 4) === bugunISO(simdi).slice(0, 4);
  return (ayniYil ? kisaBicim : kisaYilliBicim).format(d);
}

/** "9 Ekim 2026, 14:05" */
export function tarihSaat(deger: string): string {
  const d = new Date(deger);
  return `${uzunBicim.format(d)}, ${saatBicimi.format(d)}`;
}

/** "az önce", "12 dakika önce", "3 saat önce", "dün", "4 gün önce", "2 hafta önce", sonra tarih. */
export function goreliZaman(deger: string, simdi: Date = new Date()): string {
  const d = new Date(deger);
  const saniye = Math.round((simdi.getTime() - d.getTime()) / 1000);
  if (saniye < 60) return 'az önce';
  const dakika = Math.floor(saniye / 60);
  if (dakika < 60) return `${dakika} dakika önce`;
  const gun = gunFarki(gunISO(deger), bugunISO(simdi));
  if (gun <= 0) return `${Math.floor(dakika / 60)} saat önce`;
  if (gun === 1) return 'dün';
  if (gun < 14) return `${gun} gün önce`;
  if (gun < 56) return `${Math.floor(gun / 7)} hafta önce`;
  return kisaTarih(deger, simdi);
}

/** Son tarihe göre kısa metin: "bugün", "yarın", "3 gün kaldı", "2 gün gecikti". */
export function sonTarihMetni(dueDate: string, bugun: string = bugunISO()): string {
  const fark = gunFarki(bugun, dueDate);
  if (fark === 0) return 'bugün';
  if (fark === 1) return 'yarın';
  if (fark === -1) return 'dün bitmeliydi';
  if (fark < 0) return `${-fark} gün gecikti`;
  if (fark <= 14) return `${fark} gün kaldı`;
  return kisaTarih(dueDate);
}

/** Son hareketin üzerinden geçen gün; hiç hareket yoksa null. */
export function gecenGun(deger: string | null, simdi: Date = new Date()): number | null {
  if (!deger) return null;
  return gunFarki(gunISO(deger), bugunISO(simdi));
}
