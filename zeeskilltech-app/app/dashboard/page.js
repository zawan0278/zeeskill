'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {sb} from '../../lib/supabase';
import {C as C0,pkr} from '../../lib/content';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import {Alert,Avatar,Badge,Empty,Field,Skeleton,Stat,StatusBadge} from '../../components/ui';

// Student dashboard: profile, earnings summary, referral link, buy/upgrade plan, withdraw, history.
// All money rules (amounts, limits, commissions) are enforced by database functions; the checks here are only for friendlier UX.
const MIN=500,MAX=50000;
const METHODS=['JazzCash','SadaPay','Easypaisa','Bank Transfer'];
const TABS=[['overview','dashboard','Overview'],['plan','card','Buy / Upgrade'],['withdraw','send','Withdraw'],['history','receipt','History']];
const fmtDate=d=>new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});

// Earnings are the sum of the student's commission rows, bucketed by the visitor's local calendar day.
// Today = since local midnight. Last 7 / 30 days = today plus the previous 6 / 29 days.
function summarize(list){
 const n=new Date(),y=n.getFullYear(),m=n.getMonth(),d=n.getDate();
 const at=back=>new Date(y,m,d-back).getTime();
 const sum=(from,to=Infinity)=>list.reduce((s,x)=>{const t=new Date(x.created_at).getTime();return t>=from&&t<to?s+x.amount:s},0);
 const days=[6,5,4,3,2,1,0].map(b=>({label:new Date(y,m,d-b).toLocaleDateString('en-PK',{weekday:'short'}),amount:sum(at(b),at(b-1))}));
 return {today:sum(at(0)),d7:sum(at(6)),d30:sum(at(29)),total:list.reduce((s,x)=>s+x.amount,0),days};
}

function DashboardSkeleton(){
 return <main className="!max-w-6xl" aria-busy="true" aria-label="Loading dashboard">
  <Skeleton className="mb-6 h-32 w-full"/>
  <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map(i=><Skeleton key={i} className="h-32"/>)}</div>
  <Skeleton className="h-64 w-full"/></main>}

function EarningsChart({days}){
 const max=Math.max(...days.map(x=>x.amount),1);
 const label=days.map(x=>`${x.label}: ${pkr(x.amount)}`).join(', ');
 return <div role="img" aria-label={`Earnings for the last 7 days. ${label}`}>
  <div className="flex h-40 items-end gap-2 sm:gap-3" aria-hidden="true">
   {days.map((x,i)=><div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{x.amount?pkr(x.amount).replace('PKR ',''):''}</span>
    <div className={`w-full max-w-[44px] rounded-t-lg ${x.amount?'bg-pri':'bg-slate-200 dark:bg-slate-800'}`} style={{height:`${x.amount?Math.max(8,x.amount/max*100):4}%`}}/>
    <span className="text-xs text-slate-500 dark:text-slate-400">{x.label}</span></div>)}</div></div>}

