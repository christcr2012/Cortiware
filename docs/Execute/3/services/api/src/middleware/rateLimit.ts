import { RateLimiterRedis } from 'rate-limiter-flexible'; import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL||'redis://127.0.0.1:6379');
const limiter = new RateLimiterRedis({ storeClient: redis, points: 100, duration: 60, keyPrefix: 'rl' });
export function rateLimit(){
  return async (req:any,res:any,next:any)=>{
    try { await limiter.consume(req.ip); next(); }
    catch { res.status(429).json({ error:'RATE_LIMITED' }); }
  };
}
