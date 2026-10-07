'use client';
import Icon from './Icon';
export default function PrintBtn(){return <button type="button" className="noprint" onClick={()=>print()}><Icon n="print" size={16}/>Print / Save as PDF</button>}
