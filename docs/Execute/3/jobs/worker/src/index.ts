import 'dotenv/config'; import { Queue, Worker } from 'bullmq'; import Redis from 'ioredis';
const connection = new Redis(process.env.REDIS_URL||'redis://127.0.0.1:6379');

export const permitQueue = new Queue('permits', { connection });
new Worker('permits', async job => {
  console.log('Fetch permits for', job.data.jurisdiction);
  // TODO: scrape/parse → normalize → push to API /cleaning/leads
}, { connection });

console.log('Worker running. Enqueue example: permitQueue.add("fcgov", { jurisdiction: "Fort Collins" })');
