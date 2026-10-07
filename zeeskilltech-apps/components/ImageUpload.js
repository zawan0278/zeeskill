'use client';
import {useState} from 'react';import {sb} from '../lib/supabase';
// Admin-only (enforced by storage policy). Uploads to the public `media` bucket and returns the URL.
export default function ImageUpload({onDone,label='Upload image'}){const [b,setB]=useState(false);
 async function pick(e){const f=e.target.files[0];if(!f)return;if(f.size>3e6){alert('Max 3 MB');return}setB(true);
  const path=`${Date.now()}-${f.name.replace(/[^\w.-]/g,'_')}`;const {error}=await sb.storage.from('media').upload(path,f);setB(false);
  if(error)return alert(error.message);onDone(sb.storage.from('media').getPublicUrl(path).data.publicUrl)}
 return <label className="btn out" style={{fontSize:'.8rem',padding:'.3rem .7rem',cursor:'pointer',whiteSpace:'nowrap'}}>{b?'Uploading...':label}<input type="file" accept="image/*" style={{display:'none'}} onChange={pick}/></label>}
