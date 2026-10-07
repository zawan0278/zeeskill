'use client';
import Icon from '../../../../components/Icon';
import {useUser} from '../../../../components/UserData';
export default function Faqs(){
 const {cfg}=useUser();
 return <main className="!max-w-3xl"><h1 className="!text-2xl">FAQ's</h1>
  <div className="space-y-3">{(cfg.faqs||[]).map(f=><details key={f[0]} className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
   <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white">{f[0]}<Icon n="chevron" size={18} className="flex-none text-pri transition group-open:rotate-180"/></summary>
   <p className="mb-0 mt-3 text-sm text-slate-600 dark:text-slate-400">{f[1]}</p></details>)}</div></main>}
