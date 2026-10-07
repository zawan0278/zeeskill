'use client';
import {useEffect,useId,useRef} from 'react';
// Accessible confirm dialog built on the native <dialog> element (focus trap, Esc and backdrop handled by the browser).
export default function Modal({open,onClose,title,children,footer}){
 const ref=useRef(null),id=useId();
 useEffect(()=>{const d=ref.current;if(!d)return;if(open&&!d.open)d.showModal();if(!open&&d.open)d.close()},[open]);
 return <dialog ref={ref} className="modal" aria-labelledby={id} onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose()}}>
  <div className="p-6"><h3 id={id} className="!mt-0 text-lg">{title}</h3><div className="text-sm">{children}</div>
   {footer&&<div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}</div></dialog>}
