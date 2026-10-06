import Icon from './Icon';
// Shared UI building blocks. NOTE: Tailwind only keeps classes it can find as literal strings, so every
// variant below is written out in full (never build class names with template strings).

const BADGE={success:'badge badge-success',warn:'badge badge-warn',danger:'badge badge-danger',info:'badge badge-info',muted:'badge badge-muted'};
export const Badge=({tone='muted',children})=><span className={BADGE[tone]||BADGE.muted}>{children}</span>;

const STATUS={approved:['success','Approved'],paid:['success','Paid'],pending:['warn','Pending'],rejected:['danger','Rejected']};
export const StatusBadge=({s})=>{const [t,l]=STATUS[s]||['muted',s||'-'];return <Badge tone={t}>{l}</Badge>};

const ALERT={info:'alert alert-info',success:'alert alert-success',warn:'alert alert-warn',danger:'alert alert-danger'};
const ALERT_ICON={info:'info',success:'ok',warn:'alert',danger:'alert'};
export function Alert({tone='info',title,children,onClose,className=''}){
 return <div role={tone=='danger'?'alert':'status'} className={`${ALERT[tone]||ALERT.info} ${className}`}>
  <Icon n={ALERT_ICON[tone]||'info'} size={18} className="mt-0.5 flex-none"/>
  <div className="min-w-0 flex-1">{title&&<b className="block">{title}</b>}{children}</div>
  {onClose&&<button type="button" onClick={onClose} aria-label="Dismiss message" className="btn-icon !h-6 !w-6 !bg-transparent"><Icon n="x" size={14}/></button>}
 </div>}

export function Avatar({src,name='',size=64,className=''}){
 const ini=name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
 const st={width:size,height:size};
 return src
  ?<img src={src} alt="" width={size} height={size} style={st} className={`flex-none rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`}/>
  :<span aria-hidden="true" style={{...st,fontSize:Math.round(size/2.5)}} className={`grid flex-none place-items-center rounded-full bg-pri font-head font-bold text-white ring-2 ring-white dark:ring-slate-800 ${className}`}>{ini}</span>}

const TONE={pri:'bg-pri/10 text-pri dark:text-indigo-300',green:'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',amber:'bg-amber-500/10 text-amber-600 dark:text-amber-400',sky:'bg-sky-500/10 text-sky-600 dark:text-sky-400'};
export const Stat=({icon,label,value,hint,tone='pri'})=>
 <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800 sm:p-5">
  <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${TONE[tone]||TONE.pri}`}><Icon n={icon} size={20}/></div>
  <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
  <div className="mt-0.5 break-words font-head text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{value}</div>
  {hint&&<div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
 </div>;

export const Skeleton=({className=''})=><div className={`skeleton ${className}`} aria-hidden="true"/>;

export const Empty=({icon='info',title,children,action})=>
 <div className="flex flex-col items-center px-4 py-8 text-center">
  <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Icon n={icon} size={22}/></div>
  <b className="text-slate-900 dark:text-white">{title}</b>
  {children&&<p className="mb-0 mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{children}</p>}
  {action&&<div className="mt-4">{action}</div>}
 </div>;

export const Field=({label,hint,error,children})=>
 <label className="field"><span className="label">{label}</span>{children}{hint&&<span className="hint">{hint}</span>}{error&&<span role="alert" className="field-error">{error}</span>}</label>;
