-- Run AFTER schema.sql, lessons.sql, site.sql. Adds: editable site content, blog, images, certificates.
create table site_content(key text primary key,value jsonb not null,updated_at timestamptz default now());
alter table site_content enable row level security;
create policy r_sc on site_content for select using(true);
create policy w_sc on site_content for all using(is_admin()) with check(is_admin());
create policy w_plans on plans for all using(is_admin()) with check(is_admin());

create table posts(id bigserial primary key,slug text unique not null,title text not null,summary text,body text,image_url text,
 published boolean not null default false,created_at timestamptz default now());
alter table posts enable row level security;
create policy r_posts on posts for select using(published or is_admin());
create policy w_posts on posts for all using(is_admin()) with check(is_admin());

alter table courses add column image_url text;

-- Image uploads (public read, admin-only write)
insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy media_read on storage.objects for select using(bucket_id='media');
create policy media_write on storage.objects for insert with check(bucket_id='media' and is_admin());
create policy media_del on storage.objects for delete using(bucket_id='media' and is_admin());

-- Certificates: issued only when ALL lessons of a course are completed; publicly verifiable by code
create table certificates(id bigserial primary key,user_id uuid default auth.uid() references profiles(id),
 course_id bigint references courses on delete cascade,
 code text unique not null default upper(substr(md5(random()::text||clock_timestamp()::text),1,10)),
 issued_at timestamptz default now(),unique(user_id,course_id));
alter table certificates enable row level security;
create policy r_cert on certificates for select using(user_id=auth.uid() or is_admin());
create function claim_certificate(cid bigint) returns text language plpgsql security definer set search_path=public as $$
declare total int; done int; c text;
begin
 if not can_access(cid) then raise exception 'no access'; end if;
 select count(*) into total from lessons where course_id=cid;
 select count(*) into done from progress p join lessons l on l.id=p.lesson_id where p.user_id=auth.uid() and l.course_id=cid;
 if total=0 or done<total then raise exception 'Complete all lessons first'; end if;
 insert into certificates(user_id,course_id) values(auth.uid(),cid) on conflict(user_id,course_id) do nothing;
 select code into c from certificates where user_id=auth.uid() and course_id=cid; return c;
end $$;
create function verify_certificate(c text) returns table(student text,course text,issued timestamptz) language sql security definer stable set search_path=public as $$
 select pr.full_name,co.title,ce.issued_at from certificates ce join profiles pr on pr.id=ce.user_id join courses co on co.id=ce.course_id where ce.code=upper(c) $$;
grant execute on function verify_certificate(text) to anon,authenticated;

-- Newsletter subscribers (footer form)
create table subscribers(id bigserial primary key,email text unique not null,created_at timestamptz default now());
alter table subscribers enable row level security;
create policy s_ins on subscribers for insert to anon,authenticated with check(true);
create policy s_sel on subscribers for select using(is_admin());

-- Student's own referral team (Level 1 + Level 2), names only
create function my_referrals() returns table(name text,plan text,joined timestamptz,level int) language sql security definer stable set search_path=public as $$
 select full_name,plan,created_at,1 from profiles where referred_by=auth.uid()
 union all select p2.full_name,p2.plan,p2.created_at,2 from profiles p2 join profiles p1 on p2.referred_by=p1.id where p1.referred_by=auth.uid() $$;

-- Anti-fraud: amount always = plan price (client cannot change it); one transaction ID cannot be reused
create function set_pay_amount() returns trigger language plpgsql as $$ begin new.amount:=(select price from plans where id=new.plan_id); return new; end $$;
create trigger pay_amount before insert on payments for each row execute function set_pay_amount();
create unique index pay_txn_unique on payments(lower(txn_ref)) where status<>'rejected';
