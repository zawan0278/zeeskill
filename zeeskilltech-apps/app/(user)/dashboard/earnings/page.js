'use client';
import {pkr} from '../../../../lib/content';
import {fmtDate,summarize} from '../../../../lib/dashboard';
import {useUser} from '../../../../components/UserData';
import {Empty,Stat} from '../../../../components/ui';
export default function Earnings(){
 const {d}=useUser(),e=summarize(d.c);
 return <main className="!max-w-6xl"><h1 className="!text-2xl">Earning Logs</h1>
  <div className="mb-5 grid gap-4 sm:grid-cols-2"><Stat icon="trend" label="Total Earnings" value={pkr(e.total)}/><Stat icon="wallet" label="Available balance" value={pkr(d.p.balance)}/></div>
  <section className="card"><h2 className="card-title !text-lg">All commissions</h2>{d.c.length==0?<Empty icon="coin" title="No commissions yet">Commissions appear here after your referrals’ payments are approved.</Empty>
   :<div className="table-wrap"><table><thead><tr><th>Date</th><th>Level</th><th>Amount</th></tr></thead><tbody>{d.c.map(x=><tr key={x.id}><td>{fmtDate(x.created_at)}</td><td>Level {x.level}</td><td className="font-semibold text-slate-900 dark:text-white">{pkr(x.amount)}</td></tr>)}</tbody></table></div>}</section></main>}
