-- شغّل هذا مرة واحدة في Supabase → SQL Editor → Run
-- الجدول thata موجود عندك؛ هذا يسمح للسجل بالقراءة/الكتابة ويمنع تكرار الرقم الوطني.

alter table public.thatea enable row level security;

drop policy if exists thata_office_readwrite on public.thatea;
create policy thata_office_readwrite
  on public.thatea
  for all
  to anon, authenticated
  using (true)
  with check (true);

create unique index if not exists thata_national_id_uidx
  on public.thatea ("الرقم_الوطني")
  where "الرقم_الوطني" is not null and "الرقم_الوطني" <> '';
