// src/types/transactions.ts

export type TransactionDirection = 'debit' | 'credit';
export type TransactionSource   = 'manual' | 'sms';
export type TransactionStatus   = 'confirmed' | 'pending';

export interface Transaction {
  /** Unique identifier */
  id:          string;
  /** Bank / merchant name, null when not parsed from SMS */
  merchant:    string | null;
  /** Must match a CATEGORIES id */
  category:    string;
  amount:      number;
  direction:   TransactionDirection;
  /** ISO 8601 date string */
  date:        string;
  source:      TransactionSource;
  status:      TransactionStatus;
  description: string;
}
