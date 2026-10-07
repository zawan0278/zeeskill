import {Skeleton} from '../components/ui';
export default function Loading(){
 return <main aria-busy="true" aria-label="Loading"><Skeleton className="mb-4 h-9 w-1/2"/><Skeleton className="mb-3 h-4 w-full"/><Skeleton className="mb-3 h-4 w-5/6"/><Skeleton className="h-48 w-full"/></main>}
