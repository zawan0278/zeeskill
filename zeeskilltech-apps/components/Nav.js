'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {sb} from '../lib/supabase';
import Icon from './Icon';

const LINK='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 hover:no-underline dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white max-md:py-3';
const ACTIVE='!text-pri dark:!text-white bg-pri/10';

// Sticky navbar: plans dropdown (hover + keyboard), dark-mode toggle, live login state, accessible mobile menu.
export default function Nav({brand,plans}){
 const path=usePathname();
 const [open,setOpen]=useState(false),[dark,setDark]=useState(false),[user,setUser]=useState(null),[ready,setReady]=useState(false);

 useEffect(()=>{setDark(document.documentElement.dataset.theme=='dark')},[]);
 useEffect(()=>{
  sb.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setReady(true)});
  const {data:{subscription}}=sb.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));
  return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{setOpen(false)},[path]);
 useEffect(()=>{const k=e=>{if(e.key=='Escape')setOpen(false)};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);

 function toggle(){const t=dark?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}setDark(!dark)}
 const on=h=>path==h?ACTIVE:'';
 const items=[['/','Home'],['/courses','Courses'],['/about','About'],['/blog','Blog'],['/contact','Contact']];

 return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
  <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
   <Link href="/" className="flex items-center gap-2 font-head text-lg font-extrabold text-slate-900 hover:no-underline dark:text-white">
    <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-pri text-sm text-white">{(brand||'Z')[0]}</span>{brand}</Link>

   {open&&<button type="button" aria-label="Close menu" tabIndex={-1} onClick={()=>setOpen(false)} className="fixed inset-0 top-16 z-30 m-0 !rounded-none !bg-slate-950/40 !p-0 md:hidden"/>}
   <div id="main-menu" className={`${open?'flex':'hidden'} absolute left-0 right-0 top-16 z-40 flex-col gap-1 border-b border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:static md:flex md:flex-1 md:flex-row md:items-center md:justify-end md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:md:bg-transparent`}>
    <Link className={`${LINK} ${on('/')}`} href="/">Home</Link>
    <div className="group relative max-md:hidden">
     <Link className={`${LINK} inline-flex items-center gap-1`} href="/#plans">Plans <Icon n="chevron" size={14}/></Link>
     <div className="invisible absolute left-0 top-full min-w-44 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      <div className="rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
       {plans.map(p=><Link key={p.id} href={`/plans/${p.id}`} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:no-underline dark:text-slate-300 dark:hover:bg-slate-800">{p.n} Plan</Link>)}</div></div></div>
    <Link className={`${LINK} md:hidden`} href="/#plans">Plans</Link>
    {items.slice(1).map(([h,t])=><Link key={h} className={`${LINK} ${path.startsWith(h)?ACTIVE:''}`} href={h}>{t}</Link>)}
    <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 md:ml-2 md:mt-0 md:flex-row md:items-center md:border-0 md:pt-0">
     {!ready?<span className="h-9 md:w-40" aria-hidden="true"/>
      :user?<Link className="btn alt btn-sm" href="/dashboard"><Icon n="dashboard" size={16}/>Dashboard</Link>
      :<><Link className={`${LINK} ${on('/auth')}`} href="/auth?mode=login">Login</Link><Link className="btn alt btn-sm" href="/auth">Register</Link></>}
    </div>
   </div>

   <div className="flex items-center gap-2">
    <button type="button" aria-label={dark?'Switch to light mode':'Switch to dark mode'} onClick={toggle} className="btn-icon"><Icon n={dark?'sun':'moon'} size={18}/></button>
    <button type="button" aria-label="Menu" aria-expanded={open} aria-controls="main-menu" onClick={()=>setOpen(!open)} className="btn-icon md:hidden"><Icon n={open?'x':'menu'} size={18}/></button>
   </div>
  </nav></header>}
