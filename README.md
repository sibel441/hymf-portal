# HYMF Araştırma Grubu Portalı

Ankara Üniversitesi **Hesaplamalı Yoğun Madde Fiziği (HYMF)** araştırma grubunun iç portalı: duyurular,
kaynaklar, dersler, toplantılar, kılavuzlar, üye vitrini ve öğrencilerin danışmanlarıyla paylaştığı
çalışma alanı (plan, ilerleme notları, dosyalar).

Canlı: https://hymf-portal.vercel.app

## Ekip
- **Repo sahibi:** [@sibel441](https://github.com/sibel441)
- **Geliştirici:** [@eigen-ml](https://github.com/eigen-ml)

## Üyelik
Portal kapalıdır: açık kayıt yok, girişsiz ziyaretçi yalnız ana sayfayı görür. Hesapları yöneticiler
/yonetim → Davetler → "Üye ekle" ile geçici şifreyle açar. Şifresini unutan üyeye yönetici
/yonetim → Üyeler → Düzenle → "Şifre sıfırla" ile yeni şifre verir (e-postayla sıfırlama yok).

Her üyenin bir **kadrosu** ve bir **yetkisi** vardır.

| Kadro | |
| --- | --- |
| `hoca` | Öğretim üyesi. Danışmanı olduğu öğrencilerin çalışma alanlarını görür, plan maddesi ekler. |
| `doktora`, `yuksek_lisans`, `lisans` | Öğrenci. Çalışma alanını yalnız kendisi ve danışman(lar)ı görür. |
| `gelistirici` | Portalın geliştiricisi. Danışman atanırsa çalışma alanı açılır. |

| Yetki | |
| --- | --- |
| `superadmin` | Her şey. Hoca ve yönetici hesapları üzerindeki işlemler (kadroyu `hoca` yapmak, yönetici davet etmek, pasifleştirmek, şifre sıfırlamak) yalnız onda. |
| `admin` | Üye ekler, onaylar, danışman atar, üyelerin şifresini sıfırlar. Öğrencilerin çalışma alanlarını **görmez**. |
| `uye` | Duyuru, kaynak ve toplantı ekler; kendi eklediğini siler. |

Ders ve ders materyalini hocalar ve yöneticiler ekler. Kuralların asıl yeri veritabanıdır (RLS):
`supabase/migrations/`. Ayrıntılı kararlar `docs/PLAN.md` §1'de.

## Canlı ortam ve canlıya alma
- **Veritabanı ve giriş:** Supabase, proje `fkjjpjvozrexaxpvevum`.
- **Barındırma:** Vercel, proje `hymf-portal`. Vercel, `eigen-ml/hymf-portal` fork'una bağlıdır:
  fork'un `main` dalına giren her commit **otomatik olarak canlıya çıkar**, diğer dallar önizleme
  (preview) adresi alır.
- Sıra her zaman: **önce migration (Supabase SQL Editor), sonra kod.** Migration çalışmadan
  canlıya çıkan kod siteyi kırar. Adımlar: `docs/KURULUM.md`.
- Canlıda elle denenecekler: `docs/CANLI_TEST.md`.

## Yerelde çalıştırma
```bash
git clone https://github.com/sibel441/hymf-portal.git
cd hymf-portal
npm install
cp .env.local.example .env.local   # değerleri doldurun
npm run dev                        # http://localhost:3000
```

`.env.local`:

| Değişken | |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnız sunucu. "Üye ekle" ve "Şifre sıfırla" bununla çalışır. `NEXT_PUBLIC_` önekiyle **asla** eklemeyin, commit'lemeyin. Yerelde gerekmiyorsa boş bırakın. |
| `NEXT_PUBLIC_DEMO_MODE` | `true` eski demo davranışlarını (rol değiştirici, örnek hesaplar) açar. Canlıda `false`. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Duyuruların Telegram grubuna gönderilmesi. Boşsa gönderilmez. |
| `NEXT_PUBLIC_SITE_URL` | Telegram mesajındaki bağlantı. Yerelde `http://localhost:3000`. |

Kontrol: `npx tsc --noEmit` ve `npm run lint`.

## Klasör yapısı
```
src/
├── app/
│   ├── page.tsx              # Ana sayfa (girişsiz görünen tek sayfa)
│   ├── giris/                # Giriş, "Beni hatırla"
│   ├── onay-bekleniyor/      # Onaysız/pasif hesap
│   ├── sifre-yenile/         # Şifre değiştirme (girişli)
│   ├── calisma-alani/        # Öğrencinin alanı; hocanın danışman panosu ([ogrenciId])
│   ├── yonetim/              # Üyeler, davetler, yetkiler, işlem geçmişi
│   ├── uyeler/, profil/      # Üye vitrini ve profil
│   ├── duyurular/, kaynaklar/, dersler/, toplantilar/
│   └── kilavuzlar/, formlar/ # TRUBA/VASP/LAMMPS kılavuzları, enstitü formları
├── components/               # ui/ (ortak), calisma/, yonetim/, Navbar, Footer
├── lib/
│   ├── data/                 # Supabase sorguları (Sonuc<T> döner)
│   ├── supabase/             # İstemci, sunucu ve admin (service role) bağlantıları
│   ├── auth/, yetki.ts       # Oturum ve yetki yardımcıları
│   └── telegram.ts
├── proxy.ts                  # Girişsiz isteği /giris'e yönlendirir
└── types/database.ts
supabase/
├── schema.sql                # İlk şema (boş veritabanı için)
├── migrations/               # Sırayla çalıştırılır
├── seed_uyeler.sql           # Davet listesi ve danışman eşleşmeleri
└── tests/                    # RLS ve kayıt akışı testleri (her şeyi geri alır)
docs/
├── KURULUM.md                # Supabase, Vercel ve canlıya alma adımları
├── CANLI_TEST.md             # Canlıda elle test listesi, kalan işler
├── PLAN.md                   # Veri modeli ve kararlar
└── DESIGN.md                 # Arayüz kuralları
```
