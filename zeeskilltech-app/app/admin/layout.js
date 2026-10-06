'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {sb} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {Empty,Skeleton} from '../../components/ui';

// Admin shell: sidebar on desktop, scrollable tabs on mobile. The role check here is only for a clean UI;
// the real protection is the database (is_admin() row-level security and functions).
const L=[['/admin','wallet','Payments & Withdrawals'],['/admin/users','users','Students'],['/admin/courses','book','Courses & Lessons'],['/admin/blog','receipt','Blog'],['/admin/content','shield','Website Content']];
export default function AdminLayout({children}){
 const path=usePathname(),[state,setState]=useState('loading');
 useEffect(()=>{(async()=>{
  const {data:{user}}=await sb.auth.getUser();if(!user){location.href='/auth?mode=login';return}
  const {data}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();
  setState(data?.role=='admin'?'ok':'denied')})().catch(()=>setState('denied'))},[]);
 if(state=='loading')return <div className="mx-auto max-w-7xl px-4 py-6"><Skeleton className="mb-4 h-12 w-full"/><Skeleton className="h-64 w-full"/></div>;
 if(state=='denied')return <main className="!max-w-lg"><div className="card"><Empty icon="lock" title="Admins only" action={<Link className="btn" href="/dashboard">Back to dashboard</Link>}>You do not have permission to view this area.</Empty></div></main>;
 return <div className="mx-auto max-w-7xl gap-6 px-4 py-6 lg:flex [&_main]:max-w-none [&_main]:p-0">
  <aside className="mb-6 lg:mb-0 lg:w-64 lg:flex-none"><div className="sticky top-20 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
   <div className="hidden px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:block">Admin panel</div>
   <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">{L.map(([h,i,t])=><Link key={h} href={h} aria-current={path==h?'page':undefined} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium hover:no-underline ${path==h?'bg-pri !text-white':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon n={i} size={16}/>{t}</Link>)}
    <Link href="/dashboard" className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:no-underline dark:text-slate-400 dark:hover:bg-slate-800 lg:mt-2 lg:border-t lg:border-slate-100 lg:dark:border-slate-800"><Icon n="back" size={16}/>My dashboard</Link></nav></div></aside>
  <div className="min-w-0 flex-1">{children}</div></div>}
