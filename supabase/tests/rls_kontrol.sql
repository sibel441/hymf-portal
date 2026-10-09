-- ==============================================================================
-- RLS ve trigger kontrolleri
-- ==============================================================================
-- Migration ve seed'den sonra SQL Editor'de çalıştırın. Her şey tek transaction içinde yapılır ve
-- sonunda geri alınır; gerçek veriye dokunmaz. Bir kontrol başarısız olursa betik
-- "KALDI: ..." hatasıyla durur. Hepsi geçerse son satırda "Tüm RLS kontrolleri geçti" yazar.
--
-- Kalıp: postgres olarak kurulum, sonra her senaryoda
--   set local role authenticated; + request.jwt.claims içinde kullanıcının id'si
-- ile o kullanıcı gibi davranılır, ardından reset role ve claims temizlenir.
--
-- Test kişileri (gerçek kişilerle aynı rolde, e-postalar @hymf-test.invalid):
--   H1 hoca/admin (Y. Moğulkoç gibi)   H2 hoca/admin (A. Moğulkoç gibi)   H3 hoca/uye (M. Kabak gibi)
--   S  gelistirici/superadmin (Ata gibi)   AD yuksek_lisans/admin (Sibel gibi)
--   A  yuksek_lisans/uye   B doktora/uye   N onaysız yeni kayıt
-- Danışmanlık: H1 → A, AD; H2 → B.

begin;

-- ---------- Kurulum (postgres, sistem bağlamı) ----------
select set_config('request.jwt.claims', '', true);

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, aud, role) values
  ('11111111-0000-4000-8000-000000000001', 'h1@hymf-test.invalid', now(), '{"full_name":"Test H1"}', 'authenticated', 'authenticated'),
  ('11111111-0000-4000-8000-000000000002', 'h2@hymf-test.invalid', now(), '{"full_name":"Test H2"}', 'authenticated', 'authenticated'),
  ('11111111-0000-4000-8000-000000000003', 'h3@hymf-test.invalid', now(), '{"full_name":"Test H3"}', 'authenticated', 'authenticated'),
  ('22222222-0000-4000-8000-000000000001', 's@hymf-test.invalid', now(), '{"full_name":"Test S"}', 'authenticated', 'authenticated'),
  ('33333333-0000-4000-8000-000000000001', 'ad@hymf-test.invalid', now(), '{"full_name":"Test AD"}', 'authenticated', 'authenticated'),
  ('44444444-0000-4000-8000-000000000001', 'a@hymf-test.invalid', now(), '{"full_name":"Test A","role":"hoca","yetki":"superadmin"}', 'authenticated', 'authenticated'),
  ('55555555-0000-4000-8000-000000000001', 'b@hymf-test.invalid', now(), '{"full_name":"Test B"}', 'authenticated', 'authenticated'),
  ('66666666-0000-4000-8000-000000000001', 'n@hymf-test.invalid', now(), '{"full_name":"Test N"}', 'authenticated', 'authenticated');

do $$ begin
  -- Kayıt metadata'sındaki rol/yetki yok sayılmalı.
  if (select is_approved or yetki <> 'uye' or kadro is not null
      from public.profiles where id = '44444444-0000-4000-8000-000000000001') then
    raise exception 'KALDI: handle_new_user metadata''daki rolü veya yetkiyi kabul etti';
  end if;
end $$;

