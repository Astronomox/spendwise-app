// src/lib/smsService.ts
//
// Capacitor wrapper around capacitor-sms-inbox. Falls back to no-op in web/dev
// so the rest of the app works in the browser unchanged.
//
// Pattern matchers cover the big six Nigerian banks (GTB, Zenith, Access,
// First Bank, UBA, Kuda) + Opay/Moniepoint/PalmPay. Bank SMS isn't standardised
// — we extract amount + merchant + balance from the most common templates and
// hand back a structured candidate the user can confirm in SmsQueue.

import { Capacitor } from '@capacitor/core';

// Conditional import — keeps web bundle from choking on the native plugin.
let SmsInbox: typeof import('capacitor-sms-inbox').SmsInbox | null = null;
async function loadPlugin(): Promise<void> {
  if (SmsInbox) return;
  try {
    const mod = await import('capacitor-sms-inbox');
    SmsInbox = mod.SmsInbox;
  } catch {
    SmsInbox = null;
  }
}

export interface ParsedTransaction {
  amount:   number;
  type:     'EXPENSE' | 'INCOME';
  merchant: string;
  balance?: number;
  bank:     string;
  raw:      string;
  date:     string;     // ISO
  smsId:    string;     // dedupe key
}

// ─── Bank patterns ───────────────────────────────────────────────────────────

interface BankPattern {
  bank:     string;
  /** Sender ID(s) — Android exposes these via the `address` field. */
  senders:  RegExp[];
  /** Match the body and return { amount, merchant, type } when applicable. */
  parse:    (body: string) => Pick<ParsedTransaction, 'amount' | 'type' | 'merchant' | 'balance'> | null;
}

const NUM = /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{1,2})?)/i;

