// src/hooks/useSmsScan.ts
//
// Triggers a native SMS scan and surfaces parsed candidates for SmsQueue.
// On web/dev the service no-ops, so this hook returns an empty list and
// `available: false` — the page can render its existing "all caught up" state.

import { useCallback, useEffect, useState } from 'react';
import { smsService, type ParsedTransaction } from '@/lib/smsService';
import { hasParsed, rememberParsed } from '@/lib/idb';
import { useToastStore } from '@/components/ui/Toast';

export interface UseSmsScanResult {
  available:   boolean;
  scanning:    boolean;
  candidates:  ParsedTransaction[];
  scan:        () => Promise<void>;
  dismiss:     (smsId: string) => void;
}

const SCAN_KEY = 'spendwise:last-scan';

export function useSmsScan(): UseSmsScanResult {
  const [candidates, setCandidates] = useState<ParsedTransaction[]>([]);
  const [scanning,   setScanning]   = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const available = smsService.isAvailable();

  const scan = useCallback(async () => {
    if (!available) return;
    setScanning(true);
    try {
      const granted = await smsService.requestPermission();
      if (!granted) {
        addToast('SMS permission denied. Enable it in Settings to auto-log.', 'error');
        return;
      }
      const since = Number(localStorage.getItem(SCAN_KEY)) || (Date.now() - 7 * 86_400_000);
      const found = await smsService.scanInbox(since);

      // Deduplicate via IDB so we don't re-surface the same SMS each scan.
      const fresh: ParsedTransaction[] = [];
      for (const t of found) {
        if (await hasParsed(t.smsId)) continue;
        await rememberParsed(t.smsId, t);
        fresh.push(t);
      }
      setCandidates((prev) => [...fresh, ...prev]);
      localStorage.setItem(SCAN_KEY, String(Date.now()));
      if (fresh.length > 0) addToast(`${fresh.length} new transaction${fresh.length > 1 ? 's' : ''} found`, 'success');
      else addToast("No new transactions in your SMS inbox.", 'info');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'SMS scan failed', 'error');
    } finally {
      setScanning(false);
    }
  }, [available, addToast]);

  // Auto-scan on mount when native (no-op on web)
  useEffect(() => {
    if (available) void scan();
  }, [available, scan]);

  const dismiss = useCallback((smsId: string) => {
    setCandidates((prev) => prev.filter((c) => c.smsId !== smsId));
  }, []);

  return { available, scanning, candidates, scan, dismiss };
}
