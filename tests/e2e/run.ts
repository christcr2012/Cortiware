import { run as runSmoke } from './federation.smoke';

async function main() {
  await runSmoke();
}

main().catch((err) => { console.error(err); process.exit(1); });

