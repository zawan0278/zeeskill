'use client';
import {useEffect} from 'react';
import Icon from '../components/Icon';
export default function Error({error,reset}){
 useEffect(()=>{console.error(error)},[error]);
 return <main className="text-center"><div className="mx-auto my-12 max-w-md">
  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-600"><Icon n="alert" size={28}/></div>
  <h1>Something went wrong</h1><p className="text-slate-500">An unexpected error occurred. Please try again. If it keeps happening, contact support.</p>
  <button onClick={()=>reset()} className="mt-4">Try again</button></div></main>}
