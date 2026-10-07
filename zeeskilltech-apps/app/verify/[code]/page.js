import Link from 'next/link';
import {pub,getContent} from '../../../lib/server';
import PrintBtn from '../../../components/PrintBtn';
import Icon from '../../../components/Icon';
export const dynamic='force-dynamic';
export const metadata={title:'Certificate verification',robots:{index:false}};
// Public, shareable certificate + verification page.
export default async function Verify({params}){
 const C=await getContent();const code=String(params.code||'').slice(0,20);
 const {data}=await pub.rpc('verify_certificate',{c:code});const r=data?.[0];
 if(!r)return <main className="!max-w-xl"><div className="card text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-600"><Icon n="alert" size={26}/></div>
  <h1 className="!text-2xl">Certificate not found</h1><p className="text-slate-500">We could not find a certificate with this code. Please check the code and try again.</p><Link className="btn" href="/">Go home</Link></div></main>;
 return <main className="!max-w-3xl">
  <div className="cert"><div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-pri/10 text-pri"><Icon n="award" size={32}/></div>
   <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{C.brand}</p>
   <h2 className="!mb-4">Certificate of Completion</h2><p>This is to certify that</p>
   <h1 className="!text-3xl text-pri dark:!text-emerald-300 md:!text-4xl" style={{color:'rgb(var(--pri))'}}>{r.student}</h1>
   <p>has successfully completed the course</p><h2 className="!text-xl">{r.course}</h2>
   <p className="text-sm text-slate-500">Issued on {String(r.issued).slice(0,10)}</p>
   <p className="mb-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Icon n="shield" size={14}/>Verified authentic · ID {code.toUpperCase()}</p></div>
  <div className="mt-4 text-center"><PrintBtn/></div></main>}
