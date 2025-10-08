import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function auth(required = true){
  return (req:Request,res:Response,next:NextFunction)=>{
    const hdr = req.headers.authorization||'';
    const tok = hdr.startsWith('Bearer ') ? hdr.slice(7) : undefined;
    if (!tok){ if (required) return res.sendStatus(401); return next(); }
    try {
      const payload:any = jwt.verify(tok, process.env.JWT_SECRET||'dev');
      (req as any).tenant_id = payload.tid;
      (req as any).role = payload.role;
      // downstream (DB) can read: app.tenant_id header or similar
      res.setHeader('x-tenant-id', payload.tid);
      return next();
    } catch { if (required) return res.sendStatus(401); return next(); }
  }
}
