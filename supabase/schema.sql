-- ==============================================================================
-- HYMF (Hesaplamalı Yoğun Madde Fiziği) Portalı - Supabase Veritabanı Şeması
-- Sıfırdan kurulum: 1. bu dosya 2. supabase/migrations/20261009000000_calisma_alani.sql 3. supabase/seed_uyeler.sql
-- Bu dosya tek başına bırakılmamalı. Rol Tabanlı Erişim Kontrolü (RBAC) ve Güvenlik İlkeleri (RLS)
-- ==============================================================================

-- 1. Kullanıcı Rolleri Enum'u
create type user_role as enum ('hoca', 'yonetici', 'arastirmaci');

-- 2. Duyuru Öncelik / Kategori Enum'u
create type announcement_priority as enum ('acil', 'toplanti', 'soru_yardim', 'kaynak_paylasimi');

-- 3. Kaynak Türü Enum'u
create type resource_category as enum ('kitap_makale', 'faydali_link', 'kod_script');

-- ------------------------------------------------------------------------------
-- PROFİLLER TABLOSU (auth.users tablosu ile 1-e-1 eşleşir)
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role user_role default 'arastirmaci'::user_role not null,
  academic_title text default 'Araştırmacı', -- Örn: 'Prof. Dr.', 'Doç. Dr.', 'Doktora Öğrencisi', 'Y. Lisans Öğrencisi'
  department text default 'Fizik Anabilim Dalı', -- 'Fizik' veya 'Fizik Mühendisliği'
  avatar_url text,
  research_topics text[] default '{}',
  scholar_url text,
  orcid text,
  is_approved boolean default false, -- Migration sonrası allowlist uygulanır
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Profiller
alter table public.profiles enable row level security;

-- Yetki yardımcısı. Policy'ler profiles tablosunu doğrudan sorgulamaz (recursion riski);
-- security definer fonksiyon RLS'e takılmadan okur.
create or replace function public.is_hoca_or_yonetici()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('hoca', 'yonetici') and is_approved
  );
$$;

-- Tüm oturum açmış kullanıcılar profilleri listeleyebilir (Üye Vitrini için)
create policy "Profilleri oturum açan herkes görebilir"
on public.profiles for select
to authenticated
using (true);

-- Kullanıcı sadece kendi profilini güncelleyebilir
create policy "Profil güncelleme"
on public.profiles for update
to authenticated
using (id = auth.uid()) with check (id = auth.uid());

-- Yeni üye olduğunda otomatik profil oluşturan Trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_full_name text;
  v_department text;
