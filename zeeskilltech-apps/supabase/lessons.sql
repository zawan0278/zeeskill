-- Run AFTER schema.sql. Courses, lessons (videos) and progress. Lessons are locked by plan at the database level.
alter table plans add column rank int;
update plans set rank=1 where id='basic'; update plans set rank=2 where id='standard'; update plans set rank=3 where id='pro';
create table courses(id bigserial primary key,title text not null,subtitle text,min_plan text references plans(id) default 'basic',
 published boolean not null default false,created_at timestamptz default now());
create table lessons(id bigserial primary key,course_id bigint references courses on delete cascade,title text not null,
 video_url text,notes text,position int default 0);
create table progress(user_id uuid default auth.uid() references profiles(id),lesson_id bigint references lessons on delete cascade,
 done_at timestamptz default now(),primary key(user_id,lesson_id));

-- Admin always; students only if published AND their plan rank >= course's min plan rank
create function can_access(cid bigint) returns boolean language sql security definer stable set search_path=public as $$
 select is_admin() or exists(select 1 from courses c join plans need on need.id=c.min_plan
  join profiles pr on pr.id=auth.uid() join plans mine on mine.id=pr.plan
  where c.id=cid and c.published and mine.rank>=need.rank) $$;

alter table courses enable row level security; alter table lessons enable row level security; alter table progress enable row level security;
create policy r_courses on courses for select using(published or is_admin());
create policy w_courses on courses for all using(is_admin()) with check(is_admin());
create policy r_lessons on lessons for select using(can_access(course_id));
create policy w_lessons on lessons for all using(is_admin()) with check(is_admin());
create policy p_progress on progress for all using(user_id=auth.uid())
 with check(user_id=auth.uid() and can_access((select course_id from lessons where id=lesson_id)));
