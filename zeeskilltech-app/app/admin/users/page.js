'use client';
import {useEffect,useState} from 'react';import {sb} from '../../../lib/supabase';
// Admin: list/search students (read-only). Enforced by DB (is_admin()).
export default function Users(){const [u,setU]=useState([]),[q,setQ]=useState('');
 useEffect(()=>{sb.from('profiles').select('full_name,phone,plan,balance,referral_code,created_at').order('created_at',{ascending:false}).then(({data})=>setU(data||[]))},[]);
 const f=u.filter(x=>`${x.full_name} ${x.phone} ${x.referral_code}`.toLowerCase().includes(q.toLowerCase()));
 return <main><a href="/admin">← Admin</a><h1>Students ({u.length})</h1><input placeholder="Search name / phone / code" onChange={e=>setQ(e.target.value)}/>
  <div className="card" style={{overflowX:'auto'}}><table><thead><tr><th>Name</th><th>Phone</th><th>Plan</th><th>Balance</th><th>Joined</th></tr></thead>
   <tbody>{f.map(x=><tr key={x.referral_code}><td>{x.full_name}</td><td>{x.phone}</td><td>{x.plan||'-'}</td><td>PKR {x.balance}</td><td>{x.created_at.slice(0,10)}</td></tr>)}</tbody></table></div></main>}
