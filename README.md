# HYMF Araştırma Grubu Portalı

Ankara Üniversitesi Fen Fakültesi / Enstitüsü **Hesaplamalı Yoğun Madde Fiziği (HYMF)** araştırma grubuna özel, rol tabanlı erişim kontrollü (RBAC) akademik yönetim ve paylaşım platformu.

---

## 👥 Geliştirici Ekip (Collaborators)
- **Repo Sahibi:** [@sibel441](https://github.com/sibel441)
- **Geliştirici:** [@eigen-ml](https://github.com/eigen-ml)

---

## 🚀 Projeyi Kendi Bilgisayarınızda Çalıştırma (Hızlı Başlangıç)

Eğer projeye yeni katıldıysanız (örn: `@eigen-ml`), aşağıdaki 4 adımı izleyerek projeyi 1 dakikada ayağa kaldırabilirsiniz:

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/sibel441/hymf-portal.git
cd hymf-portal
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini (.env.local) Hazırlayın
Proje ana dizinindeki `.env.local.example` dosyasının bir kopyasını oluşturup adını `.env.local` yapın:
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasının içini Supabase ve Telegram bilgileriyle doldurun:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjjpjvozrexaxpvevum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=-100xxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak portala erişebilirsiniz!

---

## 📁 Proje Klasör Yapısı ve Modüller

```
hymf-portal/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Ana Sayfa & Dashboard (Karşılama, misyon, hızlı özet)
│   │   ├── kilavuzlar/page.tsx    # TRUBA SSH/Slurm, VASP INCAR, LAMMPS MD, Okul VPN
│   │   ├── formlar/page.tsx       # Fen Bilimleri Enstitüsü (Fizik & Fizik Müh.) belgeleri
│   │   ├── uyeler/page.tsx        # Üye Vitrini (Akademik profiller, ORCID, Scholar)
│   │   ├── duyurular/page.tsx     # Duyuru Panosu & Telegram Bildirim Akışı
│   │   ├── kaynaklar/page.tsx     # Ortak Havuz (Makale PDF, linkler, Python/Slurm scriptleri)
│   │   ├── dersler/page.tsx       # Lisansüstü dersler, syllabus, haftalık slaytlar
│   │   ├── toplantilar/page.tsx   # Haftalık seminer takvimi ve sunum PDF'leri
│   │   ├── calisma-alani/page.tsx # Kişisel Çalışma Alanı (RBAC Gizli Sayfa & Audit Log)
│   │   ├── giris/page.tsx         # Giriş yap, şifremi unuttum & hızlı rol test modülü
│   │   ├── kayit/page.tsx         # Yeni araştırmacı kayıt formu
│   │   ├── profil/page.tsx        # Kişisel profil düzenleme
│   │   └── api/telegram/route.ts  # Telegram Bot API entegrasyonu (Acil/Toplantı bildirimi)
│   ├── components/                # Navbar, Footer, CodeBlock, RoleBadge
│   ├── context/AuthContext.tsx    # Rol bazlı erişim kontrolü (Hoca, Yönetici, Araştırmacı)
│   ├── lib/mockData.ts            # Başlangıç verileri ve modeller
│   └── types/database.ts          # TypeScript veri şemaları
├── supabase/
│   └── schema.sql                 # PostgreSQL tabloları, enum'lar ve RLS politikaları
└── .env.local.example             # Çevre değişkenleri şablonu
```

---

## 🔒 Rol ve Yetki Matrisi (RBAC)

1. **Sorumlu Hocalar (`hoca`):** Tüm öğrencilerin gizli çalışma alanlarını görebilir, geri bildirim notu bırakabilir, ders materyali ve duyuru ekleyebilir.
2. **Yöneticiler (`yonetici` - 2 Öğrenci):** Hoca adına ders asiste edebilir, tüm öğrenci çalışma alanlarını denetleyebilir, tüm kaynakları yönetebilir.
3. **Normal Araştırmacılar (`arastirmaci`):** Yalnızca kendi tez/simülasyon çalışma alanını görür ve düzenler (diğer öğrencilerin verilerine erişim 403 engellidir). Duyuru yapabilir, script ve kaynak paylaşabilir.
