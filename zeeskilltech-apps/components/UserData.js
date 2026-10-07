'use client';
import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {sb} from '../lib/supabase';
import {C as C0} from '../lib/content';
import AppShell from './AppShell';
import Icon from './Icon';
import {Alert,Empty,Skeleton} from './ui';

// Loads the signed-in student's data ONCE and shares it with every page of the student area.
// Pages: const {d,cfg,reload,flash}=useUser();
const Ctx=createContext(null);
export const useUser=()=>useContext(Ctx);

const ITEMS=[['/','home','Home'],['/dashboard','dashboard','Dashboard'],['/dashboard/upgrade','up','Upgrade'],['/courses','book','My Courses'],
 ['/dashboard/earnings','coin','Earning Logs'],['/dashboard/withdrawals','send','Withdrawals'],['/dashboard/referrals','users','My Referrals'],
 ['/dashboard/community','link','Community Links'],['/dashboard/faqs','info',"FAQ's"]];

export function UserProvider({children}){
 const [d,setD]=useState(null),[err,setErr]=useState(''),[detail,setDetail]=useState(''),[msg,setMsg]=useState(null),[cfg,setCfg]=useState(C0);
 const flash=useCallback((t,m)=>{setMsg({t,m});scrollTo({top:0,behavior:'smooth'})},[]);
 const load=useCallback(async()=>{
  try{
   const {data:{user}}=await sb.auth.getUser();
   if(!user){location.href='/auth?mode=login';return}
   const [p,pl,c,py,w,ce,rf]=await Promise.all([
    sb.from('profiles').select('*').eq('id',user.id).single(),
    sb.from('plans').select('*').order('price'),
    sb.from('commissions').select('*').eq('earner_id',user.id).order('created_at',{ascending:false}),
    sb.from('payments').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('withdrawals').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('certificates').select('code,issued_at,courses(title)').eq('user_id',user.id),
    sb.rpc('my_referrals')]);
   let prof=p;
   if(prof.error||!prof.data){
    // New account without a profile row: create it (server function), then try once more.
    const fix=await sb.rpc('ensure_my_profile');
    if(!fix.error)prof=await sb.from('profiles').select('*').eq('id',user.id).single();
   }
   if(prof.error||!prof.data)throw prof.error||new Error('Profile not found');
   setD({user,p:prof.data,plans:pl.data||[],c:c.data||[],py:py.data||[],w:w.data||[],ce:ce.data||[],rf:rf.data||[],partial:[pl,c,py,w,ce,rf].some(r=>r.error)});
   setErr('');
  }catch(e){console.error(e);setErr('We could not load your account. Please check your internet connection and try again.');setDetail(e?.message||'')}
 },[]);
 useEffect(()=>{
  load();
  sb.from('site_content').select('value').eq('key','main').maybeSingle().then(({data})=>{if(data?.value)setCfg({...C0,...data.value})},()=>{});
 },[load]);

 const items=d?.p?.role=='admin'?[...ITEMS,['/admin','shield','Admin Panel']]:ITEMS;
 let body;
 if(err)body=<main><div className="card"><Empty icon="alert" title="Account unavailable" action={<button onClick={()=>{setErr('');load()}}>Try again</button>}>{err}</Empty>{detail&&<p className="mb-0 mt-3 break-words text-center text-xs text-slate-400">Details: {detail}</p>}</div></main>;
 else if(!d)body=<main aria-busy="true" aria-label="Loading"><Skeleton className="mb-5 h-32 w-full"/><div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3].map(i=><Skeleton key={i} className="h-28"/>)}</div></main>;
 else body=<Ctx.Provider value={{d,cfg,reload:load,flash}}><div className="mx-auto w-full max-w-6xl px-4 pt-6 empty:hidden">
   {msg&&<Alert tone={msg.t} onClose={()=>setMsg(null)}>{msg.m}</Alert>}
   {d.partial&&<Alert tone="warn" title="Some information could not be loaded">Parts of your account may be incomplete. Refresh the page to try again.</Alert>}</div>{children}</Ctx.Provider>;
 return <AppShell items={items}>{body}</AppShell>}
