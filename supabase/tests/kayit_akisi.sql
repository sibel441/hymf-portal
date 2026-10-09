-- ==============================================================================
-- Kayıt akışı kontrolleri (davet listesi, e-posta doğrulama, bekleyen danışman eşleşmesi)
-- ==============================================================================
-- seed_uyeler.sql'den sonra çalıştırın. Tek transaction, sonunda geri alınır.
-- Not: Gerçek kişilerin e-postaları zaten kayıtlıysa (hesap açılmışsa) bu test çakışır; o durumda
-- yalnız rls_kontrol.sql'i çalıştırın.

begin;
select set_config('request.jwt.claims', '', true);

-- Test için kendi davetlerimizi kuruyoruz (seed'e bağımlı olmasın).
insert into public.member_allowlist (email, full_name, kadro, yetki) values
  ('hoca@kayit-test.invalid', 'Kayıt Testi Hoca', 'hoca', 'admin'),
  ('kurucu@kayit-test.invalid', 'Kayıt Testi Kurucu', 'gelistirici', 'superadmin'),
  ('ogrenci@kayit-test.invalid', 'Kayıt Testi Öğrenci', 'yuksek_lisans', 'uye');
insert into public.pending_advisor_assignments (student_email, advisor_email, is_primary) values
  ('kurucu@kayit-test.invalid', 'hoca@kayit-test.invalid', true),
  ('ogrenci@kayit-test.invalid', 'hoca@kayit-test.invalid', true);

-- 1. Davetli adresle kayıt, e-posta doğrulanmadan yetki almaz.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, aud, role) values
  ('77777777-0000-4000-8000-000000000001', 'kurucu@kayit-test.invalid', null,
   '{"full_name":"Taklitçi","role":"hoca"}', 'authenticated', 'authenticated');
do $$ begin
  if (select is_approved or yetki <> 'uye' from public.profiles where id = '77777777-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 1. Doğrulanmamış e-posta davet yetkisini aldı';
  end if;
end $$;

-- 2. E-posta doğrulanınca davetteki kadro ve yetki uygulanır, ad davetten gelir.
update auth.users set email_confirmed_at = now() where id = '77777777-0000-4000-8000-000000000001';
do $$ begin
  if not exists (select 1 from public.profiles where id = '77777777-0000-4000-8000-000000000001'
                 and is_approved and yetki = 'superadmin' and kadro = 'gelistirici'
                 and full_name = 'Kayıt Testi Kurucu') then
    raise exception 'KALDI: 2. Doğrulamadan sonra davet uygulanmadı';
  end if;
  -- Danışman henüz hesap açmadı; eşleşme beklemede kalır, geliştiricinin alanı açılmaz.
  if exists (select 1 from public.student_workspaces where student_id = '77777777-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 2. Danışmansız geliştiriciye çalışma alanı açıldı';
  end if;
end $$;

-- 3. Hoca kayıt olunca bekleyen eşleşme danışman atamasına dönüşür ve geliştiricinin alanı açılır.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, aud, role) values
  ('77777777-0000-4000-8000-000000000002', 'hoca@kayit-test.invalid', now(), '{}', 'authenticated', 'authenticated');
do $$ begin
  if not exists (select 1 from public.advisor_assignments
                 where student_id = '77777777-0000-4000-8000-000000000001'
                   and advisor_id = '77777777-0000-4000-8000-000000000002' and is_primary) then
    raise exception 'KALDI: 3. Bekleyen danışman eşleşmesi taşınmadı';
  end if;
  if exists (select 1 from public.pending_advisor_assignments where student_email = 'kurucu@kayit-test.invalid') then
    raise exception 'KALDI: 3. Taşınan eşleşme beklemede kaldı';
  end if;
  if not exists (select 1 from public.student_workspaces where student_id = '77777777-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 3. Danışman atanınca geliştiricinin alanı açılmadı';
  end if;
end $$;

-- 4. Öğrenci sonradan kayıt olur: onaylanır, alanı açılır, danışmanı atanır.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, aud, role) values
  ('77777777-0000-4000-8000-000000000003', 'Ogrenci@Kayit-Test.invalid', now(), '{}', 'authenticated', 'authenticated');
do $$ begin
  if not exists (select 1 from public.profiles p
                 join public.student_workspaces w on w.student_id = p.id
                 join public.advisor_assignments a on a.student_id = p.id
                 where p.id = '77777777-0000-4000-8000-000000000003' and p.is_approved and p.kadro = 'yuksek_lisans') then
    raise exception 'KALDI: 4. Davetli öğrencinin kaydı tamamlanmadı (büyük harfli e-posta dahil)';
  end if;
end $$;

-- 5. Davetsiz kayıt onay bekler; sonradan davet listesine eklenince onaylanır.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, aud, role) values
  ('77777777-0000-4000-8000-000000000004', 'davetsiz@kayit-test.invalid', now(), '{"full_name":"Davetsiz Kişi"}', 'authenticated', 'authenticated');
do $$ begin
  if (select is_approved from public.profiles where id = '77777777-0000-4000-8000-000000000004') then
    raise exception 'KALDI: 5. Davetsiz kayıt otomatik onaylandı';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"77777777-0000-4000-8000-000000000002","role":"authenticated"}', true);
insert into public.member_allowlist (email, full_name, kadro, yetki) values
  ('davetsiz@kayit-test.invalid', 'Davetsiz Kişi', 'doktora', 'uye');
reset role;
select set_config('request.jwt.claims', '', true);

do $$ begin
  if not exists (select 1 from public.profiles where id = '77777777-0000-4000-8000-000000000004'
                 and is_approved and kadro = 'doktora') then
    raise exception 'KALDI: 5. Bekleyen üye davet listesine eklenince onaylanmadı';
  end if;
  if not exists (select 1 from public.uyelik_logs where target_id = '77777777-0000-4000-8000-000000000004' and action = 'onay') then
    raise exception 'KALDI: 5. Onay üyelik işlem geçmişine yazılmadı';
  end if;
end $$;

rollback;

select 'Kayıt akışı kontrolleri geçti' as sonuc;