export default function Dashboard(){
 const [d,setD]=useState(null),[err,setErr]=useState(''),[msg,setMsg]=useState(null),[tab,setTab]=useState('overview');
 const [busy,setBusy]=useState(''),[wd,setWd]=useState(null),[selPlan,setSelPlan]=useState(''),[cfg,setCfg]=useState(C0);

 const flash=(t,m)=>setMsg({t,m});
 const load=useCallback(async()=>{
  try{
   const {data:{user}}=await sb.auth.getUser();
   if(!user){location.href='/auth?mode=login';return}
   const [p,pl,c,py,w,ce,rf]=await Promise.all([
    sb.from('profiles').select('*').eq('id',user.id).single(),
    sb.from('plans').select('*').order('price'),
    sb.from('commissions').select('*').eq('earner_id',user.id).order('created_at',{ascending:false}),
    sb.from('payments').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('withdrawals').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
    sb.from('certificates').select('code,issued_at,courses(title)').eq('user_id',user.id),
    sb.rpc('my_referrals')]);
   if(p.error||!p.data)throw p.error||new Error('Profile not found');
   setD({user,p:p.data,plans:pl.data||[],c:c.data||[],py:py.data||[],w:w.data||[],ce:ce.data||[],rf:rf.data||[],
    partial:[pl,c,py,w,ce,rf].some(r=>r.error)});
   setErr('');
  }catch(e){console.error(e);setErr('We could not load your dashboard. Please check your internet connection and try again.')}
 },[]);
 useEffect(()=>{
  load();
  sb.from('site_content').select('value').eq('key','main').maybeSingle().then(({data})=>{if(data?.value)setCfg({...C0,...data.value})});
 },[load]);

 const earn=useMemo(()=>summarize(d?.c||[]),[d]);

 async function copy(text){
  try{await navigator.clipboard.writeText(text);flash('success','Copied to clipboard.')}
  catch{flash('danger','Could not copy automatically. Please copy it manually.')}}

 async function logout(){await sb.auth.signOut();location.href='/'}

 async function pickAvatar(e){
  const f=e.target.files?.[0];e.target.value='';
  if(!f||busy)return;
  if(!/^image\/(png|jpeg|webp)$/.test(f.type))return flash('warn','Please choose a JPG, PNG or WebP image.');
  if(f.size>2*1024*1024)return flash('warn','The image must be smaller than 2 MB.');
  setBusy('avatar');
  const path=`${d.p.id}/avatar-${Date.now()}.${f.type=='image/png'?'png':f.type=='image/webp'?'webp':'jpg'}`;
  const up=await sb.storage.from('avatars').upload(path,f,{contentType:f.type,cacheControl:'3600'});
  if(up.error){console.error(up.error);setBusy('');return flash('danger','Profile photo upload is not available right now. Please try again later.')}
  const url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  const {error}=await sb.rpc('set_my_avatar',{url});
  setBusy('');
  if(error){console.error(error);return flash('danger','Could not save your photo. Please try again.')}
  flash('success','Profile photo updated.');load()}

 async function pay(e){
  e.preventDefault();if(busy)return;
  const form=e.target,f=new FormData(form),plan=d.plans.find(x=>x.id==f.get('plan')),txn=String(f.get('txn')||'').trim(),method=String(f.get('method')||'');
  if(!plan)return flash('warn','Please choose a plan.');
  if(!METHODS.includes(method))return flash('warn','Please choose how you paid.');
  if(!/^[A-Za-z0-9_-]{6,40}$/.test(txn))return flash('warn','Enter a valid transaction ID (6 to 40 letters or numbers, no spaces).');
  setBusy('pay');
  const {error}=await sb.from('payments').insert({user_id:d.p.id,plan_id:plan.id,amount:plan.price,method,txn_ref:txn});
  setBusy('');
  if(error){console.error(error);return flash('danger',error.code=='23505'?'This transaction ID was already submitted.':'Could not submit your payment. Please try again.')}
  form.reset();flash('success','Payment submitted. We will verify it and activate your plan soon.');setTab('history');load()}

 function askWithdraw(e){
  e.preventDefault();if(busy)return;
  const f=new FormData(e.target),amt=Number(f.get('amt')),method=String(f.get('method')||''),acc=String(f.get('acc')||'').trim();
  if(!Number.isInteger(amt)||amt<MIN||amt>MAX)return flash('warn',`Enter a whole amount between ${pkr(MIN)} and ${pkr(MAX)}.`);
  if(amt>d.p.balance)return flash('warn','The amount is more than your available balance.');
  if(!METHODS.includes(method))return flash('warn','Please choose how you want to receive the money.');
  if(!/^[A-Za-z0-9 -]{6,34}$/.test(acc))return flash('warn','Enter a valid account number or IBAN.');
  setMsg(null);setWd({amt,method,acc,form:e.target})}

 async function confirmWithdraw(){
  if(busy||!wd)return;
  setBusy('wd');
  const {error}=await sb.rpc('request_withdrawal',{amt:wd.amt,m:wd.method,acc:wd.acc});
  setBusy('');
  const form=wd.form;setWd(null);
  if(error){console.error(error);return flash('danger',/^(Insufficient balance|Withdrawal must be)/.test(error.message)?error.message:'Could not request the withdrawal. Please try again.')}
  form.reset();flash('success','Withdrawal requested. We will pay you soon.');setTab('history');load()}

 if(err)return <main className="!max-w-lg"><div className="card text-center"><Empty icon="alert" title="Dashboard unavailable" action={<button onClick={()=>{setErr('');load()}}>Try again</button>}>{err}</Empty></div></main>;
 if(!d)return <DashboardSkeleton/>;

 const {p}=d,mine=d.plans.find(x=>x.id==p.plan),planName=mine?.name||(p.plan?p.plan[0].toUpperCase()+p.plan.slice(1):null);
 const pending=d.py.filter(x=>x.status=='pending').length,pendingWd=d.w.filter(x=>x.status=='pending').length;
 const link=`${location.origin}/auth?ref=${p.referral_code}`,l1=d.rf.filter(x=>x.level==1).length,l2=d.rf.length-l1;
 const myRank=mine?.rank||0,defPlan=(d.plans.find(x=>(x.rank||0)>myRank)||d.plans[d.plans.length-1])?.id||'';
 const chosen=d.plans.find(x=>x.id==(selPlan||defPlan)),notUpgrade=chosen&&p.plan&&(chosen.rank||0)<=myRank;

 return <main className="!max-w-6xl">
  {/* Profile header */}
  <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-5 text-white shadow-lg sm:p-7" aria-label="Profile">
   <div className="flex flex-wrap items-center justify-between gap-5">
    <div className="flex min-w-0 items-center gap-4">
     <div className="relative flex-none">
      <Avatar src={p.avatar_url} name={p.full_name||d.user.email} size={72} className="!ring-white/40"/>
      <label className={`absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-100 focus-within:ring-2 focus-within:ring-white ${busy=='avatar'?'pointer-events-none opacity-60':''}`}>
       <Icon n="camera" size={16}/><span className="sr-only">Change profile photo</span>
       <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickAvatar} disabled={busy=='avatar'} className="sr-only"/></label></div>
     <div className="min-w-0">
      <p className="mb-0 text-sm text-indigo-200">Welcome back</p>
      <h1 className="!mb-1 truncate !text-2xl !text-white sm:!text-3xl">{p.full_name||'Student'}</h1>
      <div className="flex flex-wrap items-center gap-2">
       {planName?<span className="badge bg-amber-400 text-slate-900"><Icon n="star" size={12}/>{planName} plan</span>:<span className="badge bg-white/15 text-white">No active plan</span>}
       {p.role=='admin'&&<span className="badge bg-white/15 text-white"><Icon n="shield" size={12}/>Admin</span>}
       <span className="truncate text-xs text-indigo-200">{d.user.email}</span></div></div></div>
    <div className="flex flex-wrap gap-2">
     <Link className="btn alt btn-sm" href="/courses"><Icon n="book" size={16}/>My courses</Link>
     {p.role=='admin'&&<Link className="btn btn-sm !bg-white/15 hover:!bg-white/25" href="/admin"><Icon n="shield" size={16}/>Admin</Link>}
     <button type="button" onClick={logout} className="btn btn-sm !my-0 !bg-white/15 hover:!bg-white/25"><Icon n="logout" size={16}/>Logout</button></div></div></section>

  {msg&&<Alert tone={msg.t} onClose={()=>setMsg(null)}>{msg.m}</Alert>}
  {d.partial&&<Alert tone="warn" title="Some information could not be loaded">Parts of your dashboard may be incomplete. Refresh the page to try again.</Alert>}
  {!p.plan&&p.role!='admin'&&<Alert tone="warn" title="No active plan yet">{pending?'Your payment is being verified. Your plan will activate once it is approved.':'Buy a plan to unlock courses and start earning commission.'}
   {!pending&&<div className="mt-2"><button type="button" onClick={()=>setTab('plan')} className="btn alt btn-sm !my-0">Buy a plan</button></div>}</Alert>}

  {/* Earnings */}
  <section aria-labelledby="earn-h" className="mb-6">
   <div className="mb-3 flex items-end justify-between gap-3"><h2 id="earn-h" className="!mb-0 text-xl">Earnings</h2><span className="text-xs text-slate-500 dark:text-slate-400">Referral commissions credited to you</span></div>
   <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <Stat icon="coin" tone="green" label="Today" value={pkr(earn.today)}/>
    <Stat icon="calendar" tone="sky" label="Last 7 days" value={pkr(earn.d7)}/>
    <Stat icon="calendar" tone="amber" label="Last 30 days" value={pkr(earn.d30)}/>
    <Stat icon="trend" label="Total earned" value={pkr(earn.total)}/></div></section>

  <section className="mb-6 grid gap-4 lg:grid-cols-3">
   <div className="card !mb-0 lg:col-span-2"><h3 className="card-title">Last 7 days</h3><p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Daily commission earnings (PKR)</p>
    {earn.d7==0?<Empty icon="trend" title="No earnings in the last 7 days">Share your referral link. You earn when someone you refer gets their plan approved.</Empty>:<EarningsChart days={earn.days}/>}</div>
   <div className="card !mb-0 flex flex-col"><div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Icon n="wallet" size={18}/>Available balance</div>
    <div className="font-head text-4xl font-extrabold text-pri dark:text-indigo-300">{pkr(p.balance)}</div>
    <p className="mb-0 mt-2 text-xs text-slate-500 dark:text-slate-400">{pendingWd?`${pendingWd} withdrawal request${pendingWd>1?'s':''} pending. `:''}Earnings minus withdrawals.</p>
    <dl className="m-0 mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><div><dt className="text-xs text-slate-500">Level 1 referrals</dt><dd className="m-0 font-semibold text-slate-900 dark:text-white">{l1}</dd></div><div><dt className="text-xs text-slate-500">Level 2 referrals</dt><dd className="m-0 font-semibold text-slate-900 dark:text-white">{l2}</dd></div></dl>
    <button type="button" onClick={()=>setTab('withdraw')} className="mt-auto w-full"><Icon n="send" size={16}/>Withdraw</button></div></section>

  {/* Tabs */}
  <nav className="tabs" aria-label="Dashboard sections">{TABS.map(([k,i,t])=><button key={k} type="button" aria-current={tab==k?'page':undefined} onClick={()=>{setTab(k);setMsg(null)}} className="tab"><Icon n={i} size={16}/>{t}</button>)}</nav>

  {tab=='overview'&&<div className="space-y-5">
   <div className="grid gap-5 lg:grid-cols-2">
    <div className="card !mb-0"><h3 className="card-title flex items-center gap-2"><Icon n="link" size={18}/>Your referral link</h3><p className="text-sm text-slate-500 dark:text-slate-400">Share it. When someone joins with it and their payment is verified, you earn commission.</p>
     <label className="sr-only" htmlFor="ref-link">Referral link</label><input id="ref-link" readOnly value={link} onFocus={e=>e.target.select()}/>
     <div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={()=>copy(link)} className="btn btn-sm"><Icon n="copy" size={16}/>Copy link</button><span className="text-xs text-slate-500">Your code: <b className="text-slate-900 dark:text-white">{p.referral_code}</b></span></div></div>
    <div className="card !mb-0"><h3 className="card-title flex items-center gap-2"><Icon n="award" size={18}/>My certificates</h3>
     {d.ce.length==0?<Empty icon="award" title="No certificates yet">Finish all lessons of a course to earn a certificate.</Empty>
      :<ul className="m-0 list-none p-0">{d.ce.map(x=><li key={x.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800"><Link href={`/verify/${x.code}`} className="font-medium">{x.courses?.title||'Course'}</Link><span className="text-xs text-slate-500">{fmtDate(x.issued_at)}</span></li>)}</ul>}</div></div>
   <div className="card !mb-0"><h3 className="card-title flex items-center gap-2"><Icon n="users" size={18}/>My referrals ({d.rf.length})</h3>
    {d.rf.length==0?<Empty icon="users" title="No referrals yet">Share your referral link to start building your team.</Empty>
     :<div className="table-wrap"><table><thead><tr><th>Level</th><th>Name</th><th>Plan</th><th>Joined</th></tr></thead><tbody>{d.rf.map((x,i)=><tr key={i}><td>Level {x.level}</td><td>{x.name||'-'}</td><td>{x.plan?<Badge tone="success">{x.plan}</Badge>:<Badge>Not joined yet</Badge>}</td><td>{x.joined?fmtDate(x.joined):'-'}</td></tr>)}</tbody></table></div>}</div></div>}

  {tab=='plan'&&<div className="grid gap-5 lg:grid-cols-2">
   <div className="card !mb-0"><h3 className="card-title">Step 1: Send payment</h3><p className="text-sm text-slate-500 dark:text-slate-400">Pay only to these official accounts:</p>
    {(cfg.accounts||[]).map(a=><div key={a[1]} className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
     <div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-wide text-pri dark:text-indigo-300">{a[0]}</div><div className="font-head text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{a[1]}</div><div className="text-xs text-slate-500">{a[2]}</div></div>
     <button type="button" onClick={()=>copy(a[1])} className="sec btn-sm !my-0" aria-label={`Copy ${a[0]} number`}><Icon n="copy" size={14}/>Copy</button></div>)}
    <Alert tone="warn" className="mb-0"><span>Never send money to any other number or agent.</span></Alert></div>
   <form className="card !mb-0" onSubmit={pay} noValidate><h3 className="card-title">Step 2: Submit your payment</h3>
    {pending>0&&<Alert tone="info">You already have {pending} payment{pending>1?'s':''} waiting for verification. Please do not submit the same payment twice.</Alert>}
    <Field label="Plan"><select name="plan" value={selPlan||defPlan} onChange={e=>setSelPlan(e.target.value)}>{d.plans.map(x=><option key={x.id} value={x.id}>{x.name} – {pkr(x.price)}</option>)}</select></Field>
    {notUpgrade&&<Alert tone="warn">You already have the {planName} plan. This choice will not upgrade your plan. Choose a higher plan to upgrade.</Alert>}
    <Field label="Paid via"><select name="method">{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
    <Field label="Transaction ID (TID)" hint="Find it in the payment SMS or app receipt."><input name="txn" placeholder="e.g. 12345678901" required maxLength={40} autoComplete="off" inputMode="text"/></Field>
    <button disabled={busy=='pay'} className="w-full">{busy=='pay'?'Submitting...':'Submit for verification'}</button>
    <p className="mb-0 mt-2 text-xs text-slate-500">Your plan is activated after we verify the payment.</p></form></div>}

  {tab=='withdraw'&&<div className="grid gap-5 lg:grid-cols-2">
   <div className="card !mb-0"><div className="text-sm text-slate-500 dark:text-slate-400">Available balance</div><div className="font-head text-4xl font-extrabold text-pri dark:text-indigo-300">{pkr(p.balance)}</div>
    <ul className="mb-0 mt-4 list-none space-y-2 p-0 text-sm"><li>Minimum per request: <b>{pkr(MIN)}</b></li><li>Maximum per request: <b>{pkr(MAX)}</b></li><li>Paid manually via JazzCash, SadaPay, Easypaisa or bank transfer.</li></ul></div>
   <form className="card !mb-0" onSubmit={askWithdraw} noValidate><h3 className="card-title">Request withdrawal</h3>
    <Field label="Amount (PKR)"><input name="amt" type="number" inputMode="numeric" step="1" min={MIN} max={MAX} placeholder={`${MIN} – ${MAX}`} required/></Field>
    <Field label="Receive via"><select name="method">{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
    <Field label="Account number / IBAN"><input name="acc" required maxLength={34} autoComplete="off"/></Field>
    <button disabled={!!busy||p.balance<MIN} className="w-full">Review request</button>
    {p.balance<MIN&&<p className="mb-0 mt-2 text-xs text-slate-500">You need at least {pkr(MIN)} to request a withdrawal.</p>}</form></div>}

  {tab=='history'&&<div className="space-y-5">
   <div className="card !mb-0"><h3 className="card-title">Commissions</h3>{d.c.length==0?<Empty icon="coin" title="No commissions yet">Commissions appear here after your referrals’ payments are approved.</Empty>
    :<div className="table-wrap"><table><thead><tr><th>Level</th><th>Amount</th><th>Date</th></tr></thead><tbody>{d.c.map(x=><tr key={x.id}><td>Level {x.level}</td><td className="font-semibold">{pkr(x.amount)}</td><td>{fmtDate(x.created_at)}</td></tr>)}</tbody></table></div>}</div>
   <div className="card !mb-0"><h3 className="card-title">Payments</h3>{d.py.length==0?<Empty icon="card" title="No payments yet">Submit a payment from the Buy / Upgrade tab.</Empty>
    :<div className="table-wrap"><table><thead><tr><th>Plan</th><th>Amount</th><th>Via</th><th>Date</th><th>Status</th></tr></thead><tbody>{d.py.map(x=><tr key={x.id}><td>{d.plans.find(q=>q.id==x.plan_id)?.name||x.plan_id}</td><td>{pkr(x.amount)}</td><td>{x.method}</td><td>{fmtDate(x.created_at)}</td><td><StatusBadge s={x.status}/></td></tr>)}</tbody></table></div>}</div>
   <div className="card !mb-0"><h3 className="card-title">Withdrawals</h3>{d.w.length==0?<Empty icon="send" title="No withdrawals yet">Your withdrawal requests will be listed here.</Empty>
    :<div className="table-wrap"><table><thead><tr><th>Amount</th><th>Via</th><th>Date</th><th>Status</th></tr></thead><tbody>{d.w.map(x=><tr key={x.id}><td className="font-semibold">{pkr(x.amount)}</td><td>{x.method}</td><td>{fmtDate(x.created_at)}</td><td><StatusBadge s={x.status}/></td></tr>)}</tbody></table></div>}</div></div>}

  <Modal open={!!wd} onClose={()=>!busy&&setWd(null)} title="Confirm withdrawal"
   footer={<><button type="button" className="sec !my-0" onClick={()=>setWd(null)} disabled={busy=='wd'}>Cancel</button><button type="button" className="!my-0" onClick={confirmWithdraw} disabled={busy=='wd'}>{busy=='wd'?'Requesting...':'Confirm withdrawal'}</button></>}>
   {wd&&<><p>You are requesting a withdrawal. Please check the details carefully; the amount is deducted from your balance immediately.</p>
    <dl className="m-0 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><div className="flex justify-between gap-3"><dt>Amount</dt><dd className="m-0 font-semibold text-slate-900 dark:text-white">{pkr(wd.amt)}</dd></div><div className="flex justify-between gap-3"><dt>Method</dt><dd className="m-0 font-semibold text-slate-900 dark:text-white">{wd.method}</dd></div><div className="flex justify-between gap-3"><dt>Account</dt><dd className="m-0 break-all font-semibold text-slate-900 dark:text-white">{wd.acc}</dd></div></dl></>}</Modal>
 </main>}
