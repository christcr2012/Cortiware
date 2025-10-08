export function maskRow(row:Record<string,any>){
  const out:Record<string,any>={};
  for(const [k,v] of Object.entries(row)){
    if(v==null){out[k]=v;continue;}
    const s=String(v);
    if(/@/.test(s)) out[k]=s.replace(/(^.).*(@.*$)/,'$1***$2');
    else if (s.replace(/\D/g,'').length>=8) out[k]='***'+s.slice(-4);
    else if(/name|first|last|contact/i.test(k)) out[k]='<NAME>';
    else out[k]=s.slice(0,16);
  }
  return out;
}