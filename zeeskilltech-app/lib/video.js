// Turns a YouTube / Vimeo / Google Drive / Bunny Stream / direct .mp4 link into an embeddable player.
export function embed(url=''){
 let d=url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
 if(d)return {type:'iframe',src:`https://drive.google.com/file/d/${d[1]}/preview`};
 if(/^https:\/\/iframe\.mediadelivery\.net\/embed\//.test(url))return {type:'iframe',src:url};
 let m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
 if(m)return {type:'iframe',src:`https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1`};
 m=url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
 if(m)return {type:'iframe',src:`https://player.vimeo.com/video/${m[1]}${m[2]?`?h=${m[2]}`:''}`};
 return {type:'video',src:/^https:\/\//.test(url)?url:''};
}
export function Player({url,title='Lesson video'}){
 const v=embed(url);
 return <div className="overflow-hidden rounded-2xl bg-black shadow-lg" style={{aspectRatio:'16/9'}}>
  {!v.src?<div className="grid h-full place-items-center p-6 text-center text-sm text-slate-300">This lesson has no valid video link yet.</div>
  :v.type=='iframe'
   ?<iframe src={v.src} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>
   :<video src={v.src} controls playsInline preload="metadata" controlsList="nodownload" className="h-full w-full"/>}</div>}
