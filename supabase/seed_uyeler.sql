-- ==============================================================================
-- Seed: Allowlist ve danışman atamaları
-- ==============================================================================
-- Migration'dan sonra SQL Editor'de çalıştırın; tekrar çalıştırmak güvenlidir.
-- E-postası bilinen 4 kişi hemen eklenir. Diğer 7 kişi yorum satırında: e-postaları gelince
-- TODO_... yerine gerçek adresi yazıp ilgili bloğun yorumunu kaldırın ve dosyayı yeniden çalıştırın.
-- Davetli kişi kayıt olup e-postasını doğruladığında kadro/yetkisini alır; danışman eşleşmesi iki
-- taraf da hesap açınca otomatik atamaya dönüşür (hesap açılış sırası fark etmez).

-- Allowlist: 4 onaylı üye
insert into public.member_allowlist (email, full_name, kadro, yetki)
values
  ('mogulkoc@eng.ankara.edu.tr', 'Yeşim Moğulkoç', 'hoca', 'admin'),
  ('mogulkoc@science.ankara.edu.tr', 'Aybey Moğulkoç', 'hoca', 'admin'),
  ('ataberkozturk@ankara.edu.tr', 'Ata Berk Öztürk', 'gelistirici', 'superadmin'),
  ('mkabak@eng.ankara.edu.tr', 'Mehmet Kabak', 'hoca', 'uye')
on conflict (email) do update set
  full_name = excluded.full_name,
  kadro = excluded.kadro,
  yetki = excluded.yetki;

-- Allowlist: 7 kişi (TODO e-postalar)
-- insert into public.member_allowlist (email, full_name, kadro, yetki)
-- values
--   ('TODO_sibel@ankara.edu.tr', 'Sibel Dumamak', 'yuksek_lisans', 'admin'),
--   ('TODO_mert@ankara.edu.tr', 'Mert Tuna', 'yuksek_lisans', 'uye'),
--   ('TODO_mustafa@ankara.edu.tr', 'Mustafa Atasoy', 'yuksek_lisans', 'uye'),
--   ('TODO_sena@ankara.edu.tr', 'Sena Güleçoğlu', 'yuksek_lisans', 'uye'),
--   ('TODO_cengizhan@ankara.edu.tr', 'Cengizhan Gülhan', 'yuksek_lisans', 'uye'),
--   ('TODO_ali@ankara.edu.tr', 'Ali Korkmaz', 'doktora', 'uye'),
--   ('TODO_samed@ankara.edu.tr', 'Samed Gümüş', 'doktora', 'uye')
-- on conflict (email) do update set
--   full_name = excluded.full_name,
--   kadro = excluded.kadro,
--   yetki = excluded.yetki;

-- Danışman atamaları: Ata → Yeşim Moğulkoç (birincil)
insert into public.pending_advisor_assignments (student_email, advisor_email, is_primary)
values
  ('ataberkozturk@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true)
on conflict do nothing;

-- Danışman atamaları: Diğer öğrenciler (TODO e-postalar)
-- Yeşim'in öğrencileri (mogulkoc@eng.ankara.edu.tr):
-- insert into public.pending_advisor_assignments (student_email, advisor_email, is_primary)
-- values
--   ('TODO_sibel@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true),
--   ('TODO_cengizhan@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true),
--   ('TODO_samed@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true),
--   ('TODO_mert@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true),
--   ('TODO_mustafa@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true),  -- resmî değil, panelden iş veriyor
--   ('TODO_sena@ankara.edu.tr', 'mogulkoc@eng.ankara.edu.tr', true)       -- resmî değil, panelden iş veriyor
-- on conflict do nothing;

-- Aybey'in öğrencileri (mogulkoc@science.ankara.edu.tr):
-- insert into public.pending_advisor_assignments (student_email, advisor_email, is_primary)
-- values
--   ('TODO_ali@ankara.edu.tr', 'mogulkoc@science.ankara.edu.tr', true)
-- on conflict do nothing;

-- Danışman atamaları uygulaması
select public.materialize_pending_advisors();
