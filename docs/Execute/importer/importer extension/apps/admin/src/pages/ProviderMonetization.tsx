import React, { useEffect, useState } from 'react'; import { Api } from '../../../shared/api-client';
const api = new Api(import.meta.env.VITE_API_BASE || 'http://localhost:4000/v1', localStorage.getItem('token')||undefined);
export default function ProviderMonetization(){
  const [p,setP]=useState<any>({light_cents:99,standard_cents:299,complex_cents:499});
  useEffect(()=>{ (async()=>{ try{ setP(await api.req('/provider/import/pricing')); }catch(e){} })(); },[]);
  async function save(){ await api.req('/provider/import/pricing',{method:'POST',body:JSON.stringify(p)}); alert('Saved'); }
  return <div><h1>Provider · Monetization</h1>
    <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:8,width:360}}>
      <label>Light (¢)</label><input value={p.light_cents} onChange={e=>setP({...p,light_cents:Number(e.target.value)||0})}/>
      <label>Standard (¢)</label><input value={p.standard_cents} onChange={e=>setP({...p,standard_cents:Number(e.target.value)||0})}/>
      <label>Complex (¢)</label><input value={p.complex_cents} onChange={e=>setP({...p,complex_cents:Number(e.target.value)||0})}/>
    </div>
    <button onClick={save}>Save</button></div>;
}