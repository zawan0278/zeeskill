'use client';
import {useState} from 'react';
import {sb} from '../../../../lib/supabase';
import {pkr} from '../../../../lib/content';
import {METHODS,fmtDate} from '../../../../lib/dashboard';
import Icon from '../../../../components/Icon';
import {useUser} from '../../../../components/UserData';
import {Alert,Empty,Field,StatusBadge} from '../../../../components/ui';

// Buy / upgrade a plan: send money to the official account, then submit the transaction ID. Amount is fixed by the database.
export default function Upgrade(){
 const {d,cfg,flash,reload}=useUser(),[busy,setBusy]=useState(false),[sel,setSel]=useState('');
 const {p}=d,mine=d.plans.find(x=>x.id==p.plan),myRank=mine?.rank||0,pending=d.py.filter(x=>x.status=='pending').length;
 const def=(d.plans.find(x=>(x.rank||0)>myRank)||d.plans[d.plans.length-1])?.id||'',chosen=d.plans.find(x=>x.id==(sel||def)),notUpgrade=chosen&&p.plan&&(chosen.rank||0)<=myRank;
 async function copy(t){try{await navigator.clipboard.writeText(t);flash('success','Copied to clipboard.')}catch{flash('danger','Could not copy automatically. Please copy it manually.')}}
 async function pay(e){
  e.preventDefault();if(busy)return;
  const form=e.target,f=new FormData(form),plan=d.plans.find(x=>x.id==f.get('plan')),txn=String(f.get('txn')||'').trim(),method=String(f.get('method')||'');
  if(!plan)return flash('warn','Please choose a plan.');
  if(!METHODS.includes(method))return flash('warn','Please choose how you paid.');
  if(!/^[A-Za-z0-9_-]{6,40}$/.test(txn))return flash('warn','Enter a valid transaction ID (6 to 40 letters or numbers, no spaces).');
  setBusy(true);
  const {error}=await sb.from('payments').insert({user_id:p.id,plan_id:plan.id,amount:plan.price,method,txn_ref:txn});
  setBusy(false);
  if(error){console.error(error);return flash('danger',error.code=='23505'?'This transaction ID was already submitted.':'Could not submit your payment. Please try again.')}
  form.reset();flash('success','Payment submitted. We will verify it and activate your plan soon.');reload()}
 return <main className="!max-w-6xl"><h1 className="!text-2xl">Upgrade your plan</h1>
  <div className="grid gap-5 lg:grid-cols-2">
   <section className="card !mb-0"><h2 className="card-title !text-lg">Step 1: Send payment</h2><p className="text-sm text-slate-500 dark:text-slate-400">Pay only to these official accounts:</p>
    {(cfg.accounts||[]).map(a=><div key={a[1]} className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
     <div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-wide text-pri dark:text-emerald-300">{a[0]}</div><div className="font-head text-lg font-bold text-slate-900 dark:text-white">{a[1]}</div><div className="text-xs text-slate-500">{a[2]}</div></div>
     <button type="button" onClick={()=>copy(a[1])} className="sec btn-sm !my-0" aria-label={`Copy ${a[0]} number`}><Icon n="copy" size={14}/>Copy</button></div>)}
    <Alert tone="warn" className="mb-0">Never send money to any other number or agent.</Alert></section>
   <form className="card !mb-0" onSubmit={pay} noValidate><h2 className="card-title !text-lg">Step 2: Submit your payment</h2>
    {pending>0&&<Alert tone="info">You already have {pending} payment{pending>1?'s':''} waiting for verification. Please do not submit the same payment twice.</Alert>}
    <Field label="Plan"><select name="plan" value={sel||def} onChange={e=>setSel(e.target.value)}>{d.plans.map(x=><option key={x.id} value={x.id}>{x.name} – {pkr(x.price)}</option>)}</select></Field>
    {notUpgrade&&<Alert tone="warn">You already have the {mine?.name||p.plan} plan. This choice will not upgrade your plan. Choose a higher plan to upgrade.</Alert>}
    <Field label="Paid via"><select name="method">{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
    <Field label="Transaction ID (TID)" hint="Find it in the payment SMS or app receipt."><input name="txn" placeholder="e.g. 12345678901" required maxLength={40} autoComplete="off"/></Field>
    <button disabled={busy} className="w-full">{busy?'Submitting...':'Submit for verification'}</button>
    <p className="mb-0 mt-2 text-xs text-slate-500">Your plan is activated after we verify the payment.</p></form></div>
  <section className="card mt-5"><h2 className="card-title !text-lg">Your payments</h2>{d.py.length==0?<Empty icon="card" title="No payments yet">Submitted payments will be listed here.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Plan</th><th>Amount</th><th>Via</th><th>Date</th><th>Status</th></tr></thead><tbody>{d.py.map(x=><tr key={x.id}><td>{d.plans.find(q=>q.id==x.plan_id)?.name||x.plan_id}</td><td>{pkr(x.amount)}</td><td>{x.method}</td><td>{fmtDate(x.created_at)}</td><td><StatusBadge s={x.status}/></td></tr>)}</tbody></table></div>}</section></main>}
