# ZeeSkillTech – Next.js + Supabase

Landing site, student dashboard, courses + videos, certificates, blog, referral commissions, admin tools.

## 1. Supabase (database + login)
1. supabase.com > New project (save the database password).
2. SQL Editor > run these files IN ORDER (paste, Run): `supabase/schema.sql`, `lessons.sql`, `site.sql`, `extras.sql`.
3. Project Settings > API: copy **Project URL** and **anon public key**.
4. Authentication > URL Configuration: set **Site URL** to your website address (after deploy; use http://localhost:3000 while testing) and add `https://YOURDOMAIN/**` under Redirect URLs. Without this, confirmation/reset emails link to the wrong place.
5. (Optional while testing) Authentication > Providers > Email: turn off "Confirm email" to skip email verification.

## 2. Run locally
```
cp .env.example .env.local     # fill the values
npm install
npm run dev                    # http://localhost:3000
```
Register an account, then make yourself admin (SQL Editor):
`update profiles set role='admin' where id=(select id from auth.users where email='YOU@EMAIL.COM');`

## 3. Deploy on Vercel
1. Push the project to GitHub (private repo is fine).
2. vercel.com > Add New > Project > import the repo. Framework: Next.js (auto).
3. Before pressing Deploy, open **Environment Variables** and add: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. The build fails without the first two.
4. Deploy. Then copy your `*.vercel.app` URL into Supabase > Authentication > URL Configuration (Site URL + Redirect URLs).
5. Custom domain: Vercel project > Settings > Domains > add domain, set the DNS records it shows, then update `NEXT_PUBLIC_SITE_URL` and the Supabase URLs to the final domain and Redeploy.
6. Every `git push` redeploys automatically. Changing env vars needs a Redeploy.

## 4. Test before launch
Register 3 test users (A refers B, B refers C using `/auth?ref=CODE`). Submit a payment as each, approve in /admin, and check that commissions appear in A's and B's dashboards. Test a withdrawal, a course with a lesson, and a certificate.

## 5. Admin (/admin)
- **Website content & plans:** edit every text/price/FAQ/team/social link, upload hero and founder images. Saving syncs plan prices and commission % into the database. Live in about a minute.
- **Courses & lessons:** courses, images, lessons (YouTube unlisted / Vimeo / .mp4), minimum plan, publish.
- **Blog**, **Students** list, payment approvals and withdrawals.

## How money works
Student pays your official JazzCash/Easypaisa/bank account and submits the transaction ID. Check your account, then Approve in /admin: the plan activates and Level 1 + Level 2 commissions are credited (using the earner's plan %). Withdrawals are requested in the dashboard; you pay manually and press Mark paid. Amounts are fixed by the database and a transaction ID cannot be reused. Check that an approval is not a downgrade before approving.

## Before launch checklist
- Replace placeholder stats, rating, founder bio, phone, WhatsApp number (Admin > Website content).
- Policy pages (privacy, terms, end user agreement, refund, disclaimer, commission plan) come with ready drafts. Edit them in Admin > Website content > legalDocs (refund rules, city, dates) and have a lawyer review them. The Commission Plan page fills in your plan percentages automatically.
- Pay commissions only on real sales; get local legal advice (multi-level referral rules).
- Contact and newsletter forms are open to the public, so expect some spam; clean it in the Supabase Table Editor.

## Not included
Automatic payment gateway (manual verification instead), email notifications, quizzes.

## Videos
Add lessons in /admin/courses and paste ONE link per lesson: YouTube (set the video to Unlisted), Vimeo, Google Drive (share as 'Anyone with the link'), Bunny Stream embed URL, or a direct .mp4 link. The player detects the type automatically. Locked lessons never send the link to students without access.

## Design / Tailwind
The UI uses Tailwind CSS (config: `tailwind.config.js`, styles: `app/globals.css`). Brand colours are in Admin > Website content > theme (pri = main colour, acc = accent) and change the whole site. Dark mode toggle is in the navbar.

## Payment accounts and limits
Deposit accounts are in lib/content.js (`accounts`) and editable in Admin > Website content. Withdrawal limit: PKR 500 to 50,000 per request (enforced in the `request_withdrawal` database function).
