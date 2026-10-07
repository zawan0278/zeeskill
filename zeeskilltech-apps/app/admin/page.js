'use client';
import {useCallback,useEffect,useState} from 'react';
import {sb} from '../../lib/supabase';
import {pkr} from '../../lib/content';
import Modal from '../../components/Modal';
import {Alert,Badge,Empty,Skeleton} from '../../components/ui';

// Admin: verify payments (activates plan + pays commissions) and process withdrawals. Enforced by the database (is_admin()).
const fmt=d=>new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});
export default function Admin(){
 const [py,setPy]=useState(null),[w,setW]=useState(null),[plans,setPlans]=useState([]),[msg,setMsg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{
  const [a,b,c]=await Promise.all([
   sb.from('payments').select('*,profiles(full_name,phone,plan)').eq('status','pending').order('created_at'),
   sb.from('withdrawals').select('*,profiles(full_name,phone)').eq('status','pending').order('created_at'),
   sb.from('plans').select('id,name,rank')]);
  if(a.error||b.error)setMsg({t:'danger',m:'Could not load pending items. Please refresh.'});
  setPy(a.data||[]);setW(b.data||[]);setPlans(c.data||[])},[]);
 useEffect(()=>{load()},[load]);

 const rank=id=>plans.find(x=>x.id==id)?.rank||0,name=id=>plans.find(x=>x.id==id)?.name||id;
 async function run(){
  if(busy||!ask)return;setBusy(true);
  const {error}=await sb.rpc(ask.fn,ask.args);setBusy(false);setAsk(null);
  setMsg(error?{t:'danger',m:error.message}:{t:'success',m:'Done.'});load()}
 const act=(fn,args,title,detail,danger)=>setAsk({fn,args,title,detail,danger});

 const Row=({children})=><tr>{children}</tr>;
 return <main>
  <h1 className="!text-2xl">Payments &amp; Withdrawals</h1>
  {msg&&<Alert tone={msg.t} onClose={()=>setMsg(null)}>{msg.m}</Alert>}
  <section className="card" aria-labelledby="pp"><h2 id="pp" className="card-title flex items-center gap-2">Pending payments {py&&<Badge tone={py.length?'warn':'muted'}>{py.length}</Badge>}</h2>
   {!py?<Skeleton className="h-24"/>:py.length==0?<Empty icon="receipt" title="No pending payments">New payment submissions will appear here.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Student</th><th>Plan</th><th>Payment</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{py.map(x=>{
    const same=x.profiles?.plan&&rank(x.plan_id)<=rank(x.profiles.plan);
    return <Row key={x.id}><td><b className="text-slate-900 dark:text-white">{x.profiles?.full_name||'-'}</b><div className="text-xs text-slate-500">{x.profiles?.phone}</div></td>
     <td>{name(x.plan_id)}<div className="text-xs text-slate-500">{pkr(x.amount)}</div>{same&&<div className="mt-1"><Badge tone="warn">Already has {name(x.profiles.plan)}</Badge></div>}</td>
     <td>{x.method}<div className="break-all text-xs text-slate-500">TID: {x.txn_ref}</div></td><td className="whitespace-nowrap">{fmt(x.created_at)}</td>
     <td className="whitespace-nowrap text-right"><button type="button" className="btn-sm !my-0" onClick={()=>act('approve_payment',{pid:x.id,ok:true},'Approve payment',`${x.profiles?.full_name}: ${name(x.plan_id)} plan, ${pkr(x.amount)} via ${x.method}, TID ${x.txn_ref}. This activates the plan and credits referral commissions.`)}>Approve</button>
      <button type="button" className="danger btn-sm !my-0" onClick={()=>act('approve_payment',{pid:x.id,ok:false},'Reject payment',`${x.profiles?.full_name}: TID ${x.txn_ref}.`,true)}>Reject</button></td></Row>})}</tbody></table></div>}</section>
  <section className="card" aria-labelledby="pw"><h2 id="pw" className="card-title flex items-center gap-2">Pending withdrawals {w&&<Badge tone={w.length?'warn':'muted'}>{w.length}</Badge>}</h2>
   {!w?<Skeleton className="h-24"/>:w.length==0?<Empty icon="send" title="No pending withdrawals">Withdrawal requests will appear here.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Student</th><th>Amount</th><th>Pay to</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{w.map(x=>
    <Row key={x.id}><td><b className="text-slate-900 dark:text-white">{x.profiles?.full_name||'-'}</b><div className="text-xs text-slate-500">{x.profiles?.phone}</div></td>
     <td className="font-semibold">{pkr(x.amount)}</td><td>{x.method}<div className="break-all text-xs text-slate-500">{x.account}</div></td><td className="whitespace-nowrap">{fmt(x.created_at)}</td>
     <td className="whitespace-nowrap text-right"><button type="button" className="btn-sm !my-0" onClick={()=>act('process_withdrawal',{wid:x.id,ok:true},'Mark as paid',`Confirm you have sent ${pkr(x.amount)} to ${x.account} (${x.method}) for ${x.profiles?.full_name}.`)}>Mark paid</button>
      <button type="button" className="danger btn-sm !my-0" onClick={()=>act('process_withdrawal',{wid:x.id,ok:false},'Reject withdrawal',`The ${pkr(x.amount)} will be returned to ${x.profiles?.full_name}'s balance.`,true)}>Reject</button></td></Row>)}</tbody></table></div>}</section>
  <Modal open={!!ask} onClose={()=>!busy&&setAsk(null)} title={ask?.title}
   footer={<><button type="button" className="sec !my-0" disabled={busy} onClick={()=>setAsk(null)}>Cancel</button><button type="button" className={`!my-0 ${ask?.danger?'danger':''}`} disabled={busy} onClick={run}>{busy?'Please wait...':'Confirm'}</button></>}>
   <p className="mb-0">{ask?.detail}</p></Modal></main>}
