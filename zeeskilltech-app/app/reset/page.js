'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {sb} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {Alert,Field,Skeleton} from '../../components/ui';
// Opened from the "reset password" email link (Supabase signs the user in temporarily).
export default function Reset(){
 const [ok,setOk]=useState(null),[p,setP]=useState(''),[p2,setP2]=useState(''),[m,setM]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{sb.auth.getSession().then(({data})=>setOk(!!data.session)).catch(()=>setOk(false))},[]);
 async function go(e){
  e.preventDefault();if(busy)return;
  if(p.length<8)return setM({t:'warn',m:'Your password must be at least 8 characters.'});
  if(p!==p2)return setM({t:'warn',m:'The two passwords do not match.'});
  setBusy(true);const {error}=await sb.auth.updateUser({password:p});setBusy(false);
  if(error)return setM({t:'danger',m:error.message});
  setM({t:'success',m:'Password updated. Redirecting...'});setTimeout(()=>{location.href='/dashboard'},1200)}
 if(ok===null)return <main className="!max-w-md py-12"><Skeleton className="h-72 w-full"/></main>;
 return <main className="!max-w-md py-10"><div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:shadow-none dark:ring-slate-800 sm:p-8">
  <div className="mb-6 text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-pri/10 text-pri dark:text-indigo-300"><Icon n="lock" size={26}/></div><h1 className="!mb-1 !text-2xl">Set a new password</h1></div>
  {!ok?<><Alert tone="danger" title="This reset link is invalid or has expired">Please request a new password reset email.</Alert><Link className="btn w-full" href="/auth?mode=login">Back to login</Link></>
  :<form onSubmit={go} noValidate>
   <Field label="New password"><input type="password" minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" value={p} onChange={e=>setP(e.target.value)}/></Field>
   <Field label="Confirm new password"><input type="password" minLength={8} required autoComplete="new-password" value={p2} onChange={e=>setP2(e.target.value)}/></Field>
   {m&&<Alert tone={m.t}>{m.m}</Alert>}
   <button disabled={busy} className="w-full !py-3">{busy?'Please wait...':'Update password'}</button></form>}</div></main>}
