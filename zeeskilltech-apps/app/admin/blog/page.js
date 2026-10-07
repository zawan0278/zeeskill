'use client';
import {useEffect,useState} from 'react';import {sb} from '../../../lib/supabase';import ImageUpload from '../../../components/ImageUpload';
// Admin: write/edit/publish blog posts (body: separate paragraphs with a blank line). Enforced by DB (is_admin()).
const E={title:'',slug:'',summary:'',body:'',image_url:'',published:false};
export default function AdminBlog(){
 const [list,setList]=useState([]),[f,setF]=useState(E),[msg,setMsg]=useState('');
 async function load(){const {data}=await sb.from('posts').select('*').order('created_at',{ascending:false});setList(data||[])}
 useEffect(()=>{load()},[]);
 const set=k=>e=>setF({...f,[k]:e.target.type=='checkbox'?e.target.checked:e.target.value});
 async function save(e){e.preventDefault();
  const slug=(f.slug||f.title).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'post-'+Date.now();
  const row={title:f.title,slug,summary:f.summary,body:f.body,image_url:f.image_url,published:f.published};
  const {error}=f.id?await sb.from('posts').update(row).eq('id',f.id):await sb.from('posts').insert(row);
  setMsg(error?error.message:'Saved (public in about a minute)');if(!error)setF(E);load()}
 return <main><a href="/admin">← Admin</a><h1>Blog</h1><p>{msg}</p>
  <form className="card" onSubmit={save}><b>{f.id?'Edit post':'New post'}</b><input placeholder="Title" required value={f.title} onChange={set('title')}/>
   <input placeholder="URL slug (english, optional)" value={f.slug} onChange={set('slug')}/><input placeholder="Short summary" value={f.summary} onChange={set('summary')}/>
   <textarea rows={8} placeholder="Post body (blank line = new paragraph)" value={f.body} onChange={set('body')} style={{width:'100%',padding:'.7rem',borderRadius:'.7rem',border:'1px solid #CBD5E1',font:'inherit'}}/>
   <ImageUpload onDone={u=>setF({...f,image_url:u})} label="Upload cover image"/>{f.image_url&&<img src={f.image_url} alt="" style={{height:70,display:'block'}}/>}
   <label><input type="checkbox" checked={f.published} onChange={set('published')} style={{display:'inline',width:'auto'}}/> Published</label>
   <button>{f.id?'Update':'Create'}</button>{f.id&&<button type="button" className="sec" onClick={()=>setF(E)}>Cancel</button>}</form>
  {list.map(p=><div className="card" key={p.id}><b>{p.title}</b> <small>({p.published?'published':'draft'} · /blog/{p.slug})</small><br/>
   <button className="sec" onClick={()=>{setF(p);scrollTo(0,0)}}>Edit</button>
   <button onClick={()=>confirm('Delete this post?')&&sb.from('posts').delete().eq('id',p.id).then(load)}>Delete</button></div>)}</main>}
