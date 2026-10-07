// "#4338CA" -> "67 56 202" (space-separated channels so Tailwind opacity like bg-pri/10 works)
export const hexToCh=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return null;const n=parseInt(m[1],16);return `${n>>16} ${(n>>8)&255} ${n&255}`};
