/**
 * Entry point: wires DOM events to actions and boots the app.
 *
 * Buttons in the HTML declare what they do with `data-action="..."`
 * (plus optional `data-id`, `data-tab`, `data-value`). A single click
 * listener looks the action up in ACTIONS below – no inline onclick handlers.
 */

// ---------- Actions ----------

function switchTab(tabId) {
  Views.showView(tabId);
  Views.renderAll(); // keeps charts and lists fresh when the view becomes visible
}

function requestDeleteTransaction(id) {
  Dialog.confirm({
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction record?',
    onConfirm: () => {
      Store.deleteTransaction(id);
      Views.renderAll();
    },
  });
}

function requestDeleteCategory(id) {
  const fallback = Store.getFallbackCategory(id);
  if (!fallback) {
    Dialog.alert('You must have at least one active category.');
    return;
  }

  const linked = Store.countTransactionsIn(id);
  const message = linked
    ? `This category is linked to ${linked} transaction(s). Removing it will reassign them to "${fallback.name}". Continue?`
    : 'Are you sure you want to delete this category?';

  Dialog.confirm({
    title: 'Delete Category',
    message,
    onConfirm: () => {
      Store.deleteCategory(id);
      Views.renderCategoryModalList();
      Views.renderAll();
    },
  });
}

function requestReset() {
  Dialog.confirm({
    title: 'Reset Database',
    message: 'This will reset all categories and transactions to the default demo data. Are you sure?',
    onConfirm: () => {
      Store.reset();
      syncControlsWithStore();
      Views.renderAll();
    },
  });
}

function exportCSV() {
  if (Store.transactions.length === 0) {
    Dialog.alert('No transaction entries available to export.');
    return;
  }

  const header = 'ID,Type,Title,Category,Amount,Date,Notes';
  const rows = Store.transactions.map((tx) =>
    [
      tx.id,
      tx.type,
      csvCell(tx.title),
      csvCell(Store.getCategory(tx.categoryId).name),
      tx.amount,
      tx.date,
      csvCell(tx.notes),
    ].join(',')
  );

  downloadFile([header, ...rows].join('\n'), 'aurafinance_export.csv', 'text/csv');
}

function exportJSON() {
  const backup = {
    exportedAt: new Date().toISOString(),
    currency: Store.currency,
    categories: Store.categories,
    transactions: Store.transactions,
  };
  downloadFile(JSON.stringify(backup, null, 2), 'aurafinance_backup.json', 'application/json');
}

/** Maps `data-action` names to handlers. `el` is the clicked element. */
const ACTIONS = {
  'switch-tab': (el) => switchTab(el.dataset.tab),

  'open-transaction-modal': () => TransactionModal.open(),
  'close-transaction-modal': () => TransactionModal.close(),
  'set-tx-type': (el) => TransactionModal.setType(el.dataset.value),
  'edit-transaction': (el) => TransactionModal.open(el.dataset.id),
  'delete-transaction': (el) => requestDeleteTransaction(el.dataset.id),

  'open-category-modal': () => CategoryModal.open(),
  'close-category-modal': () => CategoryModal.close(),
  'add-category': () => CategoryModal.add(),
  'delete-category': (el) => requestDeleteCategory(el.dataset.id),

  'filter-type': (el) => {
    Store.filters.type = el.dataset.value;
    refreshTransactionFilters();
  },
  'filter-category': (el) => {
    const { value } = el.dataset;
    Store.filters.categoryId = Store.filters.categoryId === value ? 'ALL' : value; // click again to clear
    refreshTransactionFilters();
  },

  'export-csv': exportCSV,
  'export-json': exportJSON,
  'reset-data': requestReset,
  'close-alert': () => Dialog.close(),
};

function refreshTransactionFilters() {
  Views.renderFilterChips();
  Views.renderTransactions();
}

// ---------- Event wiring ----------

function bindEvents() {
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (el) ACTIONS[el.dataset.action]?.(el);
  });

  $('alertBtnConfirm').addEventListener('click', () => Dialog.accept());

  $('txForm').addEventListener('submit', (event) => {
    event.preventDefault();
    TransactionModal.submit();
  });

  $('currencySelector').addEventListener('change', (event) => {
    Store.setCurrency(event.target.value);
    $('amountSymbol').textContent = Store.currency;
    Views.renderAll();
  });

  $('searchInput').addEventListener('input', (event) => {
    Store.filters.search = event.target.value;
    Views.renderTransactions();
  });

  $('sortFilter').addEventListener('change', (event) => {
    Store.filters.sort = event.target.value;
    Views.renderTransactions();
  });

  // Clicking the dark backdrop closes a modal.
  const modals = { transactionModal: TransactionModal, categoryModal: CategoryModal, alertModal: Dialog };
  Object.entries(modals).forEach(([id, controller]) => {
    $(id).addEventListener('click', (event) => {
      if (event.target.id === id) controller.close();
    });
  });

  // Escape closes whichever modal is open.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    Object.entries(modals).forEach(([id, controller]) => {
      if (!$(id).classList.contains('hidden')) controller.close();
    });
  });
}

/** Pushes store values (currency, filters) into the form controls. */
function syncControlsWithStore() {
  $('currencySelector').value = Store.currency;
  $('amountSymbol').textContent = Store.currency;
  $('searchInput').value = Store.filters.search;
  $('sortFilter').value = Store.filters.sort;
}

// ---------- Boot ----------

window.addEventListener('DOMContentLoaded', () => {
  Store.load();
  syncControlsWithStore();
  $('txDate').value = todayISO();

  bindEvents();
  Charts.init();
  Views.renderAll();
});
