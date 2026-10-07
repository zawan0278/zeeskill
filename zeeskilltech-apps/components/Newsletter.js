'use client';
import {useState} from 'react';
import {sb} from '../lib/supabase';
export default function Newsletter(){
 const [m,setM]=useState(''),[busy,setBusy]=useState(false);
 async function go(e){
  e.preventDefault();if(busy)return;
  const form=e.target,email=String(new FormData(form).get('email')||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120)return setM('Please enter a valid email.');
  setBusy(true);const {error}=await sb.from('subscribers').insert({email});setBusy(false);
  setM(error?(error.code=='23505'?'You are already subscribed.':'Could not subscribe. Please try again later.'):'Thanks! You are subscribed.');
  if(!error)form.reset()}
 return <form onSubmit={go} noValidate>
  <label htmlFor="nl-email" className="sr-only">Email address</label>
  <input id="nl-email" name="email" type="email" required maxLength={120} autoComplete="email" placeholder="Your email" className="!my-0 !border-slate-700 !bg-slate-900 !text-white"/>
  <button disabled={busy} className="sec mt-2 w-full">{busy?'Please wait...':'Subscribe'}</button>
  <p role="status" aria-live="polite" className="mb-0 mt-2 min-h-[1.25rem] text-xs">{m}</p></form>}
