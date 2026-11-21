/**
 * Application state, persistence (localStorage) and derived data.
 * Nothing in this file touches the DOM.
 */

const Store = {
  categories: [],
  transactions: [],
  currency: DEFAULT_CURRENCY,

  /** UI filter state for the Transactions view. */
  filters: { type: 'ALL', categoryId: 'ALL', search: '', sort: 'date-desc' },

  // ---------- Persistence ----------

  load() {
    this.categories = this._read(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
    this.transactions = this._read(STORAGE_KEYS.transactions, DEFAULT_TRANSACTIONS);
    this.currency = localStorage.getItem(STORAGE_KEYS.currency) || DEFAULT_CURRENCY;
    this.save();
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.currency, this.currency);
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  },

  /** Reads JSON from localStorage; falls back to a copy of `fallback` if missing or corrupted. */
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      console.warn(`Ignoring corrupted data for "${key}":`, error);
    }
    return clone(fallback);
  },

  reset() {
    this.categories = clone(DEFAULT_CATEGORIES);
    this.transactions = clone(DEFAULT_TRANSACTIONS);
    this.currency = DEFAULT_CURRENCY;
    this.filters = { type: 'ALL', categoryId: 'ALL', search: '', sort: 'date-desc' };
    this.save();
  },

  // ---------- Lookups ----------

  getCategory(id) {
    return this.categories.find((c) => c.id === id) || UNCATEGORIZED;
  },

  getTransaction(id) {
    return this.transactions.find((t) => t.id === id);
  },

  countTransactionsIn(categoryId) {
    return this.transactions.filter((t) => t.categoryId === categoryId).length;
  },

  // ---------- Transactions ----------

  addTransaction(data) {
    this.transactions.unshift({ id: `tx-${Date.now()}`, ...data });
    this.save();
  },

  updateTransaction(id, data) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return;
    this.transactions[index] = { id, ...data };
    this.save();
  },

  deleteTransaction(id) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.save();
  },

  // ---------- Categories ----------

  addCategory({ name, emoji, color }) {
    this.categories.push({ id: `cat-${Date.now()}`, name, emoji, color });
    this.save();
  },

  /** Deletes a category and moves its transactions to another one. Returns false if it's the last category. */
  deleteCategory(id) {
    const fallback = this.getFallbackCategory(id);
    if (!fallback) return false;

    this.transactions.forEach((tx) => {
      if (tx.categoryId === id) tx.categoryId = fallback.id;
    });
    this.categories = this.categories.filter((c) => c.id !== id);
    if (this.filters.categoryId === id) this.filters.categoryId = 'ALL';
    this.save();
    return true;
  },

  /** The category that inherits transactions when `excludedId` is deleted. */
  getFallbackCategory(excludedId) {
    return this.categories.find((c) => c.id !== excludedId) || null;
  },

  setCurrency(symbol) {
    this.currency = symbol;
    this.save();
  },

  // ---------- Derived data ----------

  getSummary() {
    const income = this.transactions.filter((t) => t.type === TX_TYPE.INCOME);
    const expenses = this.transactions.filter((t) => t.type !== TX_TYPE.INCOME);
    const incomeTotal = sumAmounts(income);
    const expenseTotal = sumAmounts(expenses);

    return {
      incomeTotal,
      expenseTotal,
      incomeCount: income.length,
      expenseCount: expenses.length,
      balance: incomeTotal - expenseTotal,
      savingsRate: incomeTotal > 0 ? Math.max(0, Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100)) : 0,
    };
  },

  /** Map of categoryId -> total expense amount (every category is present, even with 0). */
  getExpenseTotalsByCategory() {
    const totals = new Map(this.categories.map((c) => [c.id, 0]));
    this.transactions
      .filter((t) => t.type !== TX_TYPE.INCOME)
      .forEach((t) => totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + (Number(t.amount) || 0)));
    return totals;
  },

  getRecentTransactions(limit = RECENT_TRANSACTIONS_LIMIT) {
    return [...this.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  },

  /** Transactions after applying search, type, category and sort. */
  getFilteredTransactions() {
    const { search, type, categoryId, sort } = this.filters;
    const query = search.toLowerCase().trim();

    const matches = (tx) => {
      if (type !== 'ALL' && tx.type !== type) return false;
      if (categoryId !== 'ALL' && tx.categoryId !== categoryId) return false;
      if (!query) return true;

      const haystack = [tx.title, tx.notes, this.getCategory(tx.categoryId).name];
      return haystack.some((text) => (text || '').toLowerCase().includes(query));
    };

    const comparators = {
      'date-desc': (a, b) => b.date.localeCompare(a.date),
      'date-asc': (a, b) => a.date.localeCompare(b.date),
      'amount-desc': (a, b) => b.amount - a.amount,
      'amount-asc': (a, b) => a.amount - b.amount,
    };

    return this.transactions.filter(matches).sort(comparators[sort] || comparators['date-desc']);
  },
};
