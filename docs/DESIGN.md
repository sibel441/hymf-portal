# HYMF Portal tasarım rehberi

Bir araştırma grubunun iç aracı. Kullanıcıların çoğu öğretim üyesi, ekrana günde birkaç dakika
bakıyor ve tek bir soruya cevap arıyor: "Kim ne yapıyor, kim takıldı?" Okunabilirlik gösterişten
önce gelir. Hissi bir laboratuvar defteri: düz kâğıt, mavi-siyah mürekkep, kenar boşluğunda tarih,
danışmanın kırmızı kalemi.

## 1. İlkeler

1. **İki mürekkep.** Öğrencinin yazdığı her şey mavi-siyah mürekkeple (`ink`), danışmanın geri
   bildirimi kırmızı kalemle (`pen`). Kırmızı kalem yalnız danışman geri bildirimi içindir; uyarı,
   hata veya marka rengi olarak kullanılmaz. Ekrandaki tek cesur fikir bu.
2. **Defter düzeni.** Zaman akışı (ilerleme notları ve geri bildirimler) sol kenar boşluğunda tarih,
   ince bir kenar çizgisi ve sağda metin olarak dizilir. Kart yığını değildir.
3. **Satır, kart değil.** Plan maddeleri, üyeler ve pano satırları çizgili satırlardır. Kart yalnız
   bir bölümü çevrelemek için (`Panel`) kullanılır, her öğeye kart verilmez.
