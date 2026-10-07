'use client';
import {useState} from 'react';
import {sb} from '../../../../lib/supabase';
import {pkr} from '../../../../lib/content';
import {MAX,METHODS,MIN,fmtDate} from '../../../../lib/dashboard';
import Modal from '../../../../components/Modal';
import {useUser} from '../../../../components/UserData';
import {Empty,Field,StatusBadge} from '../../../../components/ui';

// Withdrawals: the limits are enforced again by the request_withdrawal database function.
export default function Withdrawals(){
 const {d,flash,reload}=useUser(),{p}=d,[busy,setBusy]=useState(false),[wd,setWd]=useState(null);
 function ask(e){
  e.preventDefault();if(busy)return;
  const f=new FormData(e.target),amt=Number(f.get('amt')),method=String(f.get('method')||''),acc=String(f.get('acc')||'').trim();
  if(!Number.isInteger(amt)||amt<MIN||amt>MAX)return flash('warn',`Enter a whole amount between ${pkr(MIN)} and ${pkr(MAX)}.`);
  if(amt>p.balance)return flash('warn','The amount is more than your available balance.');
  if(!METHODS.includes(method))return flash('warn','Please choose how you want to receive the money.');
  if(!/^[A-Za-z0-9 -]{6,34}$/.test(acc))return flash('warn','Enter a valid account number or IBAN.');
  setWd({amt,method,acc,form:e.target})}
 async function confirm(){
  if(busy||!wd)return;setBusy(true);
  const {error}=await sb.rpc('request_withdrawal',{amt:wd.amt,m:wd.method,acc:wd.acc});
  setBusy(false);const form=wd.form;setWd(null);
  if(error){console.error(error);return flash('danger',/^(Insufficient balance|Withdrawal must be)/.test(error.message)?error.message:'Could not request the withdrawal. Please try again.')}
  form.reset();flash('success','Withdrawal requested. We will pay you soon.');reload()}
 return <main className="!max-w-6xl"><h1 className="!text-2xl">Withdrawals</h1>
  <div className="grid gap-5 lg:grid-cols-2">
   <section className="card !mb-0"><div className="text-sm text-slate-500 dark:text-slate-400">Available balance</div><div className="font-head text-4xl font-extrabold text-pri dark:text-emerald-300">{pkr(p.balance)}</div>
    <ul className="mb-0 mt-4 list-none space-y-2 p-0 text-sm"><li>Minimum per request: <b>{pkr(MIN)}</b></li><li>Maximum per request: <b>{pkr(MAX)}</b></li><li>Paid manually via JazzCash, SadaPay, Easypaisa or bank transfer.</li></ul></section>
   <form className="card !mb-0" onSubmit={ask} noValidate><h2 className="card-title !text-lg">Request withdrawal</h2>
    <Field label="Amount (PKR)"><input name="amt" type="number" inputMode="numeric" step="1" min={MIN} max={MAX} placeholder={`${MIN} – ${MAX}`} required/></Field>
    <Field label="Receive via"><select name="method">{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
    <Field label="Account number / IBAN"><input name="acc" required maxLength={34} autoComplete="off"/></Field>
    <button disabled={busy||p.balance<MIN} className="w-full">Review request</button>
    {p.balance<MIN&&<p className="mb-0 mt-2 text-xs text-slate-500">You need at least {pkr(MIN)} to request a withdrawal.</p>}</form></div>
  <section className="card mt-5"><h2 className="card-title !text-lg">Withdrawal history</h2>{d.w.length==0?<Empty icon="send" title="No withdrawals yet">Your withdrawal requests will be listed here.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Amount</th><th>Via</th><th>Date</th><th>Status</th></tr></thead><tbody>{d.w.map(x=><tr key={x.id}><td className="font-semibold text-slate-900 dark:text-white">{pkr(x.amount)}</td><td>{x.method}</td><td>{fmtDate(x.created_at)}</td><td><StatusBadge s={x.status}/></td></tr>)}</tbody></table></div>}</section>
  <Modal open={!!wd} onClose={()=>!busy&&setWd(null)} title="Confirm withdrawal"
   footer={<><button type="button" className="sec !my-0" onClick={()=>setWd(null)} disabled={busy}>Cancel</button><button type="button" className="!my-0" onClick={confirm} disabled={busy}>{busy?'Requesting...':'Confirm withdrawal'}</button></>}>
   {wd&&<><p>Please check the details carefully. The amount is deducted from your balance immediately.</p>
    <dl className="m-0 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">{[['Amount',pkr(wd.amt)],['Method',wd.method],['Account',wd.acc]].map(([k,v])=><div key={k} className="flex justify-between gap-3"><dt>{k}</dt><dd className="m-0 break-all font-semibold text-slate-900 dark:text-white">{v}</dd></div>)}</dl></>}</Modal></main>}
