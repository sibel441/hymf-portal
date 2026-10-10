# Canlı test listesi (https://hymf-portal.vercel.app)

1. **Girişsiz** (gizli pencere): yalnız ana sayfa ve "Giriş yap" görünmeli; /duyurular gibi bir adres girişe atmalı.
2. **Giriş**: kendi hesabınla gir, menüde "Yönetim" olmalı.
3. **Beni hatırla**: işaretsiz gir → tarayıcıyı tamamen kapat-aç → çıkış yapılmış olmalı. İşaretliyle açık kalmalı.
   (Chrome "kaldığın yerden devam et" açıksa işaretsizde de açık kalabilir; bu tarayıcı ayarı.)
4. **Üye ekle** (/yonetim → Davetler): "Üret" ile şifre al, çıkan e-posta/şifreyi not et.
   - Yeşim Moğulkoç — mogulkoc@eng.ankara.edu.tr — hoca, yönetici
   - Aybey Moğulkoç — mogulkoc@science.ankara.edu.tr — hoca, yönetici
   - Mehmet Kabak — mkabak@eng.ankara.edu.tr — hoca, üye
   Sonra: /uyeler'de görünmeliler; senin çalışma alanında danışman "Y. Moğulkoç" olmalı.
5. **Şifre sıfırla** (/yonetim → Üyeler → Düzenle): yeni şifreyle gizli pencerede giriş yapılabilmeli.
   İşlem geçmişinde "şifre sıfırlandı" satırı olmalı.
6. **İçerik**: duyuru ekle (Telegram grubuna düştü mü?), kaynak, toplantı ekle ve sil;
   ders ekle (öğretim üyesi listesinde hocalar olmalı) ve derse materyal ekle.
7. **Profil → Şifremi değiştir** çalışmalı.

## Sorun çıkarsa
- Site kırıldıysa geri al: `npx vercel rollback https://hymf-portal-jdg3aa3zw-ataberkozs-projects.vercel.app`
- Hata mesajını / ekran görüntüsünü al, yeni sohbette "docs/CANLI_TEST.md N. adımda şu oldu" diye yapıştır.

## Kalan işler
- Supabase panelinden erişim token'ını sil (Account → Access Tokens).
- Diğer 7 kişinin e-postaları gelince /yonetim → Üye ekle (liste: `supabase/seed_uyeler.sql` TODO satırları).
- Sibel PR #1'i merge edince fork'ta "Sync fork".
