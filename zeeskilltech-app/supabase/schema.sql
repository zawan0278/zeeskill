-- Run this whole file in Supabase > SQL Editor. All money logic lives in the database, never in the browser.
create table plans(id text primary key,name text,price int,l1_pct int,l2_pct int);
insert into plans values('basic','Basic',2999,20,5),('standard','Standard',5999,30,8),('pro','Pro',9999,40,10);
create table profiles(id uuid primary key references auth.users on delete cascade,full_name text,phone text,
 referral_code text unique,referred_by uuid references profiles(id),plan text references plans(id),
 role text not null default 'student',balance int not null default 0,created_at timestamptz default now());
create table payments(id bigserial primary key,user_id uuid references profiles(id),plan_id text references plans(id),
 amount int,method text,txn_ref text,status text not null default 'pending',created_at timestamptz default now());
create table commissions(id bigserial primary key,earner_id uuid references profiles(id),from_user uuid references profiles(id),
 level int,amount int,created_at timestamptz default now());
create table withdrawals(id bigserial primary key,user_id uuid references profiles(id),amount int,method text,account text,
 status text not null default 'pending',created_at timestamptz default now());

create function is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;

-- Auto-create profile on signup; links the referrer from the "ref" code
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into profiles(id,full_name,phone,referral_code,referred_by) values(new.id,
  new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'phone',
  upper(substr(md5(random()::text||new.id::text),1,8)),
  (select id from profiles where referral_code=upper(new.raw_user_meta_data->>'ref')));
 return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- Admin approves a verified payment: activates plan + pays Level 1 / Level 2 commission (earner's plan %)
create function approve_payment(pid bigint, ok boolean) returns void language plpgsql security definer set search_path=public as $$
declare p payments; pl plans; u1 uuid; u2 uuid; pc int; a int;
begin
 if not is_admin() then raise exception 'admin only'; end if;
 select * into p from payments where id=pid and status='pending' for update;
 if not found then raise exception 'payment not pending'; end if;
 if not ok then update payments set status='rejected' where id=pid; return; end if;
 select * into pl from plans where id=p.plan_id;
 update payments set status='approved' where id=pid;
 update profiles set plan=p.plan_id where id=p.user_id;
 select referred_by into u1 from profiles where id=p.user_id;
 if u1 is not null then
  select l1_pct into pc from plans join profiles on profiles.plan=plans.id where profiles.id=u1;
  if coalesce(pc,0)>0 then a:=pl.price*pc/100;
   insert into commissions(earner_id,from_user,level,amount) values(u1,p.user_id,1,a);
   update profiles set balance=balance+a where id=u1; end if;
  select referred_by into u2 from profiles where id=u1;
  if u2 is not null then
   select l2_pct into pc from plans join profiles on profiles.plan=plans.id where profiles.id=u2;
   if coalesce(pc,0)>0 then a:=pl.price*pc/100;
    insert into commissions(earner_id,from_user,level,amount) values(u2,p.user_id,2,a);
    update profiles set balance=balance+a where id=u2; end if;
  end if;
 end if;
end $$;

create function request_withdrawal(amt int,m text,acc text) returns void language plpgsql security definer set search_path=public as $$
begin
 if amt<500 or amt>50000 then raise exception 'Withdrawal must be between PKR 500 and PKR 50,000'; end if;
 update profiles set balance=balance-amt where id=auth.uid() and balance>=amt;
 if not found then raise exception 'Insufficient balance'; end if;
 insert into withdrawals(user_id,amount,method,account) values(auth.uid(),amt,m,acc);
end $$;

create function process_withdrawal(wid bigint, ok boolean) returns void language plpgsql security definer set search_path=public as $$
declare w withdrawals;
begin
 if not is_admin() then raise exception 'admin only'; end if;
 select * into w from withdrawals where id=wid and status='pending' for update;
 if not found then raise exception 'not pending'; end if;
 if ok then update withdrawals set status='paid' where id=wid;
 else update withdrawals set status='rejected' where id=wid; update profiles set balance=balance+w.amount where id=w.user_id; end if;
end $$;

-- Row Level Security: users see only their own rows; no direct writes to money tables
alter table plans enable row level security; alter table profiles enable row level security;
alter table payments enable row level security; alter table commissions enable row level security; alter table withdrawals enable row level security;
create policy r_plans on plans for select using(true);
create policy r_prof on profiles for select using(id=auth.uid() or is_admin());
create policy r_pay on payments for select using(user_id=auth.uid() or is_admin());
create policy w_pay on payments for insert with check(user_id=auth.uid() and status='pending');
create policy r_com on commissions for select using(earner_id=auth.uid() or is_admin());
create policy r_wd on withdrawals for select using(user_id=auth.uid() or is_admin());
