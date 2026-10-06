'use client';
import {useEffect,useState} from 'react';
import {sb} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {Alert,Field,Skeleton} from '../../components/ui';

// Login + Register in one page. /auth?ref=CODE pre-fills the referral code. Signed-in visitors go straight to the dashboard.
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Auth(){
 const [mode,setMode]=useState('register'),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[show,setShow]=useState(false),[msg,setMsg]=useState(null);
 const [f,setF]=useState({email:'',password:'',full_name:'',phone:'',ref:''});
 const login=mode=='login',set=k=>e=>setF(x=>({...x,[k]:e.target.value}));

 useEffect(()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('mode')=='login')setMode('login');
  setF(x=>({...x,ref:(q.get('ref')||'').toUpperCase().slice(0,12)}));
  sb.auth.getSession().then(({data})=>{if(data.session)location.replace('/dashboard');else setReady(true)}).catch(()=>setReady(true));
 },[]);

 async function forgot(){
  if(busy)return;
  if(!EMAIL.test(f.email.trim()))return setMsg({t:'warn',m:'Type your email address above first.'});
  setBusy(true);const {error}=await sb.auth.resetPasswordForEmail(f.email.trim(),{redirectTo:location.origin+'/reset'});setBusy(false);
  setMsg(error?{t:'danger',m:error.message}:{t:'success',m:'If this email is registered, a password reset link has been sent.'})}

 async function go(e){
  e.preventDefault();if(busy)return;setMsg(null);
  const email=f.email.trim(),name=f.full_name.trim(),phone=f.phone.replace(/[\s()-]/g,''),ref=f.ref.trim().toUpperCase();
  if(!EMAIL.test(email))return setMsg({t:'warn',m:'Please enter a valid email address.'});
  if(f.password.length<8)return setMsg({t:'warn',m:'Your password must be at least 8 characters.'});
  if(!login){
   if(name.length<2)return setMsg({t:'warn',m:'Please enter your full name.'});
   if(!/^\+?\d{10,15}$/.test(phone))return setMsg({t:'warn',m:'Please enter a valid phone number, e.g. 03xx-xxxxxxx.'});
   if(ref&&!/^[A-Z0-9]{4,12}$/.test(ref))return setMsg({t:'warn',m:'That referral code does not look right. Leave it empty if you do not have one.'})}
  setBusy(true);
  const r=login?await sb.auth.signInWithPassword({email,password:f.password})
   :await sb.auth.signUp({email,password:f.password,options:{data:{full_name:name,phone,ref}}});
  setBusy(false);
  if(r.error)return setMsg({t:'danger',m:r.error.message});
  if(!login&&!r.data.session)return setMsg({t:'success',m:'Account created. Check your email to confirm your account, then log in.'});
  location.href='/dashboard'}

 if(!ready)return <main className="!max-w-md py-12"><Skeleton className="h-[28rem] w-full"/></main>;
 return <main className="!max-w-md py-10">
  <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:shadow-none dark:ring-slate-800 sm:p-8">
   <div className="mb-6 text-center">
    <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-pri/10 text-pri dark:text-indigo-300"><Icon n={login?'lock':'users'} size={26}/></div>
    <h1 className="!mb-1 !text-2xl">{login?'Welcome back':'Create your account'}</h1>
    <p className="mb-0 text-sm text-slate-500 dark:text-slate-400">{login?'Log in to continue learning':'Learn skills and start earning'}</p></div>
   <form onSubmit={go} noValidate>
    {!login&&<><Field label="Full name"><input value={f.full_name} onChange={set('full_name')} placeholder="Your name" required autoComplete="name" maxLength={80}/></Field>
     <Field label="Phone"><input value={f.phone} onChange={set('phone')} type="tel" inputMode="tel" placeholder="03xx-xxxxxxx" required autoComplete="tel" maxLength={20}/></Field></>}
    <Field label="Email"><input value={f.email} onChange={set('email')} type="email" placeholder="you@email.com" required autoComplete="email" maxLength={120}/></Field>
    <label className="field"><span className="label">Password</span>
     <span className="relative block"><input value={f.password} onChange={set('password')} type={show?'text':'password'} minLength={8} placeholder="At least 8 characters" required autoComplete={login?'current-password':'new-password'} className="!pr-11"/>
      <button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'} className="btn-icon absolute right-1.5 top-1/2 -translate-y-1/2 !bg-transparent"><Icon n={show?'eyeoff':'eye'} size={18}/></button></span></label>
    {!login&&<Field label="Referral code (optional)" hint="If the code is wrong you will still be registered, but without a referrer."><input value={f.ref} onChange={set('ref')} placeholder="e.g. A1B2C3D4" maxLength={12} autoCapitalize="characters" autoComplete="off"/></Field>}
    {msg&&<Alert tone={msg.t}>{msg.m}</Alert>}
    <button disabled={busy} className="w-full !py-3">{busy?'Please wait...':login?'Log in':'Create account'}</button></form>
   {login&&<p className="mb-0 mt-4 text-center text-sm"><button type="button" onClick={forgot} disabled={busy} className="!m-0 !bg-transparent !p-0 !font-medium !text-pri !shadow-none hover:underline dark:!text-indigo-300">Forgot password?</button></p>}
   <p className="mb-0 mt-4 text-center text-sm text-slate-500 dark:text-slate-400">{login?'New here?':'Already a member?'}{' '}
    <button type="button" onClick={()=>{setMode(login?'register':'login');setMsg(null)}} className="!m-0 !bg-transparent !p-0 !font-semibold !text-pri !shadow-none hover:underline dark:!text-indigo-300">{login?'Create an account':'Log in'}</button></p></div></main>}
