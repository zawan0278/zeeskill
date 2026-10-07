'use client';
import {useEffect,useState} from 'react';
import Icon from './Icon';
// WhatsApp button + back-to-top
export default function Floaters({wa}){
 const [s,setS]=useState(false);
 useEffect(()=>{const f=()=>setS(scrollY>500);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
 return <div className="noprint fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
  {s&&<button type="button" aria-label="Back to top" onClick={()=>scrollTo({top:0,behavior:'smooth'})} className="btn-icon !m-0 !h-11 !w-11 !bg-white shadow-lg ring-1 ring-slate-200 dark:!bg-slate-800 dark:ring-slate-700"><Icon n="up" size={18}/></button>}
  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition hover:scale-105 hover:no-underline dark:text-white"><Icon n="chat" size={24}/></a>
 </div>}
