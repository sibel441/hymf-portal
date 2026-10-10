-- ==============================================================================
-- Çalışma alanı ve yönetim paneli migration
-- ==============================================================================
-- Kullanım: SQL Editor'den tek seferde çalıştırılır.
-- Sıra: 1. supabase/schema.sql 2. bu dosya 3. supabase/seed_uyeler.sql 4. supabase/tests/rls_kontrol.sql
-- Gereksinim: Supabase Auth'ta "Confirm email" açık olmalı.
-- İdempotent: tekrar çalıştırmak güvenlidir. Eski role → kadro/yetki geçişi yalnız ilk çalıştırmada yapılır.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    raise exception 'Önce supabase/schema.sql dosyasını çalıştırın (public.profiles bulunamadı).';
  end if;
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_workspaces') then
    raise exception 'Önce supabase/schema.sql dosyasını çalıştırın (public.student_workspaces bulunamadı).';
  end if;
end $$;

-- ===== 1. Enum'lar =====
do $$
begin
  create type public.kadro as enum ('hoca','doktora','yuksek_lisans','lisans','gelistirici');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.yetki as enum ('superadmin','admin','uye');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.plan_durum as enum ('planlandi','devam_ediyor','takildi','incelemede','tamamlandi','iptal');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.guncelleme_turu as enum ('ilerleme','geri_bildirim');
exception when duplicate_object then null;
end $$;

-- ===== 2. profiles: Kolon ekleme ve geçiş (ilk çalıştırmada) =====
-- Eski role'den kadro/yetki'ye geçiş
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='kadro') then
    -- İlk kez çalıştırılıyor; eski role'yi dönüştür
    alter table public.profiles add column kadro public.kadro null;
    alter table public.profiles add column yetki public.yetki not null default 'uye';
    alter table public.profiles add column is_active boolean not null default true;

    -- role = 'hoca' → kadro = 'hoca'
    update public.profiles set kadro = 'hoca'::public.kadro where role = 'hoca';

    -- role = 'yonetici' → yetki = 'admin'
    update public.profiles set yetki = 'admin'::public.yetki where role = 'yonetici';

    -- Eski handle_new_user metadata'daki rolü kabul ettiği için mevcut hesapların rolü güvenilir değil.
    -- Hepsi onaysız olur; seed_uyeler.sql davet listesine eklenenleri yeniden onaylar, diğerlerini
    -- bir yönetici panelden onaylar.
    update public.profiles set is_approved = false;

    comment on column public.profiles.role is 'DEPRECATED: kadro ve yetki kullanın';
  end if;
end $$;

-- Sonraki çalıştırmalarda zararsız tekrar
alter table public.profiles add column if not exists kadro public.kadro null;
alter table public.profiles add column if not exists yetki public.yetki not null default 'uye';
alter table public.profiles add column if not exists is_active boolean not null default true;

-- is_approved varsayılanını false yap (yalnız yeni satırlar için; mevcut değişmez)
alter table public.profiles alter column is_approved set default false;

-- academic_title varsayılanını kaldır (null)
alter table public.profiles alter column academic_title set default null;

-- scholar_url yalnız http(s) olabilir (javascript: bağlantısını engeller). Eski satırlar için not valid.
alter table public.profiles drop constraint if exists scholar_url_check;
alter table public.profiles drop constraint if exists profiles_scholar_url_https;
alter table public.profiles add constraint profiles_scholar_url_https
  check (scholar_url is null or scholar_url ~* '^https?://') not valid;

-- ===== 3. Yeni tablolar =====

