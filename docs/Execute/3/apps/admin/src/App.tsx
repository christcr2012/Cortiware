import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { registry } from '../../../packages/verticals/registry';

export default function App(){
  const [pack,setPack]=useState<any>(); const navigate = useNavigate();
  const verticalKey = 'cleaning'; // fetch from /me in real app
  useEffect(()=>{ registry[verticalKey]().then(p=>{ setPack(p); navigate('/'); }); },[]);
  if(!pack) return <div style={{padding:12}}>Loading vertical...</div>;
  return <div style={{fontFamily:'system-ui',padding:12}}>
    <nav style={{display:'flex', gap:12, marginBottom:12}}>
      {pack.meta.nav.map((n:any)=>(<Link key={n.path} to={n.path}>{n.label}</Link>))}
      <span style={{marginLeft:'auto',opacity:.6}}>Vertical: {pack.meta.key}</span>
    </nav>
    <Routes>
      {pack.routes.map((r:any)=>(<Route key={r.path} path={r.path} element={r.element}/>))}
      <Route path="*" element={<div>Not Found</div>}/>
    </Routes>
  </div>;
}
