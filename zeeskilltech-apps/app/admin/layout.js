'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {sb} from '../../lib/supabase';
import AppShell from '../../components/AppShell';
import {Empty,Skeleton} from '../../components/ui';

// Admin panel: same sidebar layout as the student area. The role check is only for a clean UI;
// the real protection is the database (is_admin() row-level security and functions).
const ITEMS=[['/admin','wallet','Payments & Withdrawals'],['/admin/users','users','Students'],['/admin/courses','book','Courses & Lessons'],['/admin/blog','receipt','Blog'],['/admin/content','shield','Website Content'],['/dashboard','dashboard','My Dashboard'],['/','home','Public Website']];
export default function AdminLayout({children}){
 const [state,setState]=useState('loading');
 const check=async()=>{
  setState('loading');
  try{
   const {data:{user}}=await sb.auth.getUser();
   if(!user){location.href='/auth?mode=login';return}
   const {data,error}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();
   setState(error?'error':data?.role=='admin'?'ok':'denied')
  }catch(e){console.error(e);setState('error')}};
 useEffect(()=>{check()},[]);
 let body;
 if(state=='loading')body=<main><Skeleton className="mb-4 h-10 w-1/2"/><Skeleton className="h-64 w-full"/></main>;
 else if(state=='error')body=<main><div className="card"><Empty icon="alert" title="Could not verify your access" action={<button onClick={check}>Try again</button>}>Please check your connection and try again.</Empty></div></main>;
 else if(state=='denied')body=<main><div className="card"><Empty icon="lock" title="Admins only" action={<Link className="btn" href="/dashboard">Back to dashboard</Link>}>You do not have permission to view this area.</Empty></div></main>;
 else body=<div className="[&_main]:max-w-6xl">{children}</div>;
 return <AppShell items={ITEMS}>{body}</AppShell>}