create table if not exists public.member_allowlist (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  full_name text not null check (char_length(full_name) between 2 and 120),
  kadro public.kadro not null,
  yetki public.yetki not null default 'uye',
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.pending_advisor_assignments (
  student_email text not null check (student_email = lower(student_email)),
  advisor_email text not null check (advisor_email = lower(advisor_email)),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  primary key (student_email, advisor_email)
);

create table if not exists public.advisor_assignments (
  student_id uuid not null references public.profiles(id) on delete cascade,
  advisor_id uuid not null references public.profiles(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  primary key (student_id, advisor_id),
  check (student_id <> advisor_id)
);

-- student_workspaces için yeni kolonlar
alter table public.student_workspaces add column if not exists drive_url text
  check (drive_url is null or drive_url ~* '^https://');
alter table public.student_workspaces add column if not exists last_student_activity_at timestamptz null;
alter table public.student_workspaces alter column thesis_title set default null;
comment on column public.student_workspaces.advisor is 'DEPRECATED: advisor_assignments kullanın';

-- plan_items tablosu
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.student_workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  description text check (description is null or char_length(description) <= 5000),
  due_date date,
  status public.plan_durum not null default 'planlandi',
  priority smallint not null default 2 check (priority between 1 and 3),
  sort_order integer not null default 0,
  truba_ref text check (truba_ref is null or char_length(truba_ref) <= 500),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- progress_updates tablosu
create table if not exists public.progress_updates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.student_workspaces(id) on delete cascade,
  plan_item_id uuid references public.plan_items(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  tur public.guncelleme_turu not null default 'ilerleme',
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- workspace_files: yeni/değiştirilmiş kolonlar
alter table public.workspace_files add column if not exists plan_item_id uuid references public.plan_items(id) on delete set null;
alter table public.workspace_files add column if not exists storage_path text;
alter table public.workspace_files add column if not exists size_bytes bigint check (size_bytes is null or size_bytes between 0 and 26214400);
alter table public.workspace_files add column if not exists mime_type text;

-- uploaded_by: FK yeniden kur (on delete set null)
alter table public.workspace_files drop constraint if exists workspace_files_uploaded_by_fkey;
alter table public.workspace_files drop constraint if exists workspace_files_uploaded_by_profiles_fk;
alter table public.workspace_files alter column uploaded_by drop not null;
alter table public.workspace_files add constraint workspace_files_uploaded_by_fkey
  foreign key (uploaded_by) references public.profiles(id) on delete set null;

-- file_url: drop not null
alter table public.workspace_files alter column file_url drop not null;

-- workspace_logs: actor_id yeniden kur, yeni kolonlar
alter table public.workspace_logs drop constraint if exists workspace_logs_actor_id_fkey;
alter table public.workspace_logs alter column actor_id drop not null;
alter table public.workspace_logs add constraint workspace_logs_actor_id_fkey
  foreign key (actor_id) references public.profiles(id) on delete set null;
alter table public.workspace_logs add column if not exists entity_id uuid;
alter table public.workspace_logs add column if not exists details jsonb not null default '{}';

-- uyelik_logs tablosu
create table if not exists public.uyelik_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  target_id uuid,
  target_email text,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Index'ler
create unique index if not exists advisor_assignments_tek_birincil
  on public.advisor_assignments (student_id) where is_primary;
create index if not exists advisor_assignments_advisor_idx on public.advisor_assignments (advisor_id);
create index if not exists plan_items_workspace_sira_idx on public.plan_items (workspace_id, sort_order);
create index if not exists progress_updates_workspace_tarih_idx on public.progress_updates (workspace_id, created_at desc);
create index if not exists workspace_files_workspace_idx on public.workspace_files (workspace_id);
create index if not exists workspace_logs_workspace_tarih_idx on public.workspace_logs (workspace_id, created_at desc);
create index if not exists uyelik_logs_tarih_idx on public.uyelik_logs (created_at desc);

-- ===== 4. FK adlarını düzelt (drop & recreate) =====
alter table public.plan_items drop constraint if exists plan_items_created_by_fkey;
alter table public.plan_items add constraint plan_items_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.plan_items drop constraint if exists plan_items_updated_by_fkey;
alter table public.plan_items add constraint plan_items_updated_by_fkey
  foreign key (updated_by) references public.profiles(id) on delete set null;

alter table public.progress_updates drop constraint if exists progress_updates_author_id_fkey;
alter table public.progress_updates add constraint progress_updates_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;

-- ===== 5. Yardımcı fonksiyonlar =====

-- Sistem bağlamı: SQL Editor / auth trigger'ları (auth.uid() boş) ya da iç fonksiyonların açtığı
-- hymf.sistem bayrağı. Hiçbir zaman NULL dönmez: ayar tanımsızken current_setting NULL verir ve
-- `not null` koşulu guard'ları sessizce atlatırdı.
create or replace function public.sistem_baglami()
returns boolean as $$
  select (select auth.uid()) is null or coalesce(current_setting('hymf.sistem', true), '') = 'on'
$$ language sql stable security definer set search_path = '';

create or replace function public.is_member()
returns boolean as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and is_approved and is_active)
$$ language sql stable security definer set search_path = '';

create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and is_approved and is_active and yetki in ('admin','superadmin'))
$$ language sql stable security definer set search_path = '';

create or replace function public.is_superadmin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and is_approved and is_active and yetki = 'superadmin')
$$ language sql stable security definer set search_path = '';

create or replace function public.is_hoca()
returns boolean as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and is_approved and is_active and kadro = 'hoca')
$$ language sql stable security definer set search_path = '';

create or replace function public.is_advisor_of(p_student uuid)
returns boolean as $$
  select exists (
    select 1 from public.advisor_assignments aa
    where aa.student_id = p_student and aa.advisor_id = (select auth.uid())
    and exists (select 1 from public.profiles where id = aa.advisor_id and kadro = 'hoca' and is_approved and is_active)
  )
$$ language sql stable security definer set search_path = '';

create or replace function public.workspace_student(p_ws uuid)
returns uuid as $$
  select student_id from public.student_workspaces where id = p_ws
$$ language sql stable security definer set search_path = '';

create or replace function public.can_view_workspace(p_ws uuid)
returns boolean as $$
  select public.is_member() and (
    (select student_id from public.student_workspaces where id = p_ws) = (select auth.uid())
    or public.is_advisor_of((select student_id from public.student_workspaces where id = p_ws))
  )
$$ language sql stable security definer set search_path = '';

create or replace function public.try_uuid(t text)
returns uuid as $$
declare v_result uuid;
begin
  begin
    v_result := t::uuid;
    return v_result;
  exception when others then
    return null;
  end;
end;
$$ language plpgsql immutable;

-- ===== 6. İç fonksiyonlar (apply_allowlist, materialize_pending_advisors) =====

create or replace function public.apply_allowlist(p_user uuid, p_email text)
returns void as $$
declare
  v_row public.member_allowlist%rowtype;
begin
  select * into v_row from public.member_allowlist where email = lower(p_email) limit 1;

  if v_row.email is not null then
    perform set_config('hymf.sistem','on',true);

    update public.profiles set
      kadro = v_row.kadro,
      yetki = v_row.yetki,
      full_name = v_row.full_name,
      is_approved = true
    where id = p_user;

    if v_row.kadro in ('doktora', 'yuksek_lisans', 'lisans') then
      insert into public.student_workspaces (student_id)
      values (p_user)
      on conflict (student_id) do nothing;
    end if;

    perform public.materialize_pending_advisors(lower(p_email));

    perform set_config('hymf.sistem','off',true);
  end if;
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.materialize_pending_advisors(p_email text default null)
returns void as $$
declare
  v_row public.pending_advisor_assignments%rowtype;
  v_student_id uuid;
  v_advisor_id uuid;
