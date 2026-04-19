import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { parseArgs } from 'util';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const args = parseArgs({
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
  strict: false,
});

const email = args.values.email as string;
const password = args.values.password as string;

if (!email || !password) {
  console.error('Please provide --email and --password arguments');
  process.exit(1);
}

// Data Sets
const MERCHANTS = {
  food: ['Chicken Republic', 'Mr Biggs', 'KFC', "Domino's Pizza", 'Tantalizers', 'Mama Cass', 'Tastee Fried Chicken', 'Shoprite Food', 'Cold Stone', 'Sweet Sensation'],
  transport: ['Bolt', 'Uber', 'Danfo (cash)', 'BRT Lagos', 'Innoson Motors', 'Shuttlers', 'Rida'],
  airtime: ['MTN Recharge', 'Airtel Top-up', 'Glo Airtime', '9mobile Data'],
  shopping: ['Jumia', 'Konga', 'Shoprite', 'Spar', 'Game Store', 'H&M Lagos', 'Zara Lagos', 'Primark Online'],
  utilities: ['DSTV Subscription', 'Startimes', 'EKEDC Prepaid', 'IKEDC Token', 'Lawma Waste', 'LCC Toll'],
  health: ['Reddington Hospital', 'Eko Hospital', 'Medplus Pharmacy', 'HealthPlus', 'RelaxMax Spa'],
  entertainment: ['Genesis Cinema', 'Silverbird Cinema', 'Escape Room Lagos', 'Bowling Alley', 'Afrobeats Festival'],
  savings: ['Piggyvest Savings', 'Cowrywise Investment', 'Stash Transfer'],
};

const RANGES = {
  food: [1500, 8500],
  transport: [500, 4000],
  airtime: [500, 3000],
  shopping: [5000, 85000],
  utilities: [3500, 25000],
  health: [2000, 45000],
  entertainment: [2500, 15000],
  savings: [10000, 50000],
};

const DISTRIBUTIONS = [
  { cat: 'food', weight: 0.30 },
  { cat: 'transport', weight: 0.20 },
  { cat: 'shopping', weight: 0.15 },
  { cat: 'utilities', weight: 0.10 },
  { cat: 'airtime', weight: 0.10 },
  { cat: 'health', weight: 0.05 },
  { cat: 'entertainment', weight: 0.05 },
  { cat: 'savings', weight: 0.05 },
];

function getRandomCategory() {
  const rand = Math.random();
  let sum = 0;
  for (const dist of DISTRIBUTIONS) {
    sum += dist.weight;
    if (rand <= sum) return dist.cat as keyof typeof MERCHANTS;
  }
  return 'food'; // fallback
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 60);

  // Heavier on weekdays: 70% chance of weekday, 30% weekend
  let date;
  while (true) {
    const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    date = new Date(time);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;

    if (isWeekend) {
      if (Math.random() < 0.3) break;
    } else {
      if (Math.random() < 0.7) break;
    }
  }

  // Random time during the day
  date.setHours(getRandomInt(8, 22), getRandomInt(0, 59), getRandomInt(0, 59));

  // Return YYYY-MM-DD string to avoid timezone day-shift bugs like requested earlier
  return date.toISOString().split('T')[0];
}

async function seed() {
  console.log(`Authenticating ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Login failed:', authError?.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`Inserting 100 transactions for ${email}...`);

  const transactions = [];

  for (let i = 0; i < 100; i++) {
    const category = getRandomCategory();
    const merchantsList = MERCHANTS[category];
    const merchant = merchantsList[getRandomInt(0, merchantsList.length - 1)];
    const [minRange, maxRange] = RANGES[category];

    // Round to nearest 100
    const amountRaw = getRandomInt(minRange, maxRange);
    const amount = Math.round(amountRaw / 100) * 100;

    const source = Math.random() < 0.6 ? 'sms' : 'manual';
    const date = getRandomDate();

    transactions.push({
      user_id: userId,
      amount,
      category,
      description: merchant,
      merchant,
      date,
      source,
      status: 'confirmed',
      direction: 'debit',
      raw_sms: source === 'sms' ? `Acct:****1234\nAmt:NGN ${amount.toLocaleString()}\nDesc:${merchant} POS\nAvail Bal:NGN XXX` : null
    });
  }

  const { error: insertError } = await supabase.from('transactions').insert(transactions);

  if (insertError) {
    console.error('Failed to insert transactions:', insertError.message);
    process.exit(1);
  }

  console.log('Done! ✓');
  process.exit(0);
}

seed().catch(console.error);
