'use client';
import {useEffect,useState} from 'react';import {sb} from '../../../lib/supabase';import ImageUpload from '../../../components/ImageUpload';
// Admin: create courses, add lessons (paste YouTube unlisted / Vimeo / .mp4 link), publish, delete. Enforced by DB (is_admin()).
export default function AdminCourses(){
 const [c,setC]=useState([]),[l,setL]=useState([]),[msg,setMsg]=useState('');
 async function load(){const a=await sb.from('courses').select('*').order('id'),b=await sb.from('lessons').select('*').order('position').order('id');setC(a.data||[]);setL(b.data||[])}
 useEffect(()=>{load()},[]);
 async function run(q){const {error}=await q;setMsg(error?error.message:'Saved');load()}
 const fd=e=>{e.preventDefault();return Object.fromEntries(new FormData(e.target))};
 return <main><a href="/dashboard">← Dashboard</a><h1>Manage Courses</h1><p>{msg}</p>
  <form className="card" onSubmit={e=>{const v=fd(e);e.target.reset();run(sb.from('courses').insert({title:v.title,subtitle:v.subtitle,min_plan:v.min_plan,published:v.published=='on'}))}}>
   <b>New course</b><input name="title" placeholder="Title" required/><input name="subtitle" placeholder="Subtitle"/>
   <select name="min_plan"><option value="basic">Basic and above</option><option value="standard">Standard and above</option><option value="pro">Pro only</option></select>
   <label><input type="checkbox" name="published" style={{display:'inline',width:'auto'}}/> Published</label><button>Add course</button></form>
  {c.map(x=><div className="card" key={x.id}><ImageUpload label="Course image" onDone={u=>run(sb.from('courses').update({image_url:u}).eq('id',x.id))}/>{x.image_url&&<img src={x.image_url} alt="" style={{height:60,display:'block'}}/>}<b>{x.title}</b> <small>({x.min_plan}+ · {x.published?'published':'draft'})</small><br/>
   <button className="sec" onClick={()=>run(sb.from('courses').update({published:!x.published}).eq('id',x.id))}>{x.published?'Unpublish':'Publish'}</button>
   <button onClick={()=>confirm('Delete course and its lessons?')&&run(sb.from('courses').delete().eq('id',x.id))}>Delete</button>
   <table><tbody>{l.filter(y=>y.course_id==x.id).map(y=><tr key={y.id}><td>{y.position}</td><td>{y.title}</td><td><a href="#" onClick={e=>{e.preventDefault();run(sb.from('lessons').delete().eq('id',y.id))}}>delete</a></td></tr>)}</tbody></table>
   <form onSubmit={e=>{const v=fd(e);e.target.reset();run(sb.from('lessons').insert({course_id:x.id,title:v.title,video_url:v.video_url,notes:v.notes,position:+v.position||0}))}}>
    <input name="title" placeholder="Lesson title" required/><input name="video_url" placeholder="YouTube / Vimeo / Google Drive / Bunny / .mp4 link" required/>
    <input name="notes" placeholder="Notes (optional)"/><input name="position" type="number" placeholder="Order (1,2,3...)"/><button>Add lesson</button></form></div>)}</main>}
