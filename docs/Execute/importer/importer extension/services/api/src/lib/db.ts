import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function withTenant<T>(tenant_id: string, fn: (q:(text:string,params?:any[])=>Promise<any>)=>Promise<T>){
  const client = await pool.connect();
  try {
    await client.query('SET LOCAL app.tenant_id = $1', [tenant_id]);
    const q = (text:string, params:any[]=[]) => client.query(text, params);
    return await fn(q);
  } finally {
    client.release();
  }
}
export async function query(text:string, params:any[]=[]){ const { rows } = await pool.query(text, params); return rows; }
