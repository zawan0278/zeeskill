import {getContent} from '../../lib/server';
export const revalidate=60;export const metadata={title:'About'};
export default async function About(){const C=await getContent();
 return <main><h1>About {C.brand}</h1><div className="card"><p>{C.brand} helps Pakistani students, housewives and job-seekers learn digital skills and earn from home. Hamara maqsad simple hai: real skills, honest income.</p>
 <p>Our partner program pays commission only on verified plan purchases, with transparent percentages.</p></div>
 <div className="card"><b>{C.founder.n} – Founder</b><p>{C.founder.bio}</p></div>
 <div className="cols">{C.team.map(t=><div className="card" key={t[0]}><b>{t[0]}</b><div>{t[1]}</div></div>)}</div></main>}
