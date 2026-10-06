import {createClient} from '@supabase/supabase-js';import {C} from './content';
// Server-side public client + content loader (DB overrides lib/content.js defaults).
export const pub=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
export async function getContent(){try{const {data}=await pub.from('site_content').select('value').eq('key','main').maybeSingle();return data?.value?{...C,...data.value}:C}catch(e){return C}}
