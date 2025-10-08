// apps/provider-portal/roofing-takeoff/Takeoff.tsx
import React, { useRef, useState } from "react";
type Pt = {x:number;y:number};
function area(poly:Pt[]){ let a=0; for(let i=0;i<poly.length;i++){ const j=(i+1)%poly.length; a += (poly[i].x*poly[j].y - poly[j].x*poly[i].y);} return Math.abs(a/2); }
export default function Takeoff(){
  const [poly, setPoly] = useState<Pt[]>([]);
  function add(e:any){ const rect=e.target.getBoundingClientRect(); setPoly([...poly,{x:e.clientX-rect.left,y:e.clientY-rect.top}]); }
  function reset(){ setPoly([]); }
  const sqft = Math.round(area(poly)/144); // px->ft placeholder
  const waste = Math.round(sqft*0.1);
  return (<div className="p-4">
    <h1 className="font-bold">Roofing Takeoff (prototype)</h1>
    <div onClick={add} style={{width:600,height:400,border:"1px solid #aaa",position:"relative"}}>
      {poly.map((p,i)=>(<div key={i} style={{position:"absolute",left:p.x-3,top:p.y-3,width:6,height:6,background:"#333",borderRadius:3}}/>))}
    </div>
    <div className="mt-2 text-sm">Area (est): {sqft} sqft · Waste (10%): {waste} sqft</div>
    <button onClick={reset} className="px-3 py-1 border rounded mt-2">Reset</button>
  </div>);
}
