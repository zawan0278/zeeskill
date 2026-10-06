'use client';
import {useState} from 'react';
import {sb} from '../lib/supabase';
import {Alert} from './ui';
export default function ContactForm(){
 const [m,setM]=useState(null),[busy,setBusy]=useState(false);
 async function send(e){
  e.preventDefault();if(busy)return;
  const form=e.target,v=Object.fromEntries(new FormData(form));
  const row={name:String(v.name||'').trim(),email:String(v.email||'').trim(),message:String(v.message||'').trim()};
  if(row.name.length<2||row.message.length<10)return setM({t:'warn',m:'Please enter your name and a message of at least 10 characters.'});
  setBusy(true);const {error}=await sb.from('messages').insert(row);setBusy(false);
  if(error)return setM({t:'danger',m:'Could not send your message. Please use WhatsApp instead.'});
  setM({t:'success',m:'Thank you! We will contact you soon.'});form.reset()}
 return <form className="card" onSubmit={send}>
  <label className="field"><span className="label">Your name</span><input name="name" required maxLength={80} autoComplete="name"/></label>
  <label className="field"><span className="label">Email</span><input name="email" type="email" required maxLength={120} autoComplete="email"/></label>
  <label className="field"><span className="label">Message</span><textarea name="message" rows={5} required maxLength={2000}/></label>
  <button disabled={busy} className="w-full">{busy?'Sending...':'Send message'}</button>
  {m&&<Alert tone={m.t} className="mb-0 mt-4">{m.m}</Alert>}</form>}
