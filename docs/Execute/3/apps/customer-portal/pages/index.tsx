import Link from 'next/link';
export default function Home(){ return (<main style={{padding:16,fontFamily:'system-ui'}}>
  <h1>Customer Portal</h1>
  <ul><li><Link href="/schedule">Schedule</Link></li><li><Link href="/invoices">Invoices</Link></li><li><Link href="/request">Request Service</Link></li></ul>
</main>); }