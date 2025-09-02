import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

process.env.NODE_ENV = 'test'; // force test mode (e.g., in-memory fallback paths)

let ps: ReturnType<typeof spawn> | null = null;
let startedByUs = false;

async function isHealthy() {
  try {
    const r = await fetch('http://127.0.0.1:3001/healthz');
    return r.ok;
  } catch { return false; }
}

async function waitForHealth(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isHealthy()) return;
    await delay(250);
  }
  throw new Error('Server did not become healthy');
}

export default async function () {
  // If something is already running, reuse it
  if (await isHealthy()) {
    startedByUs = false;
    return () => {};
  }

  // Start fresh
  ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
  startedByUs = true;
  await waitForHealth();

  // Teardown only if we started it
  return async () => {
    if (ps && startedByUs) {
      ps.kill();
      ps = null;
    }
  };
}