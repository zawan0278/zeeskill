-- ZeeSkillTech update 2. Run ONCE in Supabase > SQL Editor (safe to run again). It does not touch existing data.
-- 1) Creates a missing profile for any account that has none (this is why a new user's dashboard could fail to load).
-- 2) ensure_my_profile(): the dashboard calls it to repair a missing profile automatically.
-- 3) admin_list_users() / set_user_role(): used by Admin > Students to make or remove admins. Admin only.

insert into profiles(id,full_name,phone,referral_code,referred_by)
select u.id,u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'phone',
 upper(substr(md5(random()::text||u.id::text),1,8)),
 (select id from profiles where referral_code=upper(u.raw_user_meta_data->>'ref'))
from auth.users u where not exists(select 1 from profiles p where p.id=u.id);

create or replace function ensure_my_profile() returns void language plpgsql security definer set search_path=public as $$
declare u auth.users;
begin
 if auth.uid() is null then raise exception 'not logged in'; end if;
 if exists(select 1 from profiles where id=auth.uid()) then return; end if;
 select * into u from auth.users where id=auth.uid();
 insert into profiles(id,full_name,phone,referral_code,referred_by) values(u.id,u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'phone',
  upper(substr(md5(random()::text||u.id::text),1,8)),(select id from profiles where referral_code=upper(u.raw_user_meta_data->>'ref')));
end $$;

create or replace function admin_list_users() returns table(id uuid,full_name text,phone text,email text,plan text,role text,balance int,referral_code text,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'admin only'; end if;
 return query select p.id,p.full_name,p.phone,u.email::text,p.plan,p.role,p.balance,p.referral_code,p.created_at
  from profiles p join auth.users u on u.id=p.id order by p.created_at desc;
end $$;

create or replace function set_user_role(uid uuid, new_role text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'admin only'; end if;
 if new_role not in ('admin','student') then raise exception 'invalid role'; end if;
 if uid=auth.uid() then raise exception 'You cannot change your own role'; end if;
 update profiles set role=new_role where id=uid;
 if not found then raise exception 'user not found'; end if;
end $$;

revoke execute on function ensure_my_profile(), admin_list_users(), set_user_role(uuid,text) from public, anon;
grant execute on function ensure_my_profile(), admin_list_users(), set_user_role(uuid,text) to authenticated;