-- Sabit id'li çalışma alanları (onaydan önce açılır, onay trigger'ı on conflict ile dokunmaz).
insert into public.student_workspaces (id, student_id) values
  ('aaaaaaaa-0000-4000-8000-00000000000a', '44444444-0000-4000-8000-000000000001'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', '55555555-0000-4000-8000-000000000001'),
  ('adadadad-0000-4000-8000-0000000000ad', '33333333-0000-4000-8000-000000000001');

update public.profiles set kadro = 'hoca', yetki = 'admin', is_approved = true where id = '11111111-0000-4000-8000-000000000001';
update public.profiles set kadro = 'hoca', yetki = 'admin', is_approved = true where id = '11111111-0000-4000-8000-000000000002';
update public.profiles set kadro = 'hoca', yetki = 'uye', is_approved = true where id = '11111111-0000-4000-8000-000000000003';
update public.profiles set kadro = 'gelistirici', yetki = 'superadmin', is_approved = true where id = '22222222-0000-4000-8000-000000000001';
update public.profiles set kadro = 'yuksek_lisans', yetki = 'admin', is_approved = true where id = '33333333-0000-4000-8000-000000000001';
update public.profiles set kadro = 'yuksek_lisans', yetki = 'uye', is_approved = true where id = '44444444-0000-4000-8000-000000000001';
update public.profiles set kadro = 'doktora', yetki = 'uye', is_approved = true where id = '55555555-0000-4000-8000-000000000001';

-- "Son sistem yöneticisi" kontrolünün anlamlı olması için gerçek superadmin'ler bu transaction
-- içinde geçici olarak admin'e alınır (rollback ile geri döner).
update public.profiles set yetki = 'admin'
where yetki = 'superadmin' and id <> '22222222-0000-4000-8000-000000000001';

insert into public.advisor_assignments (student_id, advisor_id, is_primary) values
  ('44444444-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001', true),
  ('33333333-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001', true),
  ('55555555-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000002', true);

insert into public.plan_items (id, workspace_id, title, created_by) values
  ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-00000000000a', 'H1''in verdiği madde', '11111111-0000-4000-8000-000000000001'),
  ('cccccccc-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-00000000000a', 'A''nın kendi maddesi', '44444444-0000-4000-8000-000000000001'),
  ('cccccccc-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-00000000000b', 'B''nin maddesi', '11111111-0000-4000-8000-000000000002');

insert into public.progress_updates (workspace_id, author_id, body) values
  ('bbbbbbbb-0000-4000-8000-00000000000b', '55555555-0000-4000-8000-000000000001', 'B''nin notu');

-- ---------- 1. Öğrenci A, B'nin alanını göremez ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.student_workspaces where student_id = '55555555-0000-4000-8000-000000000001') <> 0
     or (select count(*) from public.plan_items where workspace_id = 'bbbbbbbb-0000-4000-8000-00000000000b') <> 0
     or (select count(*) from public.progress_updates where workspace_id = 'bbbbbbbb-0000-4000-8000-00000000000b') <> 0 then
    raise exception 'KALDI: 1. A, B''nin çalışma alanını veya içeriğini görebiliyor';
  end if;
  if (select count(*) from public.student_workspaces) <> 1 then
    raise exception 'KALDI: 1. A kendi alanını göremiyor ya da fazlasını görüyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 2. Admin öğrenci (AD) başka öğrencinin alanını göremez ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.student_workspaces
      where student_id in ('44444444-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000001')) <> 0
     or (select count(*) from public.plan_items where workspace_id = 'aaaaaaaa-0000-4000-8000-00000000000a') <> 0
     or (select count(*) from public.workspace_logs where workspace_id = 'aaaaaaaa-0000-4000-8000-00000000000a') <> 0 then
    raise exception 'KALDI: 2. Admin öğrenci başka öğrencinin alanını görebiliyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 3. Superadmin danışmanı olmadığı öğrencinin alanını göremez ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.student_workspaces) <> 0
     or (select count(*) from public.plan_items) <> 0 then
    raise exception 'KALDI: 3. Superadmin danışmanı olmadığı alanı görebiliyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 4. Danışman kendi öğrencisini görür, diğerini görmez; danışman olmayan hoca hiçbirini ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.student_workspaces where student_id = '44444444-0000-4000-8000-000000000001') <> 1 then
    raise exception 'KALDI: 4. H1 kendi öğrencisi A''nın alanını göremiyor';
  end if;
  if (select count(*) from public.student_workspaces where student_id = '55555555-0000-4000-8000-000000000001') <> 0 then
    raise exception 'KALDI: 4. H1 danışmanı olmadığı B''nin alanını görebiliyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$ declare n int; begin
  if (select count(*) from public.student_workspaces) <> 0 or (select count(*) from public.plan_items) <> 0 then
    raise exception 'KALDI: 4. Danışman olmayan hoca bir çalışma alanı görebiliyor';
  end if;
  begin
    insert into public.plan_items (workspace_id, title) values ('aaaaaaaa-0000-4000-8000-00000000000a', 'izinsiz');
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  if n <> 0 then raise exception 'KALDI: 4. Danışman olmayan hoca plan maddesi ekleyebildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 5. Admin (hoca olmayan) kendini veya bir öğrenciyi danışman atayamaz; hoca admin atayabilir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin
    insert into public.advisor_assignments (student_id, advisor_id) values
      ('55555555-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001');
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  if n <> 0 then raise exception 'KALDI: 5. Admin öğrenci kendini danışman atayabildi'; end if;
  begin
    insert into public.advisor_assignments (student_id, advisor_id) values
      ('55555555-0000-4000-8000-000000000001', '44444444-0000-4000-8000-000000000001');
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  if n <> 0 then raise exception 'KALDI: 5. Admin bir öğrenciyi danışman atayabildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$ declare n int; begin
  insert into public.advisor_assignments (student_id, advisor_id) values
    ('44444444-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000002');
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 5. Hoca admin danışman ataması yapamadı'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 6. Öğrenci kendi yetkisini, kadrosunu, onayını yükseltemez; adını değiştirebilir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin update public.profiles set yetki = 'admin' where id = '44444444-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 6. Öğrenci kendine admin yetkisi verebildi'; end if;

  begin update public.profiles set kadro = 'hoca' where id = '44444444-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 6. Öğrenci kendini hoca yapabildi'; end if;

  begin update public.profiles set is_active = false, is_approved = false where id = '44444444-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 6. Öğrenci kendi onay/aktiflik durumunu değiştirebildi'; end if;

  begin update public.profiles set role = 'hoca' where id = '44444444-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 6. Öğrenci eski role kolonunu değiştirebildi'; end if;

  begin update public.profiles set full_name = 'Başkası' where id = '55555555-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 6. Öğrenci başkasının profilini değiştirebildi'; end if;

  update public.profiles set full_name = 'Test A Yeni' where id = '44444444-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 6. Öğrenci kendi adını değiştiremedi'; end if;
