// src/lib/idb.ts
//
// Thin IndexedDB wrapper for the offline transaction queue. We avoid the `idb`
// npm package on purpose — the surface we need is small (one store, three
// methods) and the shipped runtime stays a few hundred bytes.
//
// Stores:
//   queue    — outbound mutations waiting for the network. Each row:
//                { id, kind, payload, createdAt, attempts, lastError? }
//   parsed   — SMS we've parsed but not yet confirmed. Acts as a dedupe set.

const DB_NAME    = 'spendwise';
const DB_VERSION = 1;

export type QueueKind =
  | 'create-transaction'
  | 'create-deposit'
  | 'create-goal'
  | 'update-goal'
  | 'delete-goal';

export interface QueueRow {
  id:        string;
  kind:      QueueKind;
  payload:   unknown;
  createdAt: number;
  attempts:  number;
  lastError?: string;
}

export interface ParsedSmsRow {
  smsId:     string;
  payload:   unknown;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue',  { keyPath: 'id'    });
      }
      if (!db.objectStoreNames.contains('parsed')) {
        db.createObjectStore('parsed', { keyPath: 'smsId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  store: 'queue' | 'parsed',
  mode:  IDBTransactionMode,
  fn:    (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    r.onsuccess = () => resolve(r.result as T);
    r.onerror   = () => reject(r.error);
  }));
}

// ─── Queue ───────────────────────────────────────────────────────────────────

export async function enqueue(kind: QueueKind, payload: unknown): Promise<QueueRow> {
  const row: QueueRow = {
    id:        `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    payload,
    createdAt: Date.now(),
    attempts:  0,
  };
  await tx('queue', 'readwrite', s => s.put(row));
  return row;
}

export async function listQueue(): Promise<QueueRow[]> {
  const rows = await tx<QueueRow[]>('queue', 'readonly', s => s.getAll() as IDBRequest<QueueRow[]>);
  return rows.sort((a, b) => a.createdAt - b.createdAt);
}

export async function dequeue(id: string): Promise<void> {
  await tx('queue', 'readwrite', s => s.delete(id));
}

export async function bumpAttempt(id: string, lastError: string): Promise<void> {
  const row = await tx<QueueRow | undefined>('queue', 'readonly', s => s.get(id) as IDBRequest<QueueRow | undefined>);
  if (!row) return;
  row.attempts += 1;
  row.lastError = lastError.slice(0, 240);
  await tx('queue', 'readwrite', s => s.put(row));
}

// ─── Parsed-SMS dedupe ───────────────────────────────────────────────────────

export async function rememberParsed(smsId: string, payload: unknown): Promise<void> {
  await tx('parsed', 'readwrite', s => s.put({ smsId, payload, createdAt: Date.now() }));
}

export async function hasParsed(smsId: string): Promise<boolean> {
  const r = await tx<ParsedSmsRow | undefined>('parsed', 'readonly', s => s.get(smsId) as IDBRequest<ParsedSmsRow | undefined>);
  return !!r;
}
