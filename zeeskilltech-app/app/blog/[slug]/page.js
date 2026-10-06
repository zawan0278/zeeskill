import {notFound} from 'next/navigation';import {pub} from '../../../lib/server';
export const revalidate=60;
async function get(slug){const {data}=await pub.from('posts').select('*').eq('slug',slug).eq('published',true).maybeSingle();return data}
export async function generateMetadata({params}){const p=await get(params.slug);return p?{title:p.title,description:p.summary}:{}}
export default async function Post({params}){const p=await get(params.slug);if(!p)notFound();
 return <main style={{maxWidth:720}}><a href="/blog">← All posts</a><h1>{p.title}</h1><small>{p.created_at.slice(0,10)}</small>
  {p.image_url&&<img src={p.image_url} alt="" style={{width:'100%',borderRadius:'1rem',margin:'1rem 0'}}/>}
  {(p.body||'').split(/\n\s*\n/).map((t,i)=><p key={i} style={{whiteSpace:'pre-wrap'}}>{t}</p>)}</main>}