begin
  if not public.sistem_baglami() and not public.is_admin() then
    raise exception 'Bu işlem için yetkiniz yok.' using errcode = '42501';
  end if;

  for v_row in
    select paa.*
    from public.pending_advisor_assignments paa
    where (p_email is null or paa.student_email = lower(p_email) or paa.advisor_email = lower(p_email))
  loop
    select id into v_student_id from public.profiles
    where lower(email) = v_row.student_email and is_approved and kadro in ('doktora','yuksek_lisans','lisans','gelistirici');

    select id into v_advisor_id from public.profiles
    where lower(email) = v_row.advisor_email and is_approved and is_active and kadro = 'hoca';

    if v_student_id is not null and v_advisor_id is not null then
      insert into public.advisor_assignments (student_id, advisor_id, is_primary, created_by)
      values (v_student_id, v_advisor_id, v_row.is_primary, v_row.created_by)
      on conflict do nothing;

      delete from public.pending_advisor_assignments
      where student_email = v_row.student_email and advisor_email = v_row.advisor_email;
    end if;
  end loop;
end;
$$ language plpgsql security definer set search_path = '';

-- apply_allowlist doğrudan çağrılırsa herkes kendini istediği e-postanın yetkisine yükseltebilirdi.
-- Yalnız trigger'lar (fonksiyon sahibi olarak) çağırır. Supabase authenticated'a ayrıca execute
-- verdiği için oradan da açıkça geri alınır.
revoke execute on function public.apply_allowlist(uuid, text) from public, anon, authenticated;
-- materialize_pending_advisors yöneticilerin elle çağırabilmesi için authenticated'da kalır; içeride
-- is_admin kontrolü var.
revoke execute on function public.materialize_pending_advisors(text) from public, anon;

-- ===== 7. Trigger fonksiyonları =====

-- handle_new_user: profil oluşturma (auth.users INSERT)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_full_name text;
  v_department text;
begin
  v_full_name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''), split_part(new.email,'@',1)), 120);
  v_department := left(nullif(new.raw_user_meta_data->>'department',''), 120);

  -- Metadata'dan yalnız ad ve bölüm okunur; rol, kadro, yetki ve onay asla okunmaz.
  insert into public.profiles (id, email, full_name, department, is_approved, yetki, kadro)
  values (new.id, lower(new.email), v_full_name, v_department, false, 'uye', null);

  insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
  values (null, new.id, lower(new.email), 'kayit',
    jsonb_build_object('hedef_ad', v_full_name));

  if new.email_confirmed_at is not null then
    perform public.apply_allowlist(new.id, new.email);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- E-posta doğrulanınca allowlist uygula
create or replace function public.on_auth_user_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform public.apply_allowlist(new.id, new.email);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.on_auth_user_confirmed();

-- profiles_guard: BEFORE UPDATE (sistem bağlamı hariç güvenlik kuralları)
create or replace function public.profiles_guard()
returns trigger as $$
declare
  v_ben uuid := (select auth.uid());
begin
  -- Son sistem yöneticisi kuralı sistem bağlamında da geçerli.
  if old.is_approved and old.is_active and old.yetki = 'superadmin'
     and not (new.is_approved and new.is_active and new.yetki = 'superadmin') then
    if not exists (
      select 1 from public.profiles
      where id <> old.id and is_approved and is_active and yetki = 'superadmin'
    ) then
      raise exception 'Son sistem yöneticisi yetkisini bırakamaz.' using errcode = '42501';
    end if;
  end if;

  if public.sistem_baglami() then
    return new;
  end if;

  if new.id is distinct from old.id or new.email is distinct from old.email
     or new.created_at is distinct from old.created_at then
    raise exception 'Kimlik, e-posta ve kayıt tarihi değiştirilemez.' using errcode = '42501';
  end if;

  if not public.is_admin() then
    if new.kadro is distinct from old.kadro
       or new.is_approved is distinct from old.is_approved
       or new.is_active is distinct from old.is_active
       or new.role is distinct from old.role then
      raise exception 'Kadro, onay ve hesap durumunu yalnız yöneticiler değiştirebilir.' using errcode = '42501';
    end if;
  end if;

  if new.yetki is distinct from old.yetki and not public.is_superadmin() then
    raise exception 'Yetki değişikliğini yalnız sistem yöneticisi yapabilir.' using errcode = '42501';
  end if;

  if not public.is_superadmin() then
    -- Superadmin dışında kimse kendi kadrosunu değiştiremez (kendini hoca yapıp danışman atanarak
    -- başkasının planını görmeyi engeller).
    if new.kadro is distinct from old.kadro and old.id = v_ben then
      raise exception 'Kendi kadronuzu değiştiremezsiniz.' using errcode = '42501';
    end if;

    if new.kadro is distinct from old.kadro
       and (old.kadro = 'hoca' or new.kadro = 'hoca') then
      raise exception 'Öğretim üyesi kadrosunu yalnız sistem yöneticisi atayabilir.' using errcode = '42501';
    end if;

    if not old.is_approved and new.is_approved
       and (new.yetki <> 'uye' or new.kadro = 'hoca') then
      raise exception 'Yöneticiyi veya öğretim üyesini yalnız sistem yöneticisi onaylayabilir.' using errcode = '42501';
    end if;

    if old.id <> v_ben and old.yetki in ('admin', 'superadmin')
       and (new.is_active is distinct from old.is_active or new.is_approved is distinct from old.is_approved) then
      raise exception 'Yönetici hesaplarını yalnız sistem yöneticisi pasifleştirebilir.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists profiles_guard_trigger on public.profiles;
