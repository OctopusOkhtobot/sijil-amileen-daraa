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

drop index if exists thata_national_id_uidx;
create unique index if not exists thata_owner_nid_uidx
  on public.thatea ("الرقم_الوطني", "المُدخل")
  where "الرقم_الوطني" is not null and "الرقم_الوطني" <> '';

alter table public.thatea add column if not exists "المُدخل" text;

create table if not exists public.sijil_users (
  username text primary key,
  pass_hash text not null,
  salt text not null,
  role text not null,
  active boolean not null default true,
  updated_at timestamptz default now()
);

alter table public.sijil_users enable row level security;

drop policy if exists sijil_users_rw on public.sijil_users;
create policy sijil_users_rw
  on public.sijil_users
  for all
  to anon, authenticated
  using (true)
  with check (true);

