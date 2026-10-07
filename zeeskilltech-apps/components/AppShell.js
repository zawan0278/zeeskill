'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {sb} from '../lib/supabase';
import Icon from './Icon';

// Logged-in layout: green sidebar on desktop, slide-in drawer (hamburger) on mobile. Used by the student area and the admin panel.
const ROOTS=['/dashboard','/admin'];
export default function AppShell({items,brand='ZeeSkillTech',children}){
 const path=usePathname()||'',[open,setOpen]=useState(false),[dark,setDark]=useState(false);
 useEffect(()=>{setDark(document.documentElement.dataset.theme=='dark')},[]);
 useEffect(()=>{setOpen(false)},[path]);
 useEffect(()=>{const k=e=>{if(e.key=='Escape')setOpen(false)};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
 useEffect(()=>{document.body.style.overflow=open?'hidden':'';return()=>{document.body.style.overflow=''}},[open]);
 const active=h=>path==h||(!ROOTS.includes(h)&&h!='/'&&path.startsWith(h+'/'));
 function toggle(){const t=dark?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}setDark(!dark)}
 async function logout(){await sb.auth.signOut();location.href='/'}

 const Logo=({light})=><Link href="/" className={`flex items-center gap-2 font-head text-lg font-extrabold hover:no-underline ${light?'!text-white':'!text-slate-900 dark:!text-white'}`}>
  <span aria-hidden="true" className={`grid h-9 w-9 place-items-center rounded-xl text-base ${light?'bg-white/20 text-white':'bg-pri text-white'}`}>{brand[0]}</span>{brand}</Link>;
 const List=<nav aria-label="Menu" className="flex flex-col gap-1 p-3">
  {items.map(([h,i,t])=><Link key={h+t} href={h} aria-current={active(h)?'page':undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium hover:no-underline ${active(h)?'bg-white !text-pri shadow-sm':'!text-white hover:bg-white/15'}`}><Icon n={i} size={20}/>{t}</Link>)}
  <button type="button" onClick={logout} className="!my-0 mt-1 w-full !justify-start gap-3 !rounded-xl !bg-transparent !px-4 !py-3 text-[15px] !font-medium !text-white !shadow-none hover:!bg-white/15"><Icon n="logout" size={20}/>Logout</button></nav>;

 return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
  <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col overflow-y-auto bg-pri lg:flex"><div className="p-5"><Logo light/></div>{List}</aside>

  {open&&<div className="fixed inset-0 z-50 lg:hidden">
   <button type="button" aria-label="Close menu" tabIndex={-1} onClick={()=>setOpen(false)} className="absolute inset-0 !m-0 !h-full !w-full !rounded-none !bg-slate-950/50 !p-0 !shadow-none"/>
   <div className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col overflow-y-auto bg-pri shadow-2xl">
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-slate-900"><Logo/><button type="button" onClick={()=>setOpen(false)} aria-label="Close menu" className="btn-icon"><Icon n="x" size={18}/></button></div>{List}</div></div>}

  <div className="min-w-0 flex-1">
   <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
    <button type="button" onClick={()=>setOpen(true)} aria-label="Open menu" aria-expanded={open} className="btn-icon lg:!hidden"><Icon n="menu" size={20}/></button>
    <div className="lg:hidden"><Logo/></div><div className="hidden lg:block"/>
    <div className="flex items-center gap-2"><Link href="/" className="btn-icon hover:no-underline" aria-label="Public website"><Icon n="home" size={18}/></Link>
     <button type="button" aria-label={dark?'Switch to light mode':'Switch to dark mode'} onClick={toggle} className="btn-icon"><Icon n={dark?'sun':'moon'} size={18}/></button></div></header>
   {children}</div></div>}
