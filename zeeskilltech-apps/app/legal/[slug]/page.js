import {notFound} from 'next/navigation';import {getContent} from '../../../lib/server';import {fill} from '../../../lib/legal';
export const revalidate=60;
// Renders policy text: "## " = heading, lines starting "- " = bullet list, blank line = new paragraph.
export default async function Legal({params}){const C=await getContent();const t=C.legal.find(x=>x[0]==params.slug);if(!t)notFound();
 const blocks=fill(C.legalDocs?.[params.slug]||'',C).split(/\n\s*\n/);
 return <main style={{maxWidth:760}}><h1>{t[1]}</h1>{blocks.map((b,i)=>b.startsWith('## ')?<h3 key={i}>{b.slice(3)}</h3>
  :b.split('\n').every(l=>l.startsWith('- '))?<ul key={i}>{b.split('\n').map((l,j)=><li key={j}>{l.slice(2)}</li>)}</ul>
  :<p key={i} style={{whiteSpace:'pre-wrap'}}>{b}</p>)}</main>}
