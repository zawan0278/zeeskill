import Link from 'next/link';
import {notFound} from 'next/navigation';
import {pkr} from '../../../lib/content';
import {getContent} from '../../../lib/server';
import Icon from '../../../components/Icon';
export const revalidate=60;
export async function generateMetadata({params}){const C=await getContent();const p=C.plans.find(x=>x.id==params.id);return p?{title:`${p.n} Plan`,description:`${p.n} plan: ${p.c} courses, ${p.d}. ${C.brand}`}:{}}

export default async function Plan({params}){
 const C=await getContent();const p=C.plans.find(x=>x.id==params.id);if(!p)notFound();
 return <main className="!max-w-4xl">
  <Link href="/#plans" className="mb-4 inline-flex items-center gap-1 text-sm"><Icon n="back" size={16}/>All plans</Link>
  <div className="grid gap-5 md:grid-cols-5">
   <div className="md:col-span-3">
    <h1 className="!mb-1">{p.n} Plan</h1>
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400"><span>{p.c} courses</span><span aria-hidden="true">·</span><span>{p.d}</span><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Icon n="star" size={14} className="text-amber-500"/>{p.r}</span></p>
    <div className="card"><h2 className="card-title">What you get</h2>
     <ul className="m-0 mt-3 list-none space-y-2.5 p-0">{p.feat.map(f=><li key={f} className="flex items-start gap-2.5"><Icon n="check" size={18} className="mt-0.5 flex-none text-emerald-500"/>{f}</li>)}</ul></div>
    <div className="card"><h2 className="card-title">Referral commission</h2>
     <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><div className="font-head text-2xl font-extrabold text-pri dark:text-emerald-300">{p.l1}%</div><div className="text-xs text-slate-500">Level 1 (direct referrals)</div></div>
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><div className="font-head text-2xl font-extrabold text-pri dark:text-emerald-300">{p.l2}%</div><div className="text-xs text-slate-500">Level 2 (their referrals)</div></div></div></div></div>
   <aside className="md:col-span-2"><div className="card sticky top-24">
    {p.old>p.p&&<s className="text-sm text-slate-400">{pkr(p.old)}</s>}
    <div className="price">{pkr(p.p)}</div><div className="mb-4 text-xs text-slate-500">One-time fee</div>
    <Link className="btn alt w-full" href="/auth">Enroll now</Link>
    <h2 className="card-title mt-6">How to pay</h2>
    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">Send the plan fee to our official account, then submit the transaction ID in your dashboard.</p>
    {(C.accounts||[]).map(a=><div key={a[1]} className="mb-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"><b className="text-slate-900 dark:text-white">{a[0]}</b><div>{a[1]}</div><div className="text-xs text-slate-500">{a[2]}</div></div>)}</div></aside></div></main>}
