'use client';
import {usePathname} from 'next/navigation';
// The public navbar/footer are hidden inside the logged-in areas, which have their own sidebar layout.
const APP=['/dashboard','/courses','/admin'];
export default function Chrome({children}){
 const p=usePathname()||'';
 return APP.some(x=>p==x||p.startsWith(x+'/'))?null:children}