begin
  v_full_name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''), split_part(new.email,'@',1)), 120);
  v_department := left(nullif(new.raw_user_meta_data->>'department',''), 120);

  insert into public.profiles (id, email, full_name, role, department, is_approved)
  values (
    new.id,
    lower(new.email),
    v_full_name,
    'arastirmaci'::public.user_role,
    v_department,
    false
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Kullanıcı kendi rolünü, onayını veya e-postasını değiştiremez. (SQL Editor'de auth.uid() boştur.)
-- Migration bu fonksiyonu aynı adla kadro/yetki kurallarıyla değiştirir.
create or replace function public.profiles_guard()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and (
       new.role is distinct from old.role
       or new.is_approved is distinct from old.is_approved
       or new.email is distinct from old.email
       or new.id is distinct from old.id) then
    raise exception 'Bu alanları değiştiremezsiniz.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_trigger
  before update on public.profiles
  for each row execute procedure public.profiles_guard();

-- ------------------------------------------------------------------------------
-- DUYURULAR TABLOSU (Telegram Grubu Entegrasyonlu)
-- ------------------------------------------------------------------------------
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  priority announcement_priority default 'soru_yardim'::announcement_priority not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  telegram_sent boolean default false,
  telegram_message_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Duyuruları herkes görebilir"
on public.announcements for select
to authenticated
using (true);

create policy "Her üye duyuru yapabilir"
on public.announcements for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Duyuruyu yazan veya yöneticiler/hocalar silebilir"
on public.announcements for delete
to authenticated
using (
  auth.uid() = author_id or
  public.is_hoca_or_yonetici()
);

-- ------------------------------------------------------------------------------
-- ORTAK KAYNAKLAR (Kitap, Makale, Link, Kod & Script Havuzu)
-- ------------------------------------------------------------------------------
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category resource_category not null,
  file_url text, -- Supabase Storage PDF/dosya bağlantısı
  external_url text, -- Materials Project, AFLOW, GitHub vb. link
  code_snippet text, -- Python / Slurm / Bash script içeriği
  language text default 'bash', -- 'python', 'bash', 'fortran', vb.
  tags text[] default '{}',
  uploader_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resources enable row level security;

create policy "Kaynakları herkes görebilir"
on public.resources for select
to authenticated
using (true);

create policy "Tüm üyeler kaynak ekleyebilir"
on public.resources for insert
to authenticated
with check (auth.uid() = uploader_id);

create policy "Kaynak silme kuralı: Kendi yüklediğini veya hoca/yönetici herkesinkini silebilir"
on public.resources for delete
to authenticated
using (
  auth.uid() = uploader_id or
  public.is_hoca_or_yonetici()
);

-- ------------------------------------------------------------------------------
-- LİSANSÜSTÜ DERSLER & MATERYALLER
-- ------------------------------------------------------------------------------
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  code text not null, -- Örn: 'FIZ601'
  name text not null, -- Örn: 'İleri Yoğun Madde Fiziği'
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  semester text default '2026-2027 Güz',
  syllabus text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.course_materials (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  week_number integer not null, -- Örn: 1, 2, 3..
  title text not null, -- Örn: 'Hafta 3 - Bloch Teoremi ve Bant Yapıları'
  description text,
  file_url text not null,
  uploader_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;
alter table public.course_materials enable row level security;

create policy "Dersleri herkes görebilir" on public.courses for select to authenticated using (true);
create policy "Ders materyallerini herkes görebilir/indirebilir" on public.course_materials for select to authenticated using (true);

-- Ders ve materyal ekleme yetkisi: Sadece hocalar ve yönetici öğrenciler
create policy "Hoca ve yöneticiler ders ekleyebilir"
on public.courses for insert
to authenticated
with check (
  public.is_hoca_or_yonetici()
);

create policy "Hoca ve yöneticiler ders materyali ekleyebilir"
on public.course_materials for insert
to authenticated
with check (
  public.is_hoca_or_yonetici()
);

-- ------------------------------------------------------------------------------
-- TOPLANTILAR
-- ------------------------------------------------------------------------------
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  meeting_date timestamp with time zone not null,
  notes text,
  presentation_url text,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meetings enable row level security;
create policy "Toplantıları herkes görebilir" on public.meetings for select to authenticated using (true);
create policy "Tüm üyeler toplantı ekleyebilir" on public.meetings for insert to authenticated with check (auth.uid() = creator_id);

-- ------------------------------------------------------------------------------
-- KİŞİSEL ÇALIŞMA ALANI (GİZLİ SAYFA - KRİTİK RBAC ALANI)
-- Sadece öğrencinin kendisi, sorumlu hocalar ve 2 yönetici öğrenci görebilir!
-- ------------------------------------------------------------------------------
create table public.student_workspaces (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null unique,
  thesis_title text default 'Tez Çalışması Başlığı Belirlenmedi',
  advisor text,
  summary text,
  simulation_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Çalışma alanına yüklenen dosyalar (simülasyon çıktıları, taslaklar)
create table public.workspace_files (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.student_workspaces(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_size text,
  uploaded_by uuid references public.profiles(id) on delete cascade not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sürüm ve Denetim İzi (Audit Log): Kim ne zaman baktı veya dosya güncelledi
create table public.workspace_logs (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.student_workspaces(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  action text not null, -- Örn: 'Yeni taslak yüklendi', 'Hoca geri bildirim notu ekledi'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_workspaces enable row level security;
alter table public.workspace_files enable row level security;
alter table public.workspace_logs enable row level security;

-- GİZLİLİK POLİTİKASI (SELECT):
-- Yalnızca ilgili öğrenci VEYA rolü 'hoca' ya da 'yonetici' olanlar görebilir!
create policy "Workspace özel gizlilik kontrolü (Select)"
on public.student_workspaces for select
to authenticated
using (
  student_id = auth.uid() or
  public.is_hoca_or_yonetici()
);

create policy "Workspace düzenleme yetkisi (Update)"
on public.student_workspaces for update
to authenticated
using (
  student_id = auth.uid() or
  public.is_hoca_or_yonetici()
);

create policy "Workspace dosyalarını sadece yetkili ve öğrenci görebilir"
on public.workspace_files for select
to authenticated
using (
  exists (
    select 1 from public.student_workspaces w
    where w.id = workspace_files.workspace_id and (
      w.student_id = auth.uid() or
      public.is_hoca_or_yonetici()
    )
  )
);

create policy "Workspace dosyası ekleme yetkisi"
on public.workspace_files for insert
to authenticated
with check (
  exists (
    select 1 from public.student_workspaces w
    where w.id = workspace_files.workspace_id and (
      w.student_id = auth.uid() or
      public.is_hoca_or_yonetici()
    )
  )
);

create policy "Workspace loglarını sadece yetkili ve öğrenci görebilir"
on public.workspace_logs for select
to authenticated
using (
  exists (
    select 1 from public.student_workspaces w
    where w.id = workspace_logs.workspace_id and (
      w.student_id = auth.uid() or
      public.is_hoca_or_yonetici()
    )
  )
);
