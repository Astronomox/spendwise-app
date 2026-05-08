// src/lib/syncQueue.ts
//
// Drains the IndexedDB queue when the network comes back. Hooks:
//   • onmount: register listeners once.
//   • online event: trigger drain.
//   • setInterval fallback (60s) for tabs that miss the event.
//
// Each kind maps to an api.ts call. Add new kinds here as you wire them.

import { listQueue, dequeue, bumpAttempt, type QueueRow } from './idb';
import { transactions } from './api';

let draining = false;

async function processRow(row: QueueRow): Promise<void> {
  switch (row.kind) {
    case 'create-transaction': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await transactions.create(row.payload as any);
      return;
    }
    // Goal mutations land on the BE once endpoints exist. Until then we keep
    // them in the queue so nothing is lost — `lastError` will reflect 404.
    case 'create-goal':
    case 'update-goal':
    case 'delete-goal':
    case 'create-deposit':
      throw new Error('Endpoint not ready');
    default:
      throw new Error(`Unknown queue kind: ${row.kind}`);
  }
}

export async function drainQueue(): Promise<{ flushed: number; failed: number }> {
  if (draining) return { flushed: 0, failed: 0 };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { flushed: 0, failed: 0 };
  draining = true;
  let flushed = 0, failed = 0;
  try {
    const rows = await listQueue();
    for (const row of rows) {
      // Exponential give-up: after 8 attempts, leave it for the user to retry
      // manually from SmsQueue.
      if (row.attempts >= 8) continue;
      try {
        await processRow(row);
        await dequeue(row.id);
        flushed += 1;
      } catch (e) {
        await bumpAttempt(row.id, e instanceof Error ? e.message : 'unknown');
        failed += 1;
      }
    }
  } finally {
    draining = false;
  }
  return { flushed, failed };
}

let timerId: number | null = null;

export function startSyncWorker(): void {
  if (typeof window === 'undefined') return;
  if (timerId !== null) return;
  window.addEventListener('online',  () => { void drainQueue(); });
  window.addEventListener('focus',   () => { void drainQueue(); });
  timerId = window.setInterval(() => { void drainQueue(); }, 60_000);
  // Initial pass.
  void drainQueue();
}

export function stopSyncWorker(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}
