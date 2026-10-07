'use client';
import {useEffect,useState} from 'react';import {sb} from '../../../lib/supabase';import {C} from '../../../lib/content';import ImageUpload from '../../../components/ImageUpload';
// Generic editor for EVERYTHING in lib/content.js (brand, hero, stats, plans, courses, FAQs, team, social, contact...).
// Saves to site_content; plans are also synced to the `plans` table (price + commission % used for real payouts).
const blank=v=>Array.isArray(v)?[]:typeof v=='number'?0:v&&typeof v=='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,blank(x)])):'';
const TA=['sub','bio','pay','desc','faqs','privacy','terms','eua','refund','disclaimer','commission'];
function Node({v,set,k}){
 if(Array.isArray(v))return <div style={{borderLeft:'3px solid var(--pri)',paddingLeft:'.6rem'}}>{v.map((x,i)=><div key={i} className="card" style={{position:'relative'}}>
   <a href="#" style={{position:'absolute',right:10,top:6,color:'crimson'}} onClick={e=>{e.preventDefault();set(v.filter((_,j)=>j!=i))}}>✕</a>
   <Node v={x} k={k} set={n=>set(v.map((y,j)=>j==i?n:y))}/></div>)}
  <button type="button" className="sec" onClick={()=>set([...v,v.length?blank(v[0]):''])}>+ Add</button></div>;
 if(v&&typeof v=='object')return <div>{Object.entries(v).map(([key,x])=><label key={key} style={{display:'block',fontSize:'.8rem',fontWeight:600}}>{key}<Node v={x} k={key} set={n=>set({...v,[key]:n})}/></label>)}</div>;
 const num=typeof v=='number';
 return <span style={{display:'flex',gap:'.4rem',alignItems:'center'}}>{TA.includes(k)?<textarea rows={TA.indexOf(k)>4?14:3} value={v} onChange={e=>set(e.target.value)} style={{width:'100%',padding:'.6rem',borderRadius:'.7rem',border:'1px solid #CBD5E1',font:'inherit'}}/>
  :<input type={num?'number':/^#[0-9a-f]{6}$/i.test(v)?'color':'text'} value={v} onChange={e=>set(num?+e.target.value:e.target.value)}/>}{k=='img'&&<ImageUpload onDone={set}/>}</span>}
export default function AdminContent(){
 const {legal,...base}=C;const [D,setD]=useState(base),[msg,setMsg]=useState('');
 useEffect(()=>{sb.from('site_content').select('value').eq('key','main').maybeSingle().then(({data})=>data?.value&&setD({...base,...data.value}))},[]);
 async function save(){setMsg('Saving...');
  const a=await sb.from('site_content').upsert({key:'main',value:D,updated_at:new Date().toISOString()});if(a.error)return setMsg(a.error.message);
  const b=await sb.from('plans').upsert(D.plans.map((p,i)=>({id:p.id,name:p.n,price:p.p,l1_pct:p.l1,l2_pct:p.l2,rank:i+1})));
  setMsg(b.error?'Content saved, plans sync failed: '+b.error.message:'✅ Saved. Website updates within about a minute.')}
 return <main><a href="/admin">← Admin</a><h1>Edit Website Content</h1><p>{msg}</p>
  <Node v={D} k="" set={setD}/><button onClick={save} style={{position:'sticky',bottom:10}}>💾 Save all</button></main>}