create trigger profiles_guard_trigger
  before update on public.profiles
  for each row execute function public.profiles_guard();

-- profiles_after_update: Yetki/Kadro/Onay değişikliklerini uyelik_logs'a yaz
create or replace function public.profiles_after_update()
returns trigger as $$
begin
  if new.kadro is distinct from old.kadro then
    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), new.id, new.email, 'kadro',
      jsonb_build_object('hedef_ad', new.full_name, 'eski', old.kadro::text, 'yeni', new.kadro::text));
  end if;

  if new.yetki <> old.yetki then
    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), new.id, new.email, 'yetki',
      jsonb_build_object('hedef_ad', new.full_name, 'eski', old.yetki::text, 'yeni', new.yetki::text));
  end if;

  if new.is_approved <> old.is_approved then
    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), new.id, new.email,
      (case when new.is_approved then 'onay' else 'onay_kaldirildi' end),
      jsonb_build_object('hedef_ad', new.full_name));
  end if;

  if new.is_active <> old.is_active then
    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), new.id, new.email, 'aktiflik',
      jsonb_build_object('hedef_ad', new.full_name, 'eski', old.is_active::text, 'yeni', new.is_active::text));
  end if;

  -- Yeni satır onaylı ve kadrosu doktora/yuksek_lisans/lisans ise çalışma alanını aç
  if new.is_approved and new.kadro in ('doktora','yuksek_lisans','lisans') then
    insert into public.student_workspaces (student_id)
    values (new.id)
    on conflict (student_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists profiles_after_update_trigger on public.profiles;
create trigger profiles_after_update_trigger
  after update on public.profiles
  for each row execute function public.profiles_after_update();

-- member_allowlist triggers
create or replace function public.member_allowlist_before()
returns trigger as $$
begin
  new.email := lower(trim(new.email));
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  end if;

  if not public.sistem_baglami() and not public.is_superadmin() then
    if new.yetki <> 'uye' or new.kadro = 'hoca'
       or (tg_op = 'UPDATE' and (old.yetki <> 'uye' or old.kadro = 'hoca')) then
      raise exception 'Yönetici ya da öğretim üyesi davetini yalnız sistem yöneticisi ekleyebilir.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists member_allowlist_before_trigger on public.member_allowlist;
create trigger member_allowlist_before_trigger
  before insert or update on public.member_allowlist
  for each row execute function public.member_allowlist_before();

create or replace function public.member_allowlist_after_insert()
returns trigger as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from public.profiles
  where lower(email) = new.email and is_approved = false
  and exists (select 1 from auth.users where id = profiles.id and email_confirmed_at is not null)
  limit 1;

  if v_profile_id is not null then
    perform public.apply_allowlist(v_profile_id, new.email);
  end if;

  insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
  values ((select auth.uid()), null, new.email, 'davet_eklendi',
    jsonb_build_object('hedef_ad', new.full_name, 'kadro', new.kadro::text, 'yetki', new.yetki::text));

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists member_allowlist_after_insert_trigger on public.member_allowlist;
create trigger member_allowlist_after_insert_trigger
  after insert on public.member_allowlist
  for each row execute function public.member_allowlist_after_insert();

create or replace function public.member_allowlist_after_update()
returns trigger as $$
begin
  insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
  values ((select auth.uid()), null, new.email, 'davet_guncellendi',
    jsonb_build_object('hedef_ad', new.full_name, 'kadro', new.kadro::text, 'yetki', new.yetki::text));
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists member_allowlist_after_update_trigger on public.member_allowlist;
create trigger member_allowlist_after_update_trigger
  after update on public.member_allowlist
  for each row execute function public.member_allowlist_after_update();

create or replace function public.member_allowlist_after_delete()
returns trigger as $$
begin
  insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
  values ((select auth.uid()), null, old.email, 'davet_silindi',
    jsonb_build_object('hedef_ad', old.full_name));
  return old;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists member_allowlist_after_delete_trigger on public.member_allowlist;
create trigger member_allowlist_after_delete_trigger
  after delete on public.member_allowlist
  for each row execute function public.member_allowlist_after_delete();

-- pending_advisor_assignments triggers
create or replace function public.pending_advisor_assignments_before()
returns trigger as $$
begin
  new.student_email := lower(trim(new.student_email));
  new.advisor_email := lower(trim(new.advisor_email));
  new.created_by := (select auth.uid());
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists pending_advisor_assignments_before_trigger on public.pending_advisor_assignments;
create trigger pending_advisor_assignments_before_trigger
  before insert on public.pending_advisor_assignments
  for each row execute function public.pending_advisor_assignments_before();

create or replace function public.pending_advisor_assignments_after_insert()
returns trigger as $$
begin
  perform public.materialize_pending_advisors(new.student_email);
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists pending_advisor_assignments_after_insert_trigger on public.pending_advisor_assignments;
create trigger pending_advisor_assignments_after_insert_trigger
  after insert on public.pending_advisor_assignments
  for each row execute function public.pending_advisor_assignments_after_insert();

-- advisor_assignments triggers
create or replace function public.advisor_assignments_guard()
returns trigger as $$
declare
  v_student_profile public.profiles%rowtype;
  v_advisor_profile public.profiles%rowtype;
begin
  select * into v_student_profile from public.profiles where id = new.student_id;
  select * into v_advisor_profile from public.profiles where id = new.advisor_id;

  if v_advisor_profile.id is null or v_advisor_profile.kadro is distinct from 'hoca'
     or not v_advisor_profile.is_approved or not v_advisor_profile.is_active then
    raise exception 'Danışman yalnız öğretim üyesi olabilir.' using errcode = '42501';
  end if;

  if v_student_profile.id is null
     or coalesce(v_student_profile.kadro::text, '') not in ('doktora','yuksek_lisans','lisans','gelistirici') then
    raise exception 'Danışman yalnız öğrenci kadrosundaki üyeye atanabilir.' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    if new.student_id is distinct from old.student_id or new.advisor_id is distinct from old.advisor_id then
      raise exception 'Danışman ataması değiştirilemez.' using errcode = '42501';
    end if;
  end if;

  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists advisor_assignments_guard_trigger on public.advisor_assignments;
create trigger advisor_assignments_guard_trigger
  before insert or update on public.advisor_assignments
  for each row execute function public.advisor_assignments_guard();

create or replace function public.advisor_assignments_after()
returns trigger as $$
declare
  v_student_name text;
  v_advisor_name text;
begin
  -- DELETE'te new null'dur; adlar old'dan okunur. Profil silinmişse (cascade) ad null kalır.
  select full_name into v_student_name from public.profiles where id = coalesce(new.student_id, old.student_id);
  select full_name into v_advisor_name from public.profiles where id = coalesce(new.advisor_id, old.advisor_id);

  if tg_op = 'INSERT' then
    insert into public.student_workspaces (student_id)
    values (new.student_id)
    on conflict (student_id) do nothing;

    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), new.student_id, null, 'danisman_eklendi',
      jsonb_build_object('hedef_ad', v_student_name, 'danisman_id', new.advisor_id::text, 'danisman_ad', v_advisor_name));

  elsif tg_op = 'UPDATE' then
    if new.is_primary and not old.is_primary then
      insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
      values ((select auth.uid()), new.student_id, null, 'danisman_birincil',
        jsonb_build_object('hedef_ad', v_student_name, 'danisman_id', new.advisor_id::text, 'danisman_ad', v_advisor_name));
    end if;

  elsif tg_op = 'DELETE' then
    insert into public.uyelik_logs (actor_id, target_id, target_email, action, details)
    values ((select auth.uid()), old.student_id, null, 'danisman_kaldirildi',
      jsonb_build_object('hedef_ad', v_student_name, 'danisman_id', old.advisor_id::text, 'danisman_ad', v_advisor_name));
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists advisor_assignments_after_trigger on public.advisor_assignments;
create trigger advisor_assignments_after_trigger
  after insert or update or delete on public.advisor_assignments
  for each row execute function public.advisor_assignments_after();

