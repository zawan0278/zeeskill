import './globals.css';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Floaters from '../components/Floaters';
import Chrome from '../components/Chrome';
import {getContent} from '../lib/server';
import {hexToCh} from '../lib/theme';

export const revalidate=60;
export const viewport={themeColor:[{media:'(prefers-color-scheme: light)',color:'#ffffff'},{media:'(prefers-color-scheme: dark)',color:'#020617'}]};
export async function generateMetadata(){const C=await getContent();
 return {title:{default:`${C.brand} – ${C.tag}`,template:`%s | ${C.brand}`},description:C.desc,openGraph:{title:`${C.brand} – ${C.tag}`,description:C.desc}}}

// Runs before first paint so dark-mode visitors never see a white flash.
const themeScript=`try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({children}){
 const C=await getContent();
 const vars={'--pri':hexToCh(C.theme?.pri)||'8 128 90','--acc':hexToCh(C.theme?.acc)||'245 158 11'};
 return <html lang="en" style={vars} suppressHydrationWarning>
  <head>
   <script dangerouslySetInnerHTML={{__html:themeScript}}/>
   <link rel="preconnect" href="https://fonts.googleapis.com"/>
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"/>
  </head>
  <body>
   <a href="#content" className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
   <Chrome><Nav brand={C.brand} plans={C.plans}/></Chrome>
   <div id="content">{children}</div>
   <Chrome><Footer c={C}/></Chrome>
   <Floaters wa={C.wa}/>
  </body></html>}
