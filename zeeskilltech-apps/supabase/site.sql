-- Run once: contact form messages.
create table messages(id bigserial primary key,name text,email text,message text,created_at timestamptz default now());
alter table messages enable row level security;
create policy m_ins on messages for insert to anon,authenticated with check(true);
create policy m_sel on messages for select using(is_admin());
