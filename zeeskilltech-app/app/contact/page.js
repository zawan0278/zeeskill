import {getContent} from '../../lib/server';import ContactForm from '../../components/ContactForm';
export const revalidate=60;export const metadata={title:'Contact'};
export default async function Contact(){const C=await getContent();
 return <main><h1>Contact Us</h1><div className="cols"><ContactForm/><div className="card"><b>{C.brand}</b><p>📍 {C.addr}<br/>✉️ {C.email}<br/>📞 {C.phone}</p>
  <a className="btn alt" href={`https://wa.me/${C.wa}`}>Chat on WhatsApp</a></div></div>{C.map&&<iframe src={C.map} title="Map" loading="lazy" style={{width:'100%',height:300,border:0,borderRadius:'1rem',marginTop:'1rem'}}/>}</main>}
