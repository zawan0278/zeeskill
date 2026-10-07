export default function robots(){const u=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
 return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/dashboard','/auth','/reset']},sitemap:u+'/sitemap.xml'}}