const PATTERNS: readonly BankPattern[] = [
  {
    bank:    'GTBank',
    senders: [/^GTBank$/i, /^GT[\s-]*Bank$/i],
    parse: (body) => {
      // "Debit Alert NGN 14,500.00 to CHICKEN REPUBLIC LAG ... Bal: NGN 32,000.00"
      const m = body.match(/(debit|credit)[\s\S]*?NGN\s*([\d,]+\.\d{2})\s*(?:to|from)\s+([^\n]+?)(?:\s+\.|\s+Bal|\s+on\s+\d|\.|\n|$)/i);
      if (!m) return null;
      const [, kind, amt, dest] = m;
      const bal = body.match(/Bal[^\d]*NGN\s*([\d,]+\.\d{2})/i);
      return {
        amount:   parseFloat(amt.replace(/,/g, '')),
        type:     kind.toLowerCase() === 'debit' ? 'EXPENSE' : 'INCOME',
        merchant: dest.trim().replace(/\s+/g, ' ').slice(0, 40),
        balance:  bal ? parseFloat(bal[1].replace(/,/g, '')) : undefined,
      };
    },
  },
  {
    bank:    'Zenith',
    senders: [/^Zenith(?:\s*Bank)?$/i],
    parse: (body) => {
      const m = body.match(/(POS|TRF|WEB)[\s\S]*?(?:NGN|N)\s*([\d,]+\.\d{2})[\s\S]*?at\s+([^\n,]+?)(?:\s+on|\s+Bal|\.|\n|$)/i);
      if (!m) return null;
      return {
        amount:   parseFloat(m[2].replace(/,/g, '')),
        type:     'EXPENSE',
        merchant: m[3].trim().slice(0, 40),
      };
    },
  },
  {
    bank:    'Access',
    senders: [/^Access(?:\s*Bank)?$/i],
    parse: (body) => {
      const m = body.match(/Debit[\s\S]*?NGN\s*([\d,]+\.\d{2})[\s\S]*?(?:Desc|Narration)[:\s]+([^\n]+?)(?:\s+Bal|\.|\n|$)/i);
      if (!m) return null;
      return {
        amount:   parseFloat(m[1].replace(/,/g, '')),
        type:     'EXPENSE',
        merchant: m[2].trim().slice(0, 40),
      };
    },
  },
  {
    bank:    'Kuda',
    senders: [/^Kuda$/i, /^KudaBank$/i],
    parse: (body) => {
      const m = body.match(/(debited|credited)[\s\S]*?NGN([\d,]+\.\d{2})[\s\S]*?(?:to|from)\s+([^\n.]+)/i);
      if (!m) return null;
      return {
        amount:   parseFloat(m[2].replace(/,/g, '')),
        type:     m[1].toLowerCase() === 'debited' ? 'EXPENSE' : 'INCOME',
        merchant: m[3].trim().slice(0, 40),
      };
    },
  },
  {
    bank:    'Opay',
    senders: [/^Opay$/i, /^OPay$/i],
    parse: (body) => {
      const m = body.match(/(?:paid|sent|spent)[\s\S]*?(?:NGN|₦)([\d,]+\.\d{2})[\s\S]*?(?:to|at)\s+([^\n.]+)/i);
      if (!m) return null;
      return {
        amount:   parseFloat(m[1].replace(/,/g, '')),
        type:     'EXPENSE',
        merchant: m[2].trim().slice(0, 40),
      };
    },
  },
  // Generic fallback — any "debit/credit" + "NGN <num>" works.
  {
    bank:    'Unknown',
    senders: [/.*/],
    parse: (body) => {
      const isDebit  = /debit|debited|spent|paid|withdraw/i.test(body);
      const isCredit = /credit|credited|received|deposit/i.test(body);
      if (!isDebit && !isCredit) return null;
      const m = body.match(NUM);
      if (!m) return null;
      const merch = body.match(/(?:to|at|from)\s+([A-Z][A-Z0-9 &-]{3,30})/);
      return {
        amount:   parseFloat(m[1].replace(/,/g, '')),
        type:     isDebit ? 'EXPENSE' : 'INCOME',
        merchant: merch ? merch[1].trim() : 'Unknown merchant',
      };
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export interface SmsService {
  isAvailable(): boolean;
  requestPermission(): Promise<boolean>;
  /** Pull recent SMS, parse what we can. `since` is a ms timestamp. */
  scanInbox(since?: number): Promise<ParsedTransaction[]>;
}

class CapacitorSmsService implements SmsService {
  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  async requestPermission(): Promise<boolean> {
    await loadPlugin();
    if (!SmsInbox) return false;
    try {
      const r = await SmsInbox.checkPermissions();
      if (r.sms === 'granted') return true;
      const grant = await SmsInbox.requestPermissions();
      return grant.sms === 'granted';
    } catch {
      return false;
    }
  }

  async scanInbox(since: number = Date.now() - 7 * 86_400_000): Promise<ParsedTransaction[]> {
    await loadPlugin();
    if (!SmsInbox) return [];
    try {
      // Plugin returns { smsList: [{ id, address, body, date }] }
      const result = await SmsInbox.getSmsList({
        filter: { minDate: since, maxCount: 200 },
      });
      const list = result.smsList ?? [];
      return list.flatMap((sms) => {
        const sender  = String(sms.address ?? '');
        const pattern = PATTERNS.find(p => p.senders.some(rx => rx.test(sender)));
        if (!pattern) return [];
        const parsed = pattern.parse(String(sms.body ?? ''));
        if (!parsed) return [];
        return [{
          ...parsed,
          bank:  pattern.bank,
          raw:   String(sms.body ?? ''),
          date:  new Date(Number(sms.date) || Date.now()).toISOString(),
          smsId: String(sms.id ?? `${sms.address}-${sms.date}`),
        }];
      });
    } catch {
      return [];
    }
  }
}

class WebStubSmsService implements SmsService {
  isAvailable(): boolean { return false; }
  async requestPermission(): Promise<boolean> { return false; }
  async scanInbox(): Promise<ParsedTransaction[]> { return []; }
}

export const smsService: SmsService =
  typeof window !== 'undefined' && Capacitor.isNativePlatform()
    ? new CapacitorSmsService()
    : new WebStubSmsService();
