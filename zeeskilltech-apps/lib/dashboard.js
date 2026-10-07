// Shared helpers for the student area (no JSX).
export const MIN=500,MAX=50000;
export const METHODS=['JazzCash','SadaPay','Easypaisa','Bank Transfer'];
export const fmtDate=d=>new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});

// Earnings = sum of the student's commission rows, by the visitor's local calendar day.
// Today = since local midnight. 7 / 30 days = today plus the previous 6 / 29 days.
export function summarize(list){
 const n=new Date(),y=n.getFullYear(),m=n.getMonth(),d=n.getDate();
 const at=back=>new Date(y,m,d-back).getTime();
 const sum=from=>list.reduce((s,x)=>new Date(x.created_at).getTime()>=from?s+x.amount:s,0);
 return {today:sum(at(0)),d7:sum(at(6)),d30:sum(at(29)),total:list.reduce((s,x)=>s+x.amount,0)};
}

// Chart buckets: 1W = 7 days, 1M = 30 days, 6M / 1Y = months, All = months since first commission (max 24).
export function buckets(list,range){
 const n=new Date(),y=n.getFullYear(),m=n.getMonth(),d=n.getDate(),b=[];
 if(range=='1W'||range=='1M'){
  const N=range=='1W'?7:30;
  for(let i=N-1;i>=0;i--){const f=new Date(y,m,d-i),t=new Date(y,m,d-i+1);
   b.push({label:f.toLocaleDateString('en-PK',range=='1W'?{weekday:'short'}:{day:'numeric'}),from:f.getTime(),to:t.getTime()})}
 }else{
  let N=range=='6M'?6:12;
  if(range=='All'){
   const first=list.length?new Date(Math.min(...list.map(x=>new Date(x.created_at).getTime()))):n;
   N=Math.min(24,Math.max(1,(y-first.getFullYear())*12+m-first.getMonth()+1))}
  for(let i=N-1;i>=0;i--){const f=new Date(y,m-i,1),t=new Date(y,m-i+1,1);
   b.push({label:f.toLocaleDateString('en-PK',{month:'short'}),from:f.getTime(),to:t.getTime()})}
 }
 return b.map(x=>({label:x.label,amount:list.reduce((s,c)=>{const t=new Date(c.created_at).getTime();return t>=x.from&&t<x.to?s+c.amount:s},0)}));
}
