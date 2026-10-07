'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {sb} from '../../../lib/supabase';
import {pkr} from '../../../lib/content';
import Modal from '../../../components/Modal';
import {Alert,Badge,Empty,Skeleton} from '../../../components/ui';

// Admin: list students and make / remove admins. Both actions run as database functions that check is_admin().
export default function Users(){
 const [u,setU]=useState(null),[err,setErr]=useState(''),[q,setQ]=useState(''),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(null),[me,setMe]=useState('');
 const load=useCallback(async()=>{
  const {data,error}=await sb.rpc('admin_list_users');
  if(error){console.error(error);setErr('Could not load students. Please run supabase/update_2.sql in the Supabase SQL Editor (once), then refresh.');return}
  setErr('');setU(data||[])},[]);
 useEffect(()=>{load();sb.auth.getUser().then(({data})=>setMe(data.user?.id||''))},[load]);
 const list=useMemo(()=>(u||[]).filter(x=>`${x.full_name} ${x.phone} ${x.email} ${x.referral_code}`.toLowerCase().includes(q.trim().toLowerCase())),[u,q]);
 async function run(){
  if(busy||!ask)return;setBusy(true);
  const {error}=await sb.rpc('set_user_role',{uid:ask.id,new_role:ask.role});
  setBusy(false);setAsk(null);
  setMsg(error?{t:'danger',m:error.message}:{t:'success',m:ask.role=='admin'?'Done. This user is now an admin.':'Done. Admin access removed.'});load()}
 return <main><h1 className="!text-2xl">Students {u&&<span className="text-base font-medium text-slate-400">({u.length})</span>}</h1>
  {msg&&<Alert tone={msg.t} onClose={()=>setMsg(null)}>{msg.m}</Alert>}
  {err?<div className="card"><Empty icon="alert" title="Students unavailable">{err}</Empty></div>:<>
   <label className="sr-only" htmlFor="uq">Search students</label><input id="uq" placeholder="Search name, phone, email or code" value={q} onChange={e=>setQ(e.target.value)} maxLength={80}/>
   <div className="card mt-3">{!u?<Skeleton className="h-40"/>:list.length==0?<Empty icon="info" title="No students found">Try a different search.</Empty>
    :<div className="table-wrap"><table><thead><tr><th>Student</th><th>Phone</th><th>Plan</th><th>Balance</th><th>Role</th><th>Joined</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{list.map(x=>
     <tr key={x.id}><td><b className="text-slate-900 dark:text-white">{x.full_name||'-'}</b><div className="break-all text-xs text-slate-500">{x.email}</div></td><td>{x.phone||'-'}</td><td>{x.plan||'-'}</td><td className="whitespace-nowrap">{pkr(x.balance)}</td>
      <td>{x.role=='admin'?<Badge tone="info">Admin</Badge>:<Badge>Student</Badge>}</td><td className="whitespace-nowrap">{String(x.created_at).slice(0,10)}</td>
      <td className="whitespace-nowrap text-right">{x.id==me?<span className="text-xs text-slate-400">You</span>
       :x.role=='admin'?<button type="button" className="danger btn-sm !my-0" onClick={()=>setAsk({id:x.id,role:'student',name:x.full_name||x.email})}>Remove admin</button>
       :<button type="button" className="btn-sm !my-0" onClick={()=>setAsk({id:x.id,role:'admin',name:x.full_name||x.email})}>Make admin</button>}</td></tr>)}</tbody></table></div>}</div></>}
  <Modal open={!!ask} onClose={()=>!busy&&setAsk(null)} title={ask?.role=='admin'?'Make admin?':'Remove admin?'}
   footer={<><button type="button" className="sec !my-0" disabled={busy} onClick={()=>setAsk(null)}>Cancel</button><button type="button" className={`!my-0 ${ask?.role=='admin'?'':'danger'}`} disabled={busy} onClick={run}>{busy?'Please wait...':'Confirm'}</button></>}>
   <p className="mb-0">{ask?.role=='admin'?`${ask?.name} will get full access to the admin panel: payments, withdrawals, students, courses and website content. Only do this for people you fully trust.`:`${ask?.name} will become a normal student and lose admin access.`}</p></Modal></main>}
