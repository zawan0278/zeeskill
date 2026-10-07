import {createClient} from '@supabase/supabase-js';
// If the env vars are missing the app must still render (instead of crashing every page at import time).
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured=!!(url&&key);
if(!configured&&typeof window!=='undefined')console.error('ZeeSkillTech: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. Add them to .env.local (or Vercel > Settings > Environment Variables) and restart/redeploy.');
export const sb=createClient(url||'http://localhost:54321',key||'missing-key');
