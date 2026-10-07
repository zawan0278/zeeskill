'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {sb} from '../../../lib/supabase';
import {pkr} from '../../../lib/content';
import {buckets,fmtDate,summarize} from '../../../lib/dashboard';
import Icon from '../../../components/Icon';
import {useUser} from '../../../components/UserData';
import {Alert,Avatar,Empty,Stat} from '../../../components/ui';

const RANGES=['All','1W','1M','6M','1Y'];
const niceTop=max=>{if(max<=0)return 1000;const p=10**Math.floor(Math.log10(max));return Math.ceil(max/p)*p};

function SalesChart({list}){
 const [range,setRange]=useState('1W');
 const data=useMemo(()=>buckets(list,range),[list,range]);
 const top=niceTop(Math.max(...data.map(x=>x.amount),0)),ticks=[1,.75,.5,.25,0].map(k=>Math.round(top*k));
 const total=data.reduce((s,x)=>s+x.amount,0),sparse=data.length>12;
 return <section className="card" aria-labelledby="sales-h">
  <h2 id="sales-h" className="!mb-3 text-lg">Sales Overview</h2>
  <div className="mb-5 inline-flex overflow-hidden rounded-lg border border-pri" role="group" aria-label="Chart range">
   {RANGES.map(r=><button key={r} type="button" aria-pressed={range==r} onClick={()=>setRange(r)} className={`!my-0 !rounded-none !px-3.5 !py-1.5 !text-sm !shadow-none ${range==r?'':'!bg-white !text-pri dark:!bg-slate-900 dark:!text-emerald-300'}`}>{r}</button>)}</div>
  <div role="img" aria-label={`Earnings for ${range}: ${pkr(total)} in total`} className="flex gap-2">
   <div className="flex h-52 flex-none flex-col justify-between text-right text-[11px] font-medium text-slate-500 dark:text-slate-400" aria-hidden="true">{ticks.map(t=><span key={t}>{pkr(t).replace('PKR ','Rs. ')}</span>)}</div>
   <div className="min-w-0 flex-1" aria-hidden="true">
    <div className="relative h-52 border-b border-l border-slate-300 dark:border-slate-700">
     {[25,50,75,100].map(k=><div key={k} className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800" style={{bottom:`${k}%`}}/>)}
     <div className="absolute inset-0 flex items-end gap-[3px] px-1">
      {data.map((x,i)=><div key={i} title={`${x.label}: ${pkr(x.amount)}`} className="flex h-full min-w-0 flex-1 items-end"><div className="w-full rounded-t bg-pri" style={{height:`${x.amount?Math.max(2,x.amount/top*100):0}%`}}/></div>)}</div></div>
    <div className="mt-1 flex gap-[3px] px-1 text-[10px] text-slate-500 dark:text-slate-400">{data.map((x,i)=><span key={i} className="min-w-0 flex-1 truncate text-center">{sparse&&i%5!=0?'':x.label}</span>)}</div></div></div>
  {total==0&&<p className="mb-0 mt-4 text-center text-sm text-slate-500 dark:text-slate-400">No earnings in this period yet.</p>}</section>}

export default function Overview(){
 const {d,flash,reload}=useUser(),[busy,setBusy]=useState(false);
 const {p}=d,earn=useMemo(()=>summarize(d.c),[d.c]);
 const mine=d.plans.find(x=>x.id==p.plan),planName=mine?.name||(p.plan?p.plan[0].toUpperCase()+p.plan.slice(1):null);
 const pending=d.py.filter(x=>x.status=='pending').length,link=`${location.origin}/auth?ref=${p.referral_code}`;

 async function copy(){try{await navigator.clipboard.writeText(link);flash('success','Referral link copied.')}catch{flash('danger','Could not copy automatically. Please copy it manually.')}}
 async function pickAvatar(e){
  const f=e.target.files?.[0];e.target.value='';if(!f||busy)return;
  if(!/^image\/(png|jpeg|webp)$/.test(f.type))return flash('warn','Please choose a JPG, PNG or WebP image.');
  if(f.size>2*1024*1024)return flash('warn','The image must be smaller than 2 MB.');
  setBusy(true);
  const path=`${p.id}/avatar-${Date.now()}.${f.type=='image/png'?'png':f.type=='image/webp'?'webp':'jpg'}`;
  const up=await sb.storage.from('avatars').upload(path,f,{contentType:f.type,cacheControl:'3600'});
  if(up.error){console.error(up.error);setBusy(false);return flash('danger','Profile photo upload is not available right now. Please try again later.')}
  const {error}=await sb.rpc('set_my_avatar',{url:sb.storage.from('avatars').getPublicUrl(path).data.publicUrl});
  setBusy(false);
  if(error){console.error(error);return flash('danger','Could not save your photo. Please try again.')}
  flash('success','Profile photo updated.');reload()}

 return <main className="!max-w-6xl">
  <section aria-label="Profile" className="mb-6 flex items-center gap-4 rounded-2xl border border-pri/60 bg-gradient-to-br from-white to-emerald-50/60 p-4 dark:from-slate-900 dark:to-slate-900 sm:gap-6 sm:p-6">
   <div className="relative flex-none"><Avatar src={p.avatar_url} name={p.full_name||d.user.email} size={84}/>
    <label className={`absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-pri text-white shadow-md focus-within:ring-2 focus-within:ring-pri focus-within:ring-offset-2 ${busy?'pointer-events-none opacity-60':''}`}>
     <Icon n="camera" size={16}/><span className="sr-only">Change profile photo</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickAvatar} disabled={busy} className="sr-only"/></label></div>
   <div className="min-w-0">
    <h1 className="!mb-1.5 truncate !text-2xl sm:!text-3xl">{p.full_name||'Student'}</h1>
    <div className="flex flex-wrap items-center gap-2">
     {planName?<span className="badge bg-pri text-white"><Icon n="star" size={12}/>{planName} plan</span>:<span className="badge badge-muted">No active plan</span>}
     {p.role=='admin'&&<span className="badge badge-info"><Icon n="shield" size={12}/>Admin</span>}</div>
    <div className="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400">{d.user.email}</div></div></section>

  {!p.plan&&p.role!='admin'&&<Alert tone="warn" title="No active plan yet">{pending?'Your payment is being verified. Your plan will activate once it is approved.':'Buy a plan to unlock courses and start earning commission.'}
   {!pending&&<div className="mt-2"><Link className="btn alt btn-sm" href="/dashboard/upgrade">Buy a plan</Link></div>}</Alert>}

  <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Earnings">
   <Stat icon="coin" label="Today's Earnings" value={pkr(earn.today)}/>
   <Stat icon="calendar" label="Last 7 Days" value={pkr(earn.d7)}/>
   <Stat icon="wallet" label="Last 30 Days" value={pkr(earn.d30)}/>
   <Stat icon="trend" label="Total Earnings" value={pkr(earn.total)}/></div>

  <div className="card flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm text-slate-500 dark:text-slate-400">Available balance (earnings minus withdrawals)</div><div className="font-head text-3xl font-extrabold text-pri dark:text-emerald-300">{pkr(p.balance)}</div></div>
   <Link className="btn" href="/dashboard/withdrawals"><Icon n="send" size={16}/>Withdraw</Link></div>

  <SalesChart list={d.c}/>

  <section className="mb-4 rounded-2xl border-2 border-dashed border-pri/70 bg-white p-5 dark:bg-slate-900" aria-labelledby="ref-h">
   <h2 id="ref-h" className="!mb-1 text-lg">Your Referral Link</h2><p className="text-sm text-slate-600 dark:text-slate-400">You can earn easily by copying and sharing the link below with your friends.</p>
   <label htmlFor="ref-link" className="sr-only">Referral link</label><input id="ref-link" readOnly value={link} onFocus={e=>e.target.select()} className="!bg-emerald-50/50 dark:!bg-slate-800"/>
   <div className="mt-2 flex flex-wrap items-center gap-3"><button type="button" onClick={copy} className="btn"><Icon n="copy" size={16}/>Copy link</button><span className="text-xs text-slate-500">Your code: <b className="text-slate-900 dark:text-white">{p.referral_code}</b></span></div></section>

  <section className="card" aria-labelledby="cert-h"><h2 id="cert-h" className="card-title flex items-center gap-2 !text-lg"><Icon n="award" size={18}/>My certificates</h2>
   {d.ce.length==0?<Empty icon="award" title="No certificates yet">Finish all lessons of a course to earn a certificate.</Empty>
    :<ul className="m-0 list-none p-0">{d.ce.map(x=><li key={x.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800"><Link href={`/verify/${x.code}`} className="font-medium">{x.courses?.title||'Course'}</Link><span className="text-xs text-slate-500">{fmtDate(x.issued_at)}</span></li>)}</ul>}</section>
 </main>}
