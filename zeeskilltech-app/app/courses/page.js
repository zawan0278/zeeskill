'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {sb} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {Alert,Badge,Empty,Skeleton} from '../../components/ui';

// Course catalogue: locked/unlocked by plan, with progress per course. Locked lessons never reach the browser (database rule).
export default function Courses(){
 const [d,setD]=useState(null),[err,setErr]=useState('');
 const load=useCallback(async()=>{
  try{
   const {data:{user}}=await sb.auth.getUser();if(!user){location.href='/auth?mode=login';return}
   const [p,pl,c,l,g]=await Promise.all([sb.from('profiles').select('*').eq('id',user.id).single(),sb.from('plans').select('*'),
    sb.from('courses').select('*').order('id'),sb.from('lessons').select('id,course_id'),sb.from('progress').select('lesson_id')]);
   if(p.error||c.error)throw p.error||c.error;
   setD({p:p.data,pl:pl.data||[],c:c.data||[],l:l.data||[],g:new Set((g.data||[]).map(x=>x.lesson_id))});setErr('');
  }catch(e){console.error(e);setErr('We could not load the courses. Please check your connection and try again.')}
 },[]);
 useEffect(()=>{load()},[load]);

 const header=<div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="!mb-1">My Courses</h1><p className="mb-0 text-slate-500 dark:text-slate-400">Continue where you left off.</p></div><Link className="btn out btn-sm" href="/dashboard"><Icon n="back" size={16}/>Dashboard</Link></div>;
 if(err)return <main className="!max-w-6xl">{header}<div className="card"><Empty icon="alert" title="Courses unavailable" action={<button onClick={()=>{setErr('');load()}}>Try again</button>}>{err}</Empty></div></main>;
 if(!d)return <main className="!max-w-6xl">{header}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i=><Skeleton key={i} className="h-64"/>)}</div></main>;

 const planOf=id=>d.pl.find(x=>x.id==id),rank=id=>planOf(id)?.rank||0,mine=d.p.role=='admin'?99:rank(d.p.plan);
 return <main className="!max-w-6xl">{header}
  {!d.p.plan&&d.p.role!='admin'&&<Alert tone="warn" title="Unlock your courses">Buy a plan from your dashboard to start learning. <Link href="/dashboard">Go to dashboard</Link></Alert>}
  {d.c.length==0&&<div className="card"><Empty icon="book" title="No courses published yet">New courses are added regularly. Please check back soon.</Empty></div>}
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{d.c.map(c=>{
   const ls=d.l.filter(x=>x.course_id==c.id),done=ls.filter(x=>d.g.has(x.id)).length,locked=mine<rank(c.min_plan),pc=ls.length?Math.round(done*100/ls.length):0,need=planOf(c.min_plan)?.name||c.min_plan;
   return <Link key={c.id} href={locked?'/dashboard':`/courses/${c.id}`} aria-label={locked?`${c.title} (locked, needs the ${need} plan)`:c.title} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-lg hover:no-underline dark:bg-slate-900 dark:ring-slate-800">
    <div className="relative">
     {c.image_url?<img src={c.image_url} alt="" loading="lazy" width={640} height={320} className={`h-40 w-full object-cover ${locked?'opacity-60 grayscale':''}`}/>
      :<div className="grid h-40 place-items-center bg-gradient-to-br from-indigo-500 to-indigo-800 text-white"><Icon n="book" size={44}/></div>}
     {locked&&<span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-900/80 text-white"><Icon n="lock" size={16}/></span>}</div>
    <div className="flex flex-1 flex-col p-5">
     <h3 className="!mb-1 !mt-0 text-slate-900 dark:text-white">{c.title}</h3>
     <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{c.subtitle}</p>
     <div className="mt-auto">{locked?<Badge>Needs {need} plan</Badge>
      :<><div className="mb-1 flex justify-between text-xs text-slate-500"><span>{done}/{ls.length} lessons</span><span>{pc}%</span></div>
       <div role="progressbar" aria-valuenow={pc} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`} className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-pri" style={{width:`${pc}%`}}/></div></>}</div></div></Link>})}</div></main>}
