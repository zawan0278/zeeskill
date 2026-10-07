import Link from 'next/link';
import Icon from '../components/Icon';
export const metadata={title:'Page not found'};
export default function NotFound(){
 return <main className="text-center"><div className="mx-auto my-12 max-w-md">
  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-pri/10 text-pri"><Icon n="search" size={28}/></div>
  <h1>Page not found</h1><p className="text-slate-500">The page you are looking for does not exist or has been moved.</p>
  <div className="mt-6 flex justify-center gap-3"><Link className="btn" href="/">Go home</Link><Link className="btn out" href="/courses">Browse courses</Link></div></div></main>}
