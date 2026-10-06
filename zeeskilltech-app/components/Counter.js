'use client';
import {useEffect,useRef,useState} from 'react';
export default function Counter({to}){const r=useRef(),[n,setN]=useState(0);
 useEffect(()=>{const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();const t0=performance.now();
  const f=t=>{const k=Math.min((t-t0)/1500,1);setN(Math.floor(to*k));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
  io.observe(r.current);return()=>io.disconnect()},[to]);
 return <span ref={r}>{n.toLocaleString('en-PK')}</span>}
