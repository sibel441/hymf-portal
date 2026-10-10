-- ==============================================================================
-- İçerik sayfaları: duyuru, kaynak, ders, ders materyali, toplantı
-- ==============================================================================
-- 20261009000000_calisma_alani.sql'den sonra çalıştırın; tekrar çalıştırmak güvenlidir.
-- O migration bu tabloların policy'lerini silip yeniden kurduğu için, onu yeniden çalıştırırsanız
-- bu dosyayı da ardından yeniden çalıştırın.
--
-- 1. Eksik silme kuralları (toplantı, ders, ders materyali).
-- 2. Ders materyali ekleyen kişi kendisi olarak kaydedilir.
-- 3. Bağlantı alanları yalnız http(s) kabul eder: "javascript:" gibi adresler href'e girince
--    tıklayan üyenin oturumunda kod çalıştırabilirdi. NOT VALID: eski satırlar denetlenmez.

drop policy if exists "toplanti_sil" on public.meetings;
create policy "toplanti_sil" on public.meetings for delete
  to authenticated using (creator_id = (select auth.uid()) or public.is_hoca() or public.is_admin());

drop policy if exists "ders_sil" on public.courses;
create policy "ders_sil" on public.courses for delete
  to authenticated using (public.is_hoca() or public.is_admin());

drop policy if exists "ders_materyali_ekle" on public.course_materials;
create policy "ders_materyali_ekle" on public.course_materials for insert
  to authenticated with check ((public.is_hoca() or public.is_admin()) and uploader_id = (select auth.uid()));

drop policy if exists "ders_materyali_sil" on public.course_materials;
create policy "ders_materyali_sil" on public.course_materials for delete
  to authenticated using (uploader_id = (select auth.uid()) or public.is_hoca() or public.is_admin());

alter table public.resources drop constraint if exists resources_file_url_http;
alter table public.resources add constraint resources_file_url_http
  check (file_url is null or file_url ~* '^https?://') not valid;

alter table public.resources drop constraint if exists resources_external_url_http;
alter table public.resources add constraint resources_external_url_http
  check (external_url is null or external_url ~* '^https?://') not valid;

alter table public.course_materials drop constraint if exists course_materials_file_url_http;
alter table public.course_materials add constraint course_materials_file_url_http
  check (file_url ~* '^https?://') not valid;

alter table public.meetings drop constraint if exists meetings_presentation_url_http;
alter table public.meetings add constraint meetings_presentation_url_http
  check (presentation_url is null or presentation_url ~* '^https?://') not valid;

select 'İçerik migration tamam' as sonuc;