end $$;

-- apply_allowlist doğrudan çağrılamaz (kendini başkasının davetiyle yükseltme).
do $$ declare ok boolean := false; begin
  begin
    perform public.apply_allowlist('44444444-0000-4000-8000-000000000001', 's@hymf-test.invalid');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'KALDI: 6. apply_allowlist istemciden çağrılabiliyor'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 7. Öğrenci danışmanın maddesinde başlığı değiştiremez, durumu değiştirebilir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin update public.plan_items set title = 'değiştirildi' where id = 'cccccccc-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 7. Öğrenci danışmanın maddesinin başlığını değiştirebildi'; end if;

  begin update public.plan_items set due_date = current_date + 30 where id = 'cccccccc-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 7. Öğrenci danışmanın maddesinin son tarihini değiştirebildi'; end if;

  update public.plan_items set status = 'devam_ediyor', truba_ref = '/arf/scratch/a/is-1' where id = 'cccccccc-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 7. Öğrenci danışmanın maddesinin durumunu değiştiremedi'; end if;

  update public.plan_items set status = 'tamamlandi', completed_at = '2000-01-01' where id = 'cccccccc-0000-4000-8000-000000000001';
  if (select completed_at::date = '2000-01-01' or completed_at is null from public.plan_items where id = 'cccccccc-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 7. completed_at trigger''la doldurulmadı ya da istemci değeri kabul edildi';
  end if;

  begin delete from public.plan_items where id = 'cccccccc-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 7. Öğrenci danışmanın maddesini silebildi'; end if;

  update public.plan_items set title = 'A''nın düzenlenmiş maddesi' where id = 'cccccccc-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 7. Öğrenci kendi maddesini düzenleyemedi'; end if;

  delete from public.plan_items where id = 'cccccccc-0000-4000-8000-000000000002';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 7. Öğrenci kendi maddesini silemedi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 8. Danışman olmayan, admin olmayan hoca davet listesine yazamaz ve okuyamaz ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$ declare n int; begin
  begin
    insert into public.member_allowlist (email, full_name, kadro) values ('yeni1@hymf-test.invalid', 'Yeni Bir', 'doktora');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 8. Admin olmayan hoca davet listesine yazabildi'; end if;
  if (select count(*) from public.member_allowlist) <> 0 then
    raise exception 'KALDI: 8. Admin olmayan hoca davet listesini okuyabildi';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 9. Admin, admin yetkisi veremez; superadmin verebilir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin update public.profiles set yetki = 'admin' where id = '44444444-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 9. Admin başkasına admin yetkisi verebildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  update public.profiles set yetki = 'admin' where id = '44444444-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 9. Superadmin admin yetkisi veremedi'; end if;
  update public.profiles set yetki = 'uye' where id = '44444444-0000-4000-8000-000000000001';
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 10. Admin davet listesine admin veya hoca ekleyemez; öğrenci ekleyebilir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin
    insert into public.member_allowlist (email, full_name, kadro, yetki) values ('yeni2@hymf-test.invalid', 'Yeni İki', 'doktora', 'admin');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 10. Admin davet listesine admin ekleyebildi'; end if;

  begin
    insert into public.member_allowlist (email, full_name, kadro, yetki) values ('yeni3@hymf-test.invalid', 'Yeni Üç', 'hoca', 'uye');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 10. Admin davet listesine öğretim üyesi ekleyebildi'; end if;

  insert into public.member_allowlist (email, full_name, kadro, yetki) values ('Yeni4@HYMF-test.invalid', 'Yeni Dört', 'doktora', 'uye');
  if not exists (select 1 from public.member_allowlist where email = 'yeni4@hymf-test.invalid') then
    raise exception 'KALDI: 10. Admin öğrenci daveti ekleyemedi veya e-posta küçültülmedi';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 11. Admin kendi kadrosunu değiştiremez; bekleyen üyeyi hoca yapamaz ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin update public.profiles set kadro = 'hoca' where id = '33333333-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 11. Admin kendi kadrosunu hoca yapabildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  -- N'nin kadrosu henüz null; null → hoca geçişi de engellenmeli.
  begin update public.profiles set kadro = 'hoca' where id = '66666666-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 11. Admin bekleyen üyeyi öğretim üyesi yapabildi'; end if;

  update public.profiles set kadro = 'doktora', is_approved = true where id = '66666666-0000-4000-8000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 11. Admin bekleyen üyeyi doktora olarak onaylayamadı'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

do $$ begin
  if not exists (select 1 from public.student_workspaces where student_id = '66666666-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 11. Onaylanan doktora öğrencisinin çalışma alanı açılmadı';
  end if;
end $$;

-- ---------- 12. Son superadmin kendi yetkisini bırakamaz ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin update public.profiles set yetki = 'admin' where id = '22222222-0000-4000-8000-000000000001'; get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 12. Son superadmin kendi yetkisini bırakabildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 13. Öğrenci workspace_logs'a yazamaz; plan işlemi log'u trigger yazar ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin
    insert into public.workspace_logs (workspace_id, actor_id, action) values
      ('aaaaaaaa-0000-4000-8000-00000000000a', '11111111-0000-4000-8000-000000000001', 'plan_silindi');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 13. Öğrenci işlem geçmişine kayıt yazabildi'; end if;

  insert into public.plan_items (workspace_id, title, created_by) values
    ('aaaaaaaa-0000-4000-8000-00000000000a', 'A''nın yeni maddesi', '11111111-0000-4000-8000-000000000001');
  if not exists (select 1 from public.plan_items where title = 'A''nın yeni maddesi'
                 and created_by = '44444444-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 13. created_by istemciden taklit edilebildi';
  end if;
  if not exists (select 1 from public.workspace_logs where workspace_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
                 and action = 'plan_eklendi' and actor_id = '44444444-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 13. plan_eklendi log''u trigger''la yazılmadı';
  end if;
  if (select last_student_activity_at from public.student_workspaces where id = 'aaaaaaaa-0000-4000-8000-00000000000a') is null then
    raise exception 'KALDI: 13. Öğrencinin son aktivitesi güncellenmedi';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 14. Not türü yazara göre belirlenir ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
insert into public.progress_updates (workspace_id, tur, body) values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'geri_bildirim', 'Öğrencinin taklit denemesi');
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
insert into public.progress_updates (workspace_id, body) values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'Danışmanın geri bildirimi');
reset role;
select set_config('request.jwt.claims', '', true);

do $$ begin
  if (select tur from public.progress_updates where body = 'Öğrencinin taklit denemesi') <> 'ilerleme' then
    raise exception 'KALDI: 14. Öğrenci geri bildirim türü taklit edebildi';
  end if;
  if (select tur from public.progress_updates where body = 'Danışmanın geri bildirimi') <> 'geri_bildirim' then
    raise exception 'KALDI: 14. Danışmanın notu geri bildirim olarak kaydedilmedi';
  end if;
end $$;

-- ---------- 15. Onaysız kullanıcı yalnız kendi profilini görür ----------
update public.profiles set is_approved = false where id = '66666666-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"66666666-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1
     or not exists (select 1 from public.profiles where id = '66666666-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 15. Onaysız kullanıcı başka profilleri görebiliyor veya kendini göremiyor';
  end if;
  if (select count(*) from public.student_workspaces) <> 0 then
    raise exception 'KALDI: 15. Onaysız kullanıcı çalışma alanı görebiliyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 16. Üyelik işlem geçmişini öğrenci okuyamaz, admin okur ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.uyelik_logs) <> 0 then
    raise exception 'KALDI: 16. Öğrenci üyelik işlem geçmişini okuyabiliyor';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if not exists (select 1 from public.uyelik_logs where action = 'yetki'
                 and target_id = '44444444-0000-4000-8000-000000000001'
                 and actor_id = '22222222-0000-4000-8000-000000000001') then
    raise exception 'KALDI: 16. Yetki değişikliği üyelik işlem geçmişine yazılmadı';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

-- ---------- 17. Dosyalar: yalnız kendi alanının klasörüne yüklenir, başkasınınki okunmaz ----------
insert into storage.objects (bucket_id, name, owner_id) values
  ('workspace-files', 'bbbbbbbb-0000-4000-8000-00000000000b/b-dosyasi.pdf', '55555555-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare n int; begin
  begin
    insert into storage.objects (bucket_id, name, owner_id) values
      ('workspace-files', 'bbbbbbbb-0000-4000-8000-00000000000b/izinsiz.pdf', '44444444-0000-4000-8000-000000000001');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 17. Öğrenci başkasının klasörüne dosya yükleyebildi'; end if;

  begin
    insert into storage.objects (bucket_id, name, owner_id) values
      ('workspace-files', 'gecersiz-klasor/dosya.pdf', '44444444-0000-4000-8000-000000000001');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 17. Geçersiz klasöre dosya yüklenebildi'; end if;

  if (select count(*) from storage.objects where bucket_id = 'workspace-files'
      and name like 'bbbbbbbb-0000-4000-8000-00000000000b/%') <> 0 then
    raise exception 'KALDI: 17. Öğrenci başkasının dosyasını görebiliyor';
  end if;

  insert into storage.objects (bucket_id, name, owner_id) values
    ('workspace-files', 'aaaaaaaa-0000-4000-8000-00000000000a/a-dosyasi.pdf', '44444444-0000-4000-8000-000000000001');
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'KALDI: 17. Öğrenci kendi klasörüne dosya yükleyemedi'; end if;

  begin
    insert into public.workspace_files (workspace_id, file_name, storage_path) values
      ('aaaaaaaa-0000-4000-8000-00000000000a', 'yanlis.pdf', 'bbbbbbbb-0000-4000-8000-00000000000b/yanlis.pdf');
    get diagnostics n = row_count;
  exception when others then n := 0; end;
  if n <> 0 then raise exception 'KALDI: 17. Dosya kaydı başka alanın klasörünü gösterebildi'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '', true);

rollback;

select 'Tüm RLS kontrolleri geçti' as sonuc;