-- student_workspaces triggers
create or replace function public.student_workspaces_before_update()
returns trigger as $$
begin
  new.updated_at := now();

  if not public.sistem_baglami() then
    if new.student_id is distinct from old.student_id then
      raise exception 'Çalışma alanının sahibi değiştirilemez.' using errcode = '42501';
    end if;

    if (new.thesis_title is distinct from old.thesis_title
      or new.summary is distinct from old.summary
      or new.drive_url is distinct from old.drive_url
      or new.simulation_notes is distinct from old.simulation_notes)
      and (select auth.uid()) = new.student_id then
      new.last_student_activity_at := now();
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists student_workspaces_before_update_trigger on public.student_workspaces;
create trigger student_workspaces_before_update_trigger
  before update on public.student_workspaces
  for each row execute function public.student_workspaces_before_update();

create or replace function public.student_workspaces_after_update()
returns trigger as $$
declare
  v_alanlar text[];
begin
  v_alanlar := array_remove(array[
    case when new.thesis_title is distinct from old.thesis_title then 'thesis_title' end,
    case when new.summary is distinct from old.summary then 'summary' end,
    case when new.drive_url is distinct from old.drive_url then 'drive_url' end,
    case when new.simulation_notes is distinct from old.simulation_notes then 'simulation_notes' end
  ], null);
  if cardinality(v_alanlar) > 0 then
    insert into public.workspace_logs (workspace_id, actor_id, action, details)
    values (new.id, (select auth.uid()), 'alan_guncellendi', jsonb_build_object('alanlar', v_alanlar));
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists student_workspaces_after_update_trigger on public.student_workspaces;
create trigger student_workspaces_after_update_trigger
  after update on public.student_workspaces
  for each row execute function public.student_workspaces_after_update();

