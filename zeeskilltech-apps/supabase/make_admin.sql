-- Make ONE account an admin (use for the very first admin). Replace the email, then Run in Supabase > SQL Editor.
-- Run update_2.sql first. After this, new admins can be made from the website: Admin Panel > Students.
update profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL@gmail.com');
-- It should say "Success. 1 row affected". If it says 0 rows, the email is wrong (check Authentication > Users).
