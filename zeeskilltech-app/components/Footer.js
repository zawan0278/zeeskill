import Link from 'next/link';
import Newsletter from './Newsletter';
import Icon from './Icon';
const L='text-slate-400 hover:text-white hover:no-underline';
export default function Footer({c:C}){
 return <footer className="mt-20 bg-slate-950 text-sm text-slate-400">
  <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
   <div>
    <div className="flex items-center gap-2 font-head text-lg font-bold text-white"><span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-pri text-sm">{(C.brand||'Z')[0]}</span>{C.brand}</div>
    <p className="mt-3">{C.tag}</p>
    <ul className="m-0 list-none space-y-2 p-0">
     <li className="flex items-start gap-2"><Icon n="pin" size={16} className="mt-0.5 flex-none"/>{C.addr}</li>
     <li className="flex items-start gap-2"><Icon n="mail" size={16} className="mt-0.5 flex-none"/><a className={L} href={`mailto:${C.email}`}>{C.email}</a></li>
     <li className="flex items-start gap-2"><Icon n="phone" size={16} className="mt-0.5 flex-none"/><a className={L} href={`tel:${C.phone.replace(/\s/g,'')}`}>{C.phone}</a></li></ul></div>
   <div><h4 className="mb-3 text-sm uppercase tracking-wider !text-white">Legal</h4><ul className="m-0 list-none space-y-2 p-0">{C.legal.map(l=><li key={l[0]}><Link className={L} href={`/legal/${l[0]}`}>{l[1]}</Link></li>)}</ul></div>
   <div><h4 className="mb-3 text-sm uppercase tracking-wider !text-white">Company</h4><ul className="m-0 list-none space-y-2 p-0">
    <li><Link className={L} href="/about">About</Link></li><li><Link className={L} href="/courses">Courses</Link></li><li><Link className={L} href="/blog">Blog</Link></li><li><Link className={L} href="/contact">Contact</Link></li><li><Link className={L} href="/#faq">FAQs</Link></li></ul></div>
   <div><h4 className="mb-3 text-sm uppercase tracking-wider !text-white">Newsletter</h4><Newsletter/></div></div>
  <p className="m-0 border-t border-slate-800 py-5 text-center text-xs">© {new Date().getFullYear()} {C.brand}. All rights reserved.</p></footer>}