-- touch_workspace fonksiyonu (log trigger'lardan çağrılır)
create or replace function public.touch_workspace(p_ws uuid)
returns void as $$
begin
  update public.student_workspaces
  set updated_at = now(),
      last_student_activity_at = case when student_id = (select auth.uid()) then now()
                                      else last_student_activity_at end
  where id = p_ws;
end;
$$ language plpgsql security definer set search_path = '';

revoke execute on function public.touch_workspace(uuid) from public, anon, authenticated;

-- plan_items triggers
create or replace function public.plan_items_before_insert()
returns trigger as $$
begin
  new.created_by := coalesce((select auth.uid()), new.created_by);
  new.updated_by := new.created_by;
  new.created_at := now();
  new.updated_at := now();

  if coalesce(new.sort_order, 0) = 0 then
    new.sort_order := coalesce((select max(sort_order) + 1 from public.plan_items where workspace_id = new.workspace_id), 1);
  end if;

  -- İstemcinin gönderdiği completed_at yok sayılır.
  new.completed_at := case when new.status = 'tamamlandi' then now() end;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists plan_items_before_insert_trigger on public.plan_items;
create trigger plan_items_before_insert_trigger
  before insert on public.plan_items
  for each row execute function public.plan_items_before_insert();

create or replace function public.plan_items_guard()
returns trigger as $$
begin
  if not public.sistem_baglami() then
    if new.workspace_id is distinct from old.workspace_id or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Maddenin çalışma alanı, ekleyeni ve eklenme tarihi değiştirilemez.' using errcode = '42501';
    end if;

    if not public.is_advisor_of(public.workspace_student(old.workspace_id)) and old.created_by is distinct from (select auth.uid()) then
      if (new.title, new.description, new.due_date, new.priority, new.sort_order) is distinct from (old.title, old.description, old.due_date, old.priority, old.sort_order) then
        raise exception 'Danışmanın eklediği maddede yalnız durum ve TRUBA bilgisi değiştirilebilir.' using errcode = '42501';
      end if;
    end if;
  end if;

  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  new.updated_at := now();

  -- completed_at yalnız durumdan türetilir; istemcinin gönderdiği değer yok sayılır.
  if new.status = 'tamamlandi' and old.status <> 'tamamlandi' then
    new.completed_at := now();
  elsif new.status = 'tamamlandi' then
    new.completed_at := old.completed_at;
  else
    new.completed_at := null;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists plan_items_guard_trigger on public.plan_items;
create trigger plan_items_guard_trigger
  before update on public.plan_items
  for each row execute function public.plan_items_guard();

create or replace function public.plan_items_log()
returns trigger as $$
declare
  v_ws_exists boolean;
  v_alanlar text[];
begin
  select exists(select 1 from public.student_workspaces where id = coalesce(new.workspace_id, old.workspace_id))
  into v_ws_exists;

  if not v_ws_exists then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (new.workspace_id, (select auth.uid()), 'plan_eklendi', new.id,
      jsonb_build_object('baslik', new.title));

  elsif tg_op = 'UPDATE' then
    v_alanlar := array_remove(array[
      case when new.title is distinct from old.title then 'title' end,
      case when new.description is distinct from old.description then 'description' end,
      case when new.due_date is distinct from old.due_date then 'due_date' end,
      case when new.priority is distinct from old.priority then 'priority' end,
      case when new.truba_ref is distinct from old.truba_ref then 'truba_ref' end
    ], null);

    -- Yalnız sıralama değiştiyse log yazılmaz ve son aktivite güncellenmez.
    if cardinality(v_alanlar) = 0 and new.status = old.status then
      return new;
    end if;

    if cardinality(v_alanlar) > 0 then
      insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
      values (new.workspace_id, (select auth.uid()), 'plan_guncellendi', new.id,
        jsonb_build_object('baslik', new.title, 'alanlar', v_alanlar));
    end if;

    if new.status <> old.status then
      insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
      values (new.workspace_id, (select auth.uid()), 'plan_durum', new.id,
        jsonb_build_object('baslik', new.title, 'eski', old.status::text, 'yeni', new.status::text));
    end if;

  elsif tg_op = 'DELETE' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (old.workspace_id, (select auth.uid()), 'plan_silindi', old.id,
      jsonb_build_object('baslik', old.title));
  end if;

  perform public.touch_workspace(coalesce(new.workspace_id, old.workspace_id));
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists plan_items_log_trigger on public.plan_items;
create trigger plan_items_log_trigger
  after insert or update or delete on public.plan_items
  for each row execute function public.plan_items_log();

-- progress_updates triggers
create or replace function public.progress_updates_before_insert()
returns trigger as $$
begin
  new.author_id := coalesce((select auth.uid()), new.author_id);

  if not public.sistem_baglami() then
    if public.is_advisor_of(public.workspace_student(new.workspace_id)) then
      new.tur := 'geri_bildirim'::public.guncelleme_turu;
    else
      new.tur := 'ilerleme'::public.guncelleme_turu;
    end if;
  end if;

  if new.plan_item_id is not null then
    if not exists (select 1 from public.plan_items where id = new.plan_item_id and workspace_id = new.workspace_id) then
      raise exception 'Plan maddesi bu çalışma alanına ait değil.' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists progress_updates_before_insert_trigger on public.progress_updates;
create trigger progress_updates_before_insert_trigger
  before insert on public.progress_updates
  for each row execute function public.progress_updates_before_insert();

create or replace function public.progress_updates_before_update()
returns trigger as $$
begin
  if new.workspace_id is distinct from old.workspace_id or new.author_id is distinct from old.author_id
     or new.tur is distinct from old.tur or new.created_at is distinct from old.created_at then
    raise exception 'Notun yazarı, türü ve çalışma alanı değiştirilemez.' using errcode = '42501';
  end if;

  new.updated_at := now();

  if new.plan_item_id is not null then
    if not exists (select 1 from public.plan_items where id = new.plan_item_id and workspace_id = new.workspace_id) then
      raise exception 'Plan maddesi bu çalışma alanına ait değil.' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists progress_updates_before_update_trigger on public.progress_updates;
create trigger progress_updates_before_update_trigger
  before update on public.progress_updates
  for each row execute function public.progress_updates_before_update();

create or replace function public.progress_updates_log()
returns trigger as $$
declare
  v_ws_exists boolean;
  v_action text;
begin
  select exists(select 1 from public.student_workspaces where id = coalesce(new.workspace_id, old.workspace_id))
  into v_ws_exists;

  if not v_ws_exists then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    v_action := (case when new.tur = 'geri_bildirim' then 'geri_bildirim_eklendi' else 'ilerleme_eklendi' end);
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (new.workspace_id, (select auth.uid()), v_action, new.id,
      jsonb_build_object('ozet', left(new.body, 120)));

  elsif tg_op = 'UPDATE' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (new.workspace_id, (select auth.uid()), 'not_guncellendi', new.id,
      jsonb_build_object('ozet', left(new.body, 120)));

  elsif tg_op = 'DELETE' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (old.workspace_id, (select auth.uid()), 'not_silindi', old.id,
      jsonb_build_object('ozet', left(old.body, 120)));
  end if;

  perform public.touch_workspace(coalesce(new.workspace_id, old.workspace_id));
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists progress_updates_log_trigger on public.progress_updates;
create trigger progress_updates_log_trigger
  after insert or update or delete on public.progress_updates
  for each row execute function public.progress_updates_log();

-- workspace_files triggers
create or replace function public.workspace_files_before_insert()
returns trigger as $$
begin
  new.uploaded_by := coalesce((select auth.uid()), new.uploaded_by);

  if new.storage_path is null then
    raise exception 'Dosya yolu zorunludur.' using errcode = '23514';
  end if;

  if left(new.storage_path, 37) <> new.workspace_id::text || '/' then
    raise exception 'Dosya yolu çalışma alanı klasörüyle başlamalı.' using errcode = '23514';
  end if;

  if new.plan_item_id is not null then
    if not exists (select 1 from public.plan_items where id = new.plan_item_id and workspace_id = new.workspace_id) then
      raise exception 'Plan maddesi bu çalışma alanına ait değil.' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists workspace_files_before_insert_trigger on public.workspace_files;
create trigger workspace_files_before_insert_trigger
  before insert on public.workspace_files
  for each row execute function public.workspace_files_before_insert();

create or replace function public.workspace_files_log()
returns trigger as $$
declare
  v_ws_exists boolean;
begin
  select exists(select 1 from public.student_workspaces where id = coalesce(new.workspace_id, old.workspace_id))
  into v_ws_exists;

  if not v_ws_exists then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (new.workspace_id, (select auth.uid()), 'dosya_yuklendi', new.id,
      jsonb_build_object('dosya', coalesce(new.file_name, new.storage_path)));

  elsif tg_op = 'DELETE' then
    insert into public.workspace_logs (workspace_id, actor_id, action, entity_id, details)
    values (old.workspace_id, (select auth.uid()), 'dosya_silindi', old.id,
      jsonb_build_object('dosya', coalesce(old.file_name, old.storage_path)));
  end if;

  perform public.touch_workspace(coalesce(new.workspace_id, old.workspace_id));
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists workspace_files_log_trigger on public.workspace_files;
create trigger workspace_files_log_trigger
  after insert or delete on public.workspace_files
  for each row execute function public.workspace_files_log();

-- ===== 8. RLS Policy'lerini sil ve yeniden oluştur =====
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname='public' and tablename in (
      'profiles','member_allowlist','pending_advisor_assignments','advisor_assignments',
      'student_workspaces','plan_items','progress_updates','workspace_files','workspace_logs',
      'uyelik_logs','announcements','resources','courses','course_materials','meetings'
    )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ===== 9. RLS Policy'lerini yeniden oluştur =====
alter table public.profiles enable row level security;
create policy "profil_kendi_veya_uye" on public.profiles for select
  to authenticated using (id = (select auth.uid()) or public.is_member());

create policy "profil_guncelle" on public.profiles for update
  to authenticated using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

alter table public.member_allowlist enable row level security;
create policy "davetler_goru" on public.member_allowlist for select
  to authenticated using (public.is_admin());

create policy "davetler_ekle" on public.member_allowlist for insert
  to authenticated with check (public.is_admin());

create policy "davetler_guncelle" on public.member_allowlist for update
  to authenticated using (public.is_admin())
  with check (public.is_admin());

create policy "davetler_sil" on public.member_allowlist for delete
  to authenticated using (public.is_admin());

alter table public.pending_advisor_assignments enable row level security;
create policy "beklenen_goru" on public.pending_advisor_assignments for select
  to authenticated using (public.is_admin());

create policy "beklenen_ekle" on public.pending_advisor_assignments for insert
  to authenticated with check (public.is_admin());

create policy "beklenen_sil" on public.pending_advisor_assignments for delete
  to authenticated using (public.is_admin());

alter table public.advisor_assignments enable row level security;
create policy "danisman_goru" on public.advisor_assignments for select
  to authenticated using (public.is_member());

create policy "danisman_ekle" on public.advisor_assignments for insert
  to authenticated with check (public.is_admin());

create policy "danisman_guncelle" on public.advisor_assignments for update
  to authenticated using (public.is_admin())
  with check (public.is_admin());

create policy "danisman_sil" on public.advisor_assignments for delete
  to authenticated using (public.is_admin());

alter table public.student_workspaces enable row level security;
create policy "alan_goru" on public.student_workspaces for select
  to authenticated using (public.can_view_workspace(id));

create policy "alan_guncelle" on public.student_workspaces for update
  to authenticated using (public.can_view_workspace(id))
  with check (public.can_view_workspace(id));

alter table public.plan_items enable row level security;
create policy "plan_goru" on public.plan_items for select
  to authenticated using (public.can_view_workspace(workspace_id));

create policy "plan_ekle" on public.plan_items for insert
  to authenticated with check (public.can_view_workspace(workspace_id));

create policy "plan_guncelle" on public.plan_items for update
  to authenticated using (public.can_view_workspace(workspace_id))
  with check (public.can_view_workspace(workspace_id));

create policy "plan_sil" on public.plan_items for delete
  to authenticated using (
    public.is_advisor_of(public.workspace_student(workspace_id))
    or (created_by = (select auth.uid()) and public.workspace_student(workspace_id) = (select auth.uid()))
  );

alter table public.progress_updates enable row level security;
create policy "ilerleme_goru" on public.progress_updates for select
  to authenticated using (public.can_view_workspace(workspace_id));

create policy "ilerleme_ekle" on public.progress_updates for insert
  to authenticated with check (public.can_view_workspace(workspace_id));

create policy "ilerleme_guncelle" on public.progress_updates for update
  to authenticated using (author_id = (select auth.uid()) and public.can_view_workspace(workspace_id))
  with check (author_id = (select auth.uid()) and public.can_view_workspace(workspace_id));

create policy "ilerleme_sil" on public.progress_updates for delete
  to authenticated using (author_id = (select auth.uid()) and public.can_view_workspace(workspace_id));

alter table public.workspace_files enable row level security;
create policy "dosya_goru" on public.workspace_files for select
  to authenticated using (public.can_view_workspace(workspace_id));

create policy "dosya_yukle" on public.workspace_files for insert
  to authenticated with check (public.can_view_workspace(workspace_id));

create policy "dosya_sil" on public.workspace_files for delete
  to authenticated using (
    public.can_view_workspace(workspace_id)
    and (uploaded_by = (select auth.uid()) or public.is_advisor_of(public.workspace_student(workspace_id)))
  );

alter table public.workspace_logs enable row level security;
create policy "log_goru" on public.workspace_logs for select
  to authenticated using (public.can_view_workspace(workspace_id));

alter table public.uyelik_logs enable row level security;
create policy "uyelik_log_goru" on public.uyelik_logs for select
  to authenticated using (public.is_admin());

alter table public.announcements enable row level security;
create policy "duyuru_goru" on public.announcements for select
  to authenticated using (public.is_member());

create policy "duyuru_ekle" on public.announcements for insert
  to authenticated with check (public.is_member() and author_id = (select auth.uid()));

create policy "duyuru_sil" on public.announcements for delete
  to authenticated using (author_id = (select auth.uid()) or public.is_hoca() or public.is_admin());

alter table public.resources enable row level security;
create policy "kaynak_goru" on public.resources for select
  to authenticated using (public.is_member());

create policy "kaynak_ekle" on public.resources for insert
  to authenticated with check (public.is_member() and uploader_id = (select auth.uid()));

create policy "kaynak_sil" on public.resources for delete
  to authenticated using (uploader_id = (select auth.uid()) or public.is_hoca() or public.is_admin());

alter table public.courses enable row level security;
alter table public.course_materials enable row level security;
create policy "ders_goru" on public.courses for select
  to authenticated using (public.is_member());

create policy "ders_ekle" on public.courses for insert
  to authenticated with check (public.is_hoca() or public.is_admin());

create policy "ders_materyali_goru" on public.course_materials for select
  to authenticated using (public.is_member());

create policy "ders_materyali_ekle" on public.course_materials for insert
  to authenticated with check (public.is_hoca() or public.is_admin());

alter table public.meetings enable row level security;
create policy "toplanti_goru" on public.meetings for select
  to authenticated using (public.is_member());

create policy "toplanti_ekle" on public.meetings for insert
  to authenticated with check (public.is_member() and creator_id = (select auth.uid()));

-- ===== 10. Storage bucket =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-files', 'workspace-files', false, 26214400, array[
  'application/pdf','image/png','image/jpeg','text/csv','text/plain','application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policy'lerini sil ve yeniden oluştur
drop policy if exists "workspace-files okuma" on storage.objects;
drop policy if exists "workspace-files yükleme" on storage.objects;
drop policy if exists "workspace-files silme" on storage.objects;

create policy "workspace-files okuma" on storage.objects for select
  to authenticated using (
    bucket_id = 'workspace-files' and public.can_view_workspace(public.try_uuid((storage.foldername(name))[1]))
  );

create policy "workspace-files yükleme" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'workspace-files' and public.can_view_workspace(public.try_uuid((storage.foldername(name))[1]))
  );

create policy "workspace-files silme" on storage.objects for delete
  to authenticated using (
    bucket_id = 'workspace-files' and public.can_view_workspace(public.try_uuid((storage.foldername(name))[1]))
    and ((select auth.uid())::text = owner_id or public.is_advisor_of(public.workspace_student(public.try_uuid((storage.foldername(name))[1]))))
  );

-- ===== 11. Eksik student_workspaces satırlarını aç =====
insert into public.student_workspaces (student_id)
select id from public.profiles
where is_approved and is_active and kadro in ('doktora','yuksek_lisans','lisans')
and id not in (select student_id from public.student_workspaces)
on conflict (student_id) do nothing;
