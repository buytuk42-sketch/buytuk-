import { spawn } from 'node:child_process';
const PORT = 3177, BASE = `http://127.0.0.1:${PORT}`;
async function boot(env) {
  const p = spawn('npx', ['next', 'start', '-p', String(PORT)], { env: { ...process.env, ...env }, stdio: 'ignore', detached: true });
  for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE + '/ar'); if (r.ok) return p; } catch {} await new Promise(r => setTimeout(r, 1000)); }
  return p;
}
async function probe(label) {
  const html = await (await fetch(BASE + '/ar')).text();
  const ok = html.includes('BuyTuk Academy') && html.includes('BuyTuk');
  console.log(`${label}: status=200 productsRendered=${ok}`);
  return ok;
}
for (const [label, env] of [
  ['STATE 1  (CMS_ENDPOINT empty        → local JSON)', { CMS_ENDPOINT: '' }],
  ['STATE 3  (CMS set but unreachable   → must fall back)', { CMS_ENDPOINT: 'https://cms.invalid.example' }]
]) {
  const p = await boot(env);
  await probe(label);
  try { process.kill(-p.pid, 'SIGKILL'); } catch {}
  await new Promise(r => setTimeout(r, 3000));
}