4. **Sakin uyarı.** Gecikme ve hareketsizlik okra (`warn`) renginde, metinle söylenir ("12 gün
   önce"). Kırmızı alarm, yanıp sönen nokta, parlama yok.
5. **Az ve düz metin.** Kısa, Türkçe, cümle düzeninde. Bir eylem her yerde aynı adla geçer
   ("Kaydet" → "Kaydedildi").

## 2. Renk token'ları

`src/app/globals.css` içinde CSS değişkeni olarak tanımlı, Tailwind'e `@theme inline` ile
bağlıdır. Sınıf adı = token adı: `bg-paper`, `text-ink-2`, `border-line`, `bg-warn-soft` …
Koyu tema `prefers-color-scheme: dark` ile otomatik gelir; bileşende `dark:` sınıfı yazılmaz.

| Token | Açık | Koyu | Kullanım |
| --- | --- | --- | --- |
| `paper` | `#F5F6F8` | `#111418` | Sayfa zemini |
| `surface` | `#FFFFFF` | `#181C22` | Panel, tablo, menü zemini |
| `sunken` | `#ECEEF2` | `#1F242C` | Tablo başlığı, hover, seçili satır, kod |
| `line` | `#D9DDE4` | `#2B313A` | Ayırıcı çizgiler, panel kenarı |
| `line-strong` | `#B6BDC9` | `#3D4552` | Defter kenar çizgisi, vurgulu ayırıcı |
| `control` | `#868F9E` | `#666F7E` | Form alanı kenarı (≥ 3:1) |
| `ink` | `#17202E` | `#E6E8EC` | Ana metin, başlıklar |
| `ink-2` | `#414B5C` | `#B3B9C4` | İkincil metin, etiketler |
| `ink-3` | `#5B6577` | `#8E96A3` | Yardımcı metin, tarih, sayaç |
| `link` | `#23488F` | `#94B2EC` | Bağlantılar, odak halkası |
| `primary` | `#1E2A42` | `#D4DDEE` | Birincil buton zemini |
| `on-primary` | `#FFFFFF` | `#111418` | Birincil buton metni |
| `pen` / `pen-soft` | `#9A2232` / `#FBEEF0` | `#EE98A3` / `#33191F` | Yalnız danışman geri bildirimi |
| `info` / `info-soft` | `#1F4F8C` / `#E7EFFA` | `#9DBCEB` / `#1A2738` | "Devam ediyor" |
| `warn` / `warn-soft` | `#7F4A00` / `#FBF0DA` | `#E3B465` / `#33270F` | Gecikmiş, takıldı, 7 günden eski |
| `ok` / `ok-soft` | `#2C6639` / `#E5F2E8` | `#8FCB9C` / `#16291B` | Tamamlandı, kaydedildi |
| `review` / `review-soft` | `#5A3D93` / `#F0EBF9` | `#BFA8EA` / `#261F38` | "İncelemede" |
| `danger` / `danger-soft` | `#AE2318` / `#FCEBE9` | `#F19A90` / `#3A1A17` | Silme onayı, form hatası |

Tüm metin token'ları kendi zemininde (paper, surface, sunken, *-soft) WCAG AA 4.5:1'i geçer
(ölçüldü: en düşük `ink-3`/`sunken` 5.06).

Plan durumu → renk: `planlandi` nötr (`sunken` + `ink-2`), `devam_ediyor` info, `takildi` warn,
`incelemede` review, `tamamlandi` ok, `iptal` `ink-3` + üstü çizili. Bu eşleme yalnız
`DurumRozeti` içinde yaşar.

## 3. Tipografi

| Rol | Yazı tipi | Sınıf |
| --- | --- | --- |
| Sayfa başlığı (h1) | Newsreader 500 | `font-serif text-2xl sm:text-4xl` |
| Bölüm başlığı (h2) | Newsreader 500 | `font-serif text-2xl` |
| Alt başlık (h3), panel başlığı | Inter 600 | `text-lg font-semibold` |
| Okuma metni (notlar, özet) | Inter 400 | `text-base leading-7` |
| Arayüz, tablo, form | Inter 400/500 | `text-sm` |
| Rozet | Inter 500 | `text-xs` (12px, bu boyut yalnız rozette) |
| Tez başlığı | Newsreader italik | `font-serif italic text-xl sm:text-2xl` |
| Yol, iş no, kod | JetBrains Mono | `font-mono text-sm` |

Ölçek 12 / 14 / 16 / 18 / 24 / 36 (klasik ölçek). Sayılar, tarihler ve sayaçlar `tabular-nums`.
Okuma sütunu en fazla `max-w-prose` (≈ 65 karakter). Serif yalnız h1, h2 ve tez başlığında; gövde
metni Inter.

## 4. Boşluk, yüzey, köşe

- Boşluk ölçeği 4 px tabanlı: `1, 2, 3, 4, 6, 8, 12, 16` (Tailwind birimi). Bölümler arası
  `space-y-8`, panel içi `p-5 sm:p-6`, satır içi `py-3`.
- Köşe yarıçapı hiyerarşisi: form alanı ve buton `rounded-md` (6px), panel `rounded-lg` (8px), rozet
  `rounded` (4px), avatar `rounded-full`. Başka yarıçap yok.
- Gölge yalnız açılır menü, diyalog ve açılır panelde (`shadow-lg`). Panellerde gölge yok, kenar var.
- Sayfa genişliği `max-w-6xl`; tablo ağırlıklı sayfalar `max-w-7xl`.
- Mobil: 390 px'te yatay kaydırma yok. Tablolar küçük ekranda satır kartına döner (bkz. §6 Tablo).
  Sayfa kenar boşluğu `px-4`.

## 5. Yerleşim taslakları

Navbar (tek satır, beyaz, alt çizgi):

```
Ψ HYMF Portal   Kılavuzlar  Formlar  Duyurular  Kaynaklar  Dersler  Toplantılar  Üyeler  |  Çalışma alanı  Yönetim  (AÖ)
```

Öğrenci çalışma alanı:

```
Tez başlığı (serif italik)                              [Düzenle]
Danışman: Y. Moğulkoç   Özet metni (en çok 3 satır)     Drive klasörü

┌ Plan ─────────────────────────────── [Madde ekle] ┐  ┌ Bu hafta ne yaptım ───────┐
│ Gecikmiş (2)                                       │  │ [metin alanı]             │
│  ○ Bant yapısı hesabı    3 gün gecikti  Devam ed.  │  │ Madde: [seç]   [Kaydet]   │
│ Açık (4)                                           │  └───────────────────────────┘
│  ○ ...                                             │  Defter
│ Tamamlanan (5)  ▸                                  │  9 Eki │ Ata: Fonon hesabı ...
└────────────────────────────────────────────────────┘  7 Eki ┃ Y. Moğulkoç: k-nokta ...  (kırmızı kalem)
Dosyalar (tablo)                     İşlem geçmişi (katlanır)
```

Danışman panosu (hocanın ana ekranı):

```
Öğrencilerim                                   [YL] [DR]
Öğrenci          Program  Danışman       Açık  Gecikmiş  İlerleme      Son güncelleme
Sibel Dumamak    YL       Y. Moğulkoç       4         1  ━━━━━━─── 60%  2 gün önce
Mert Tuna        YL       Y. Moğulkoç       3         0  ━━──────── 20%  12 gün önce   (okra)
```

Yönetim paneli: üstte sekmeler (Üyeler, Davet listesi, Yetkiler, İşlem geçmişi), altta tek tablo.
Onay bekleyenler tablonun üstünde ayrı, kısa bir bölüm.

## 6. Bileşenler (`src/components/ui/`)

Yeni sayfalar bu bileşenleri kullanır, aynı işi gören yeni bir stil yazmaz.

| Bileşen | Ne zaman |
| --- | --- |
| `SayfaBasligi` | Her sayfanın üstü: `baslik`, opsiyonel `aciklama` (tek cümle) ve `eylemler`. Üstte etiket yok. |
| `Panel` | Bir bölümü çevreler: `baslik`, `aciklama`, `eylemler`, `children`. İç içe panel yok. |
| `Button` / `buttonClass()` | `variant`: `primary` (sayfada en çok bir tane), `secondary`, `ghost`, `danger`. `size`: `sm`, `md`. Link görünümlü buton için `buttonClass`. |
| `Rozet` | Kısa durum etiketi. `tone`: `notr`, `bilgi`, `uyari`, `basari`, `inceleme`, `tehlike`. Nokta veya ikon yok. |
| `DurumRozeti` | Plan durumu. Rengi kendisi seçer. |
| `YetkiRozeti` | Yalnız `admin` ve `superadmin` için görünür; `uye` için hiçbir şey çizmez. |
| `BasHarfAvatar` | Kişi göstergesi. Fotoğraf kullanılmaz. |
| `BosDurum` | Boş liste: ne olduğunu söyleyen başlık, ne yapılacağını söyleyen tek cümle, opsiyonel eylem. |
| `Uyari` | Satır içi bilgi/hata kutusu. `tone`: `bilgi`, `uyari`, `basari`, `tehlike`. |
| `Alan` + `inputSinifi` / `textareaSinifi` / `selectSinifi` | Form alanı: etiket üstte, yardım metni altta `ink-3`, hata altta `danger`. |
| `Sekmeler` | Sayfa içi gezinme (Link tabanlı). |
| `ErisimEngellendi` | 403 durumu. Kısa metin, "Kendi çalışma alanıma dön" veya "Ana sayfa" bağlantısı. |
| `OrnekVeriNotu` | Mock veriyle çalışan sayfaların üstünde tek satırlık not. |

Kurallar:

- **Tablo**: başlık satırı `bg-sunken text-ink-2 text-sm font-medium`, satırlar `border-t border-line`,
  hücre `px-4 py-3`, sayılar sağa yaslı `tabular-nums`. Satır hover `bg-sunken/60`. Tıklanabilir
  satırda tüm satır bir `Link`. `md` altında tablo gizlenir, aynı veri `divide-y` liste olarak
  gösterilir (ad üstte, sayılar altta tek satır).
- **Form**: etiket her zaman görünür (placeholder etiket yerine geçmez). Birincil buton formun
  sonunda solda. Kaydedince buton metni kısa süre "Kaydedildi" olur veya `Uyari tone="basari"`
  çıkar; toast yok.
- **Boş durum**: başlık ("Henüz plan maddesi yok"), tek cümle yönlendirme ("Danışmanınız madde
  ekleyince burada görünür. Kendi maddenizi de ekleyebilirsiniz."), varsa tek buton. İkon, çizim yok.
- **İkon**: lucide, yalnız eylem butonlarında ve anlam taşıdığı yerde (indir, sil, dış bağlantı,
  menü). Başlıkların önüne ikon konmaz. Boyut `size-4`, renk metinle aynı.
- **Tarih**: `src/lib/zaman.ts`. Akışta göreli ("3 gün önce"), `title` niteliğinde tam tarih. Son
  tarih "3 gün kaldı" / "2 gün gecikti". Zaman damgasını render eden öğeye
  `suppressHydrationWarning`.
- **Kişi adı**: listede tam ad; danışman sütununda `kisaAd()` ("Y. Moğulkoç"). Unvan varsa adın
  önüne, ayrı stil vermeden.
- **Odak**: tüm etkileşimli öğelerde görünür odak halkası (globals.css'te `:focus-visible`).
  `outline-none` yazılırsa yerine `focus-visible:ring-2 ring-link` konur.
- **Hareket**: yalnız kullanıcı eylemine cevap (açılır panel, katlanır grup). Sayfa açılışında
  animasyon yok. `prefers-reduced-motion` globals.css'te kapalı.

## 7. Metin

- Türkçe, cümle düzeni, kısa. "Notu kaydet", "Madde ekle", "Danışman ata", "Pasifleştir".
- İngilizce jargon yok: "Audit trail" değil **İşlem geçmişi**, "Dashboard" değil **Pano**, "Upload"
  değil **Yükle**, "RBAC" hiçbir yerde.
- Parantezli teknik açıklama yok: "Notu ilet (logla)" değil "Notu kaydet".
- Güvenliği öven metin yok ("şifrelenmiş özel alan", "RBAC aktif"). Erişim kısıtını gerektiği yerde
  bir kez, düz söyle: "Bu alanı yalnız siz ve danışmanınız görür."
- Hata mesajı ne olduğunu ve ne yapılacağını söyler, özür dilemez: "Dosya 25 MB'tan büyük. Büyük
  çıktılar için TRUBA yolunu plan maddesine yazın."
- Sayı + birim: "4 açık madde", "%60" (Türkçe yüzde işareti önde).

## 8. Yapma listesi

- Başlıkların önüne ikon koyma.
- BÜYÜK HARF etiket, `tracking-[0.14em] uppercase` başlık üstü etiketi, mono etiket yazma.
- `text-[10px]`, `text-[11px]`, `text-[13px]` gibi keyfi boyut kullanma. En küçük metin `text-xs`
  ve yalnız rozette.
- Gradient, blur leke, parlayan nokta, `shadow-red-*`, `ring-*/30` parıltısı, `backdrop-blur` kullanma.
- Stok fotoğraf avatar (Unsplash) kullanma, `BasHarfAvatar` kullan.
- Uydurma kişi, sayı, istatistik gösterme. Veri yoksa boş durum göster.
- Kırmızıyı (`pen`) danışman geri bildirimi dışında kullanma. Hata için `danger`, gecikme için `warn`.
- Her kutuya kart verme, her karta gölge verme.
- Ortalanmış uzun metin yazma; içerik sola yaslı.
- Meta bilgiyi orta noktayla zincirleme ("A · B · C"); ayrı satır veya virgül kullan.
- Buton ve bağlantı metnine "→" ekleme.
- `dark:` sınıfı yazma; renkler token'dan gelir.
- Tailwind'in ham renklerini (`slate-*`, `red-*`, `amber-*`, `emerald-*`, `sky-*`) yeni koda yazma.

## 9. Eski sınıfların eşleştirmesi (H8 için)

| Eski | Yeni |
| --- | --- |
| `bg-slate-950`, `bg-slate-950/xx` | `bg-paper` |
| `bg-slate-900`, `bg-slate-900/xx` | `bg-surface` |
| `bg-slate-800`, `bg-slate-800/xx`, `hover:bg-slate-800` | `bg-sunken`, `hover:bg-sunken` |
| `border-slate-800`, `border-slate-700`, `divide-slate-800` | `border-line`, `divide-line` |
| `text-white`, `text-slate-100`, `text-slate-200` | `text-ink` |
| `text-slate-300`, `text-slate-400` | `text-ink-2` |
| `text-slate-500`, `text-slate-600` | `text-ink-3` |
| `text-red-300/400`, `text-amber-300/400` (vurgu amaçlı) | kaldır, `text-ink` veya `text-ink-2` |
| `bg-red-700 hover:bg-red-600 text-white` (birincil buton) | `buttonClass({ variant: 'primary' })` |
| `bg-red-950/xx border-red-800 text-red-300` (hata kutusu) | `<Uyari tone="tehlike">` |
| `bg-emerald-950/xx … text-emerald-300` (başarı kutusu) | `<Uyari tone="basari">` |
| `text-[10px]`, `text-[11px]`, `text-xs` (gövde metni) | `text-sm` |
| `uppercase tracking-wider`, `tracking-[0.14em] uppercase` | kaldır |
| `font-mono` (kod/yol olmayan yerde) | kaldır |
| `rounded-2xl`, `rounded-3xl`, `rounded-xl` | panel `rounded-lg`, buton/alan `rounded-md` |
| `shadow-xl`, `shadow-lg shadow-*` (panel) | kaldır |
| `focus:border-red-600` | `focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/30` |
| `<RoleBadge role=… />` | `<YetkiRozeti yetki=… />` veya kadro metni |
| Başlık önündeki `<Icon />` | kaldır |
