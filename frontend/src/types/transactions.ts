import { CategoryId } from '@/src/components/logger/CategoryPicker';

export type TransactionSource = 'manual' | 'sms';
export type TransactionStatus = 'confirmed' | 'pending';
export type TransactionDirection = 'debit' | 'credit';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: CategoryId;
  description: string;
  merchant: string | null;
  date: string; // ISO 8601
  source: TransactionSource;
  status: TransactionStatus;
  direction: TransactionDirection;
  raw_sms?: string;
  created_at: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    user_id: '1',
    amount: 4500,
    category: 'food',
    description: 'Chicken Republic',
    merchant: 'Chicken Republic',
    date: new Date().toISOString(),
    source: 'sms',
    status: 'pending',
    direction: 'debit',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    amount: 10000,
    category: 'utilities',
    description: 'Ikeja Electric',
    merchant: 'Ikeja Electric',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    source: 'sms',
    status: 'confirmed',
    direction: 'debit',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    amount: 850000,
    category: 'other',
    description: 'Salary Payment',
    merchant: 'Company Corp',
    date: '2023-10-28T10:00:00Z',
    source: 'manual',
    status: 'confirmed',
    direction: 'credit',
    created_at: '2023-10-28T10:00:00Z',
  },
  {
    id: '4',
    user_id: '1',
    amount: 2500,
    category: 'transport',
    description: 'Uber Ride',
    merchant: 'Uber',
    date: new Date().toISOString(),
    source: 'manual',
    status: 'confirmed',
    direction: 'debit',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: '1',
    amount: 1500,
    category: 'airtime',
    description: 'MTN Topup',
    merchant: 'MTN',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    source: 'sms',
    status: 'confirmed',
    direction: 'debit',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];
