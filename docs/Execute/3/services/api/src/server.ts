import 'dotenv/config';
import express from 'express'; import cors from 'cors';
import { auth } from './middleware/auth.js'; import { rateLimit } from './middleware/rateLimit.js';

const app = express();
app.use(cors()); app.use(express.json()); app.use(rateLimit());

// Health
app.get('/health', (_,res)=>res.json({ ok:true }));

// Load vertical routers dynamically
async function loadVerticalRouters(){
  const { cleaningRouter } = await import('../../../packages/verticals/cleaning/apiRouter.js');
  app.use('/v1', auth(false), cleaningRouter());
}
loadVerticalRouters();

const port = Number(process.env.PORT||4000);
app.listen(port, ()=> console.log('API on :'+port));
