'use client';
import Icon from '../../../../components/Icon';
import {useUser} from '../../../../components/UserData';
import {Empty} from '../../../../components/ui';
// Community links come from Admin > Website content > social. Placeholder "#" links are not shown.
export default function Community(){
 const {cfg}=useUser(),links=(cfg.social||[]).filter(s=>/^https?:\/\//.test(s[2]));
 return <main className="!max-w-6xl"><h1 className="!text-2xl">Community Links</h1>
  {links.length==0?<div className="card"><Empty icon="link" title="No community links yet">Links will appear here once they are added by the admin.</Empty></div>
  :<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{links.map(s=><a key={s[0]} href={s[2]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md hover:no-underline dark:bg-slate-900 dark:ring-slate-800">
   <span className="grid h-12 w-12 place-items-center rounded-xl bg-pri/10 text-pri dark:text-emerald-300"><Icon n="link" size={22}/></span><b className="text-slate-900 dark:text-white">{s[0]}</b></a>)}</div>}</main>}
