/**
 * Rendering: turns store data into HTML. Templates are small functions so
 * each one can be read (and changed) in isolation.
 */

const Views = {
  renderAll() {
    this.renderKpis();
    this.renderCategoryOptions();
    this.renderFilterChips();
    this.renderRecentTransactions();
    this.renderTransactions();
    this.renderCategoryBars();
    this.renderCategoryCards();
    Charts.render();
    lucide.createIcons();
  },

  // ---------- KPI cards ----------

  renderKpis() {
    const s = Store.getSummary();

    $('statBalance').textContent = Format.amount(s.balance);
    $('headerNetBalance').textContent = Format.amount(s.balance);
    $('statIncome').textContent = Format.amount(s.incomeTotal);
    $('statExpense').textContent = Format.amount(s.expenseTotal);
    $('statSavingsRate').textContent = `${s.savingsRate}%`;
    $('incomeCount').textContent = s.incomeCount;
    $('expenseCount').textContent = s.expenseCount;
    $('categoryCount').textContent = Store.categories.length;
  },

  // ---------- Form + filter controls ----------

  /** Fills the category <select> in the transaction form, keeping the current choice. */
  renderCategoryOptions() {
    const select = $('txCategory');
    const previous = select.value;

    select.innerHTML = Store.categories
      .map((c) => `<option value="${escapeHtml(c.id)}">${c.emoji || FALLBACK_EMOJI} ${escapeHtml(c.name)}</option>`)
      .join('');

    if (Store.categories.some((c) => c.id === previous)) select.value = previous;
  },

  renderFilterChips() {
    const { type, categoryId } = Store.filters;

    ['ALL', 'EXPENSE', 'INCOME'].forEach((value) => {
      $(`chip-type-${value}`)?.classList.toggle('is-active', value === type);
    });

    $('categoryFilterChips').innerHTML = Store.categories
      .map(
        (c) => `
          <button data-action="filter-category" data-value="${escapeHtml(c.id)}"
                  class="chip ${c.id === categoryId ? 'is-active' : ''}">
            <span>${c.emoji || FALLBACK_EMOJI}</span>
            <span>${escapeHtml(c.name)}</span>
          </button>`
      )
      .join('');
  },

  // ---------- Transactions ----------

  renderRecentTransactions() {
    const recent = Store.getRecentTransactions();
    $('recentTransactionsList').innerHTML = recent.length
      ? recent.map(Templates.transactionRow).join('')
      : '<p class="text-xs text-slate-500 py-4 text-center">No transactions recorded yet.</p>';
  },

  renderTransactions() {
    const list = Store.getFilteredTransactions();
    $('transactionsContainer').innerHTML = list.map(Templates.transactionRow).join('');
    $('noTransactionsNotice').classList.toggle('hidden', list.length > 0);
    lucide.createIcons();
  },

  // ---------- Categories ----------

  /** Spending progress bars for the dashboard (top N) and the analytics tab (all). */
  renderCategoryBars() {
    const totals = Store.getExpenseTotalsByCategory();
    const grandTotal = [...totals.values()].reduce((sum, amount) => sum + amount, 0);
    const sorted = [...Store.categories].sort((a, b) => (totals.get(b.id) || 0) - (totals.get(a.id) || 0));

    const fill = (containerId, categories) => {
      $(containerId).innerHTML =
        grandTotal === 0
          ? '<div class="text-xs text-slate-500 py-6 text-center">No expense logs recorded yet.</div>'
          : categories.map((c) => Templates.categoryBar(c, totals.get(c.id) || 0, grandTotal)).join('');
    };

    fill('dashboardCategoryProgress', sorted.slice(0, DASHBOARD_CATEGORY_LIMIT));
    fill('analyticsCategoryList', sorted);
  },

  renderCategoryCards() {
    const totals = Store.getExpenseTotalsByCategory();
    $('categoriesCardsGrid').innerHTML = Store.categories
      .map((c) => Templates.categoryCard(c, totals.get(c.id) || 0, Store.countTransactionsIn(c.id)))
      .join('');
  },

  renderCategoryModalList() {
    $('categoryModalList').innerHTML = Store.categories
      .map((c) => Templates.categoryModalRow(c, Store.countTransactionsIn(c.id)))
      .join('');
    lucide.createIcons();
  },

  // ---------- Navigation ----------

  showView(viewId) {
    VIEWS.forEach((view) => {
      const isActive = view === viewId;
      $(`view-${view}`).classList.toggle('hidden', !isActive);
      $(`desktop-tab-${view}`).classList.toggle('is-active', isActive);
      $(`mobile-tab-${view}`).classList.toggle('is-active', isActive);
    });

    // The KPI strip is hidden on the Categories tab.
    $('kpiSection').classList.toggle('hidden', viewId === 'categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/**
 * HTML templates. Every user-provided string goes through escapeHtml()
 * and every colour through safeColor().
 */
const Templates = {
  /** Rounded emoji badge tinted with the category colour. */
  categoryBadge(category, sizeClasses) {
    const color = safeColor(category.color);
    return `
      <div class="${sizeClasses} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
           style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}35;">
        ${category.emoji || FALLBACK_EMOJI}
      </div>`;
  },

  transactionRow(tx) {
    const category = Store.getCategory(tx.categoryId);
    const isExpense = tx.type !== TX_TYPE.INCOME;
    const sign = isExpense ? '-' : '+';
    const amountColor = isExpense ? 'text-rose-400' : 'text-emerald-400';
    const id = escapeHtml(tx.id);

    return `
      <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-800/40 transition group">
        <div class="flex items-center gap-3 min-w-0 pr-2">
          ${Templates.categoryBadge(category, 'w-10 h-10 text-base')}
          <div class="truncate">
            <div class="font-semibold text-xs sm:text-sm text-slate-100 truncate">${escapeHtml(tx.title)}</div>
            <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span class="truncate">${escapeHtml(category.name)}</span>
              <span>•</span>
              <span class="whitespace-nowrap">${formatDisplayDate(tx.date)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div class="text-right">
            <div class="font-bold font-mono text-xs sm:text-sm ${amountColor}">${sign}${Format.amount(tx.amount)}</div>
            ${tx.notes ? `<div class="text-[10px] text-slate-500 max-w-[100px] truncate hidden sm:block">${escapeHtml(tx.notes)}</div>` : ''}
          </div>
          <div class="flex items-center gap-1">
            <button data-action="edit-transaction" data-id="${id}" title="Edit"
                    class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button data-action="delete-transaction" data-id="${id}" title="Delete"
                    class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>`;
  },

  categoryBar(category, spent, grandTotal) {
    const percentage = ((spent / grandTotal) * 100).toFixed(1);
    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 font-medium text-slate-300">
            <span>${category.emoji || FALLBACK_EMOJI}</span>
            <span>${escapeHtml(category.name)}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-400 font-mono">
            <span class="font-bold text-slate-200">${Format.amount(spent)}</span>
            <span class="text-[10px] text-slate-500">(${percentage}%)</span>
          </div>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="h-2 rounded-full transition-all duration-500"
               style="width: ${percentage}%; background-color: ${safeColor(category.color)};"></div>
        </div>
      </div>`;
  },

  categoryCard(category, spent, transactionCount) {
    return `
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          ${Templates.categoryBadge(category, 'w-12 h-12 text-xl')}
          <div>
            <h4 class="font-semibold text-sm text-slate-100">${escapeHtml(category.name)}</h4>
            <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
              Spent: <span class="text-rose-400 font-bold">${Format.amount(spent)}</span>
            </div>
            <div class="text-[10px] text-slate-500">${pluralize(transactionCount, 'transaction')}</div>
          </div>
        </div>
        <button data-action="delete-category" data-id="${escapeHtml(category.id)}" title="Delete Category"
                class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>`;
  },

  categoryModalRow(category, transactionCount) {
    const color = safeColor(category.color);
    return `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style="background-color: ${color}25; color: ${color}">
            ${category.emoji || FALLBACK_EMOJI}
          </span>
          <div>
            <span class="font-medium text-xs sm:text-sm text-slate-200">${escapeHtml(category.name)}</span>
            <span class="text-[10px] text-slate-500 block">${pluralize(transactionCount, 'transaction')}</span>
          </div>
        </div>
        <button data-action="delete-category" data-id="${escapeHtml(category.id)}" title="Delete Category"
                class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>`;
  },
};
