/**
 * Static configuration and demo data.
 */

const STORAGE_KEYS = {
  categories: 'aura_finance_cats_v2',
  transactions: 'aura_finance_txs_v2',
  currency: 'aura_finance_curr_v2',
};

const VIEWS = ['dashboard', 'transactions', 'analytics', 'categories'];

const TX_TYPE = { EXPENSE: 'EXPENSE', INCOME: 'INCOME' };

const DEFAULT_CURRENCY = '$';
const FALLBACK_EMOJI = '🏷️';
const FALLBACK_COLOR = '#6366f1';
const UNCATEGORIZED = { name: 'Uncategorized', emoji: '🔖', color: '#94a3b8' };

const RECENT_TRANSACTIONS_LIMIT = 4;
const DASHBOARD_CATEGORY_LIMIT = 5;

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining',    emoji: '🍔', color: '#f59e0b' },
  { id: 'cat-2', name: 'Rent & Home',      emoji: '🏠', color: '#6366f1' },
  { id: 'cat-3', name: 'Transport',        emoji: '🚗', color: '#06b6d4' },
  { id: 'cat-4', name: 'Tech & Gadgets',   emoji: '💻', color: '#3b82f6' },
  { id: 'cat-5', name: 'Entertainment',    emoji: '🎬', color: '#ec4899' },
  { id: 'cat-6', name: 'Health & Fitness', emoji: '💊', color: '#10b981' },
  { id: 'cat-7', name: 'Salary & Income',  emoji: '💰', color: '#10b981' },
  { id: 'cat-8', name: 'Shopping',         emoji: '🛍️', color: '#8b5cf6' },
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tx-1', title: 'Monthly Salary',        amount: 4500.0, type: 'INCOME',  categoryId: 'cat-7', date: '2026-10-01', notes: 'Main direct deposit' },
  { id: 'tx-2', title: 'Apartment Rent',        amount: 1350.0, type: 'EXPENSE', categoryId: 'cat-2', date: '2026-10-02', notes: 'Monthly lease payment' },
  { id: 'tx-3', title: 'Supermarket Groceries', amount: 185.4,  type: 'EXPENSE', categoryId: 'cat-1', date: '2026-10-04', notes: 'Weekly household supplies' },
  { id: 'tx-4', title: 'Metro Transit Card',    amount: 75.0,   type: 'EXPENSE', categoryId: 'cat-3', date: '2026-10-06', notes: 'Commuter pass' },
  { id: 'tx-5', title: 'Cinema & Dinner',       amount: 68.5,   type: 'EXPENSE', categoryId: 'cat-5', date: '2026-10-09', notes: 'Weekend outing' },
  { id: 'tx-6', title: 'Gym & Protein',         amount: 60.0,   type: 'EXPENSE', categoryId: 'cat-6', date: '2026-10-12', notes: 'Fitness subscription' },
  { id: 'tx-7', title: 'Freelance Design',      amount: 750.0,  type: 'INCOME',  categoryId: 'cat-7', date: '2026-10-15', notes: 'App UI prototype project' },
];
