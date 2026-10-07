'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {sb} from '../../../../lib/supabase';
import {Player} from '../../../../lib/video';
import Icon from '../../../../components/Icon';
import {Alert,Empty,Skeleton} from '../../../../components/ui';

// Lesson player: video, notes, mark-complete, next lesson, certificate. Locked lessons simply return no rows (database rule).
export default function Course(){
 const {id}=useParams();
 const [c,setC]=useState(null),[ls,setLs]=useState([]),[g,setG]=useState(new Set()),[cur,setCur]=useState(0);
 const [state,setState]=useState('loading'),[busy,setBusy]=useState(''),[msg,setMsg]=useState(null);

 const load=useCallback(async()=>{
  try{
   const {data:{user}}=await sb.auth.getUser();if(!user){location.href='/auth?mode=login';return}
   const [a,b,p]=await Promise.all([sb.from('courses').select('*').eq('id',id).maybeSingle(),
    sb.from('lessons').select('*').eq('course_id',id).order('position').order('id'),sb.from('progress').select('lesson_id')]);
   if(b.error)throw b.error;
   setC(a.data);setLs(b.data||[]);setG(new Set((p.data||[]).map(x=>x.lesson_id)));setState('ready');
  }catch(e){console.error(e);setState('error')}
 },[id]);
 useEffect(()=>{load()},[load]);

 async function toggle(l){
  if(busy)return;setBusy('t');setMsg(null);
  const done=g.has(l.id);
  const {error}=done?await sb.from('progress').delete().eq('lesson_id',l.id):await sb.from('progress').insert({lesson_id:l.id});
  setBusy('');
  if(error&&error.code!='23505'){console.error(error);return setMsg({t:'danger',m:'Could not save your progress. Please try again.'})}
  setG(prev=>{const n=new Set(prev);if(done)n.delete(l.id);else n.add(l.id);return n})}

 async function cert(){
  if(busy)return;setBusy('c');setMsg(null);
  const {data,error}=await sb.rpc('claim_certificate',{cid:+id});setBusy('');
  if(error)return setMsg({t:'danger',m:/^(Complete all lessons|no access)/.test(error.message)?error.message:'Could not issue your certificate. Please try again.'});
  location.href='/verify/'+data}

 if(state=='loading')return <main className="!max-w-6xl"><Skeleton className="mb-4 h-8 w-1/3"/><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Skeleton className="aspect-video w-full"/><Skeleton className="h-72"/></div></main>;
 if(state=='error')return <main><div className="card"><Empty icon="alert" title="Could not load this course" action={<button onClick={()=>{setState('loading');load()}}>Try again</button>}>Please check your connection and try again.</Empty></div></main>;
 if(!ls.length)return <main><Link href="/courses" className="mb-4 inline-flex items-center gap-1 text-sm"><Icon n="back" size={16}/>Courses</Link>
  <div className="card"><Empty icon="lock" title="No lessons available" action={<Link className="btn" href="/dashboard">Go to dashboard</Link>}>This course has no lessons yet, or your current plan does not include it.</Empty></div></main>;

 const l=ls[cur],done=ls.filter(x=>g.has(x.id)).length,pc=Math.round(done*100/ls.length),all=done==ls.length;
 return <main className="!max-w-6xl">
  <Link href="/courses" className="mb-3 inline-flex items-center gap-1 text-sm"><Icon n="back" size={16}/>Courses</Link>
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><h1 className="!mb-0 !text-2xl md:!text-3xl">{c?.title}</h1>
   <div className="w-full max-w-xs"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>{done}/{ls.length} lessons completed</span><span>{pc}%</span></div>
    <div role="progressbar" aria-valuenow={pc} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress" className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-pri transition-all" style={{width:`${pc}%`}}/></div></div></div>
  {msg&&<Alert tone={msg.t} onClose={()=>setMsg(null)}>{msg.m}</Alert>}
  <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
   <div className="min-w-0">
    <Player key={l.id} url={l.video_url} title={l.title}/>
    <div className="mt-5"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pri dark:text-emerald-300">Lesson {cur+1} of {ls.length}</p><h2 className="!mb-2">{l.title}</h2>
     {l.notes&&<p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">{l.notes}</p>}
     <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" disabled={!!busy} onClick={()=>toggle(l)} className={`!my-0 ${g.has(l.id)?'sec':''}`}><Icon n="check" size={16}/>{g.has(l.id)?'Completed (undo)':'Mark complete'}</button>
      {cur>0&&<button type="button" className="sec !my-0" onClick={()=>setCur(cur-1)}><Icon n="back" size={16}/>Previous</button>}
      {cur<ls.length-1&&<button type="button" className="sec !my-0" onClick={()=>setCur(cur+1)}>Next lesson<Icon n="next" size={16}/></button>}
      {all&&<button type="button" disabled={!!busy} className="btn alt !my-0" onClick={cert}><Icon n="award" size={16}/>{busy=='c'?'Please wait...':'Get certificate'}</button>}</div></div></div>
   <aside aria-label="Lessons" className="card !mb-0 h-fit lg:sticky lg:top-24"><h3 className="card-title">Lessons</h3>
    <ol className="m-0 mt-2 max-h-[28rem] list-none space-y-1 overflow-y-auto p-0">{ls.map((x,i)=><li key={x.id}>
     <button type="button" onClick={()=>setCur(i)} aria-current={i==cur?'true':undefined} className={`!my-0 w-full !justify-start gap-3 !rounded-xl !px-3 !py-2.5 text-left !shadow-none ${i==cur?'':'!bg-transparent !text-slate-700 hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-slate-800'}`}>
      <span className="flex-none">{g.has(x.id)?<Icon n="ok" size={18} className={i==cur?'':'text-emerald-500'}/>:<Icon n="play" size={18}/>}</span><span className="min-w-0 flex-1 truncate font-medium">{x.title}</span></button></li>)}</ol></aside></div></main>}
