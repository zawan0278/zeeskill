'use client';
import {fmtDate} from '../../../../lib/dashboard';
import Icon from '../../../../components/Icon';
import {useUser} from '../../../../components/UserData';
import {Badge,Empty,Stat} from '../../../../components/ui';
export default function Referrals(){
 const {d,flash}=useUser(),link=`${location.origin}/auth?ref=${d.p.referral_code}`,l1=d.rf.filter(x=>x.level==1).length;
 async function copy(){try{await navigator.clipboard.writeText(link);flash('success','Referral link copied.')}catch{flash('danger','Could not copy automatically.')}}
 return <main className="!max-w-6xl"><h1 className="!text-2xl">My Referrals</h1>
  <div className="mb-5 grid gap-4 sm:grid-cols-3"><Stat icon="users" label="Total referrals" value={d.rf.length}/><Stat icon="users" tone="green" label="Level 1" value={l1}/><Stat icon="users" tone="amber" label="Level 2" value={d.rf.length-l1}/></div>
  <section className="mb-4 rounded-2xl border-2 border-dashed border-pri/70 bg-white p-5 dark:bg-slate-900"><h2 className="!mb-1 text-lg">Your Referral Link</h2>
   <label htmlFor="rl" className="sr-only">Referral link</label><input id="rl" readOnly value={link} onFocus={e=>e.target.select()}/><button type="button" onClick={copy} className="btn mt-2"><Icon n="copy" size={16}/>Copy link</button></section>
  <section className="card"><h2 className="card-title !text-lg">Your team</h2>{d.rf.length==0?<Empty icon="users" title="No referrals yet">Share your referral link to start building your team.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Level</th><th>Name</th><th>Plan</th><th>Joined</th></tr></thead><tbody>{d.rf.map((x,i)=><tr key={i}><td>Level {x.level}</td><td>{x.name||'-'}</td><td>{x.plan?<Badge tone="success">{x.plan}</Badge>:<Badge>Not joined yet</Badge>}</td><td>{x.joined?fmtDate(x.joined):'-'}</td></tr>)}</tbody></table></div>}</section></main>}
