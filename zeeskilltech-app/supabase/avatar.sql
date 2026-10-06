-- Run AFTER schema.sql, lessons.sql, site.sql and extras.sql. Adds student profile photos (dashboard avatar).
-- Students may upload ONLY into their own folder (avatars/<their user id>/...). The profile row itself can only be
-- changed through set_my_avatar(), so students still cannot edit role, plan or balance.
alter table profiles add column if not exists avatar_url text;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp']) on conflict do nothing;

create policy avatars_read on storage.objects for select using(bucket_id='avatars');
create policy avatars_insert on storage.objects for insert to authenticated
 with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated
 using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create function set_my_avatar(url text) returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'not logged in'; end if;
 if url is not null and url !~ ('^https://[^/]+/storage/v1/object/public/avatars/'||auth.uid()::text||'/') then
  raise exception 'invalid avatar url'; end if;
 update profiles set avatar_url=url where id=auth.uid();
end $$;
revoke execute on function set_my_avatar(text) from public, anon;
grant execute on function set_my_avatar(text) to authenticated;
