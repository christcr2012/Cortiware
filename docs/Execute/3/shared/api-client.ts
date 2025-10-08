// Shared API Client (browser/node-safe minimal)
export class Api {
  constructor(private base = process.env.NEXT_PUBLIC_API_BASE || process.env.VITE_API_BASE || process.env.API_BASE || 'http://localhost:4000', private token?: string){}
  setToken(t?: string){ this.token = t; }
  async req(path: string, init: RequestInit = {}){
    const headers: any = { 'Content-Type':'application/json', ...(init.headers||{}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const res = await fetch(`${this.base}${path}`, { ...init, headers });
    const txt = await res.text(); const data = txt ? JSON.parse(txt) : null;
    if (!res.ok) { if (res.status===402) console.warn('402', data); throw Object.assign(new Error('HTTP '+res.status), {status:res.status, data}); }
    return data;
  }
}
