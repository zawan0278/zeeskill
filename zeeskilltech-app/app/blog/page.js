import Link from 'next/link';import {pub} from '../../lib/server';
export const revalidate=60;export const metadata={title:'Blog'};
export default async function Blog(){const {data}=await pub.from('posts').select('slug,title,summary,image_url,created_at').eq('published',true).order('created_at',{ascending:false});
 return <main style={{maxWidth:1000}}><h1>Blog</h1>{!data?.length&&<p>No posts yet.</p>}
  <div className="cols">{(data||[]).map(p=><Link key={p.slug} href={`/blog/${p.slug}`} className="card" style={{textDecoration:'none',color:'inherit'}}>
   {p.image_url&&<img src={p.image_url} alt="" loading="lazy" style={{width:'100%',height:140,objectFit:'cover',borderRadius:'.8rem'}}/>}<b>{p.title}</b><div style={{fontSize:'.85rem'}}>{p.summary}</div></Link>)}</div></main>}
