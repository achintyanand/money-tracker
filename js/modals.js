/**
 * Modal controllers: alert/confirm dialog, transaction form, category manager.
 * Each one only opens/closes its modal and reads/writes its own form fields.
 */

// ---------- Generic alert / confirm (replaces window.alert / confirm) ----------

const Dialog = {
  _onConfirm: null,

  alert(message) {
    this._show({ title: 'Notice', message, confirmLabel: 'OK', showCancel: false });
  },

  confirm({ title, message, onConfirm }) {
    this._show({ title, message, confirmLabel: 'Proceed', showCancel: true, onConfirm });
  },

  /** Called by the Confirm button. */
  accept() {
    const callback = this._onConfirm;
    this.close();
    if (callback) callback();
  },

  close() {
    this._onConfirm = null;
    $('alertModal').classList.add('hidden');
  },

  _show({ title, message, confirmLabel, showCancel, onConfirm = null }) {
    this._onConfirm = onConfirm;
    $('alertTitle').textContent = title;
    $('alertMessage').textContent = message;
    $('alertBtnConfirm').textContent = confirmLabel;
    $('alertBtnCancel').classList.toggle('hidden', !showCancel);
    $('alertModal').classList.remove('hidden');
  },
};

// ---------- Add / edit transaction ----------

const TransactionModal = {
  open(editId = null) {
    Views.renderCategoryOptions();

    const tx = editId ? Store.getTransaction(editId) : null;
    if (editId && !tx) return;

    $('txId').value = tx ? tx.id : '';
    $('txTitle').value = tx ? tx.title : '';
    $('txAmount').value = tx ? tx.amount : '';
    $('txDate').value = tx ? tx.date : todayISO();
    $('txNotes').value = tx?.notes || '';
    if (tx) $('txCategory').value = tx.categoryId;
    this.setType(tx ? tx.type : TX_TYPE.EXPENSE);

    $('modalTxTitle').innerHTML = tx
      ? '<i data-lucide="edit" class="w-5 h-5 text-indigo-400"></i> Edit Transaction'
      : '<i data-lucide="circle-dollar-sign" class="w-5 h-5 text-indigo-400"></i> Add New Transaction';

    $('transactionModal').classList.remove('hidden');
    lucide.createIcons();
    $('txTitle').focus();
  },

  close() {
    $('transactionModal').classList.add('hidden');
  },

  setType(type) {
    $('txType').value = type;
    $('btnTypeExpense').classList.toggle('is-active', type === TX_TYPE.EXPENSE);
    $('btnTypeIncome').classList.toggle('is-active', type === TX_TYPE.INCOME);
  },

  /** Reads + validates the form. Returns the transaction data, or null if invalid. */
  readForm() {
    const data = {
      title: $('txTitle').value.trim(),
      amount: parseFloat($('txAmount').value),
      categoryId: $('txCategory').value,
      date: $('txDate').value,
      notes: $('txNotes').value.trim(),
      type: $('txType').value,
    };
    const isValid = data.title && data.amount > 0 && data.date && data.categoryId;
    return isValid ? data : null;
  },

  submit() {
    const data = this.readForm();
    if (!data) {
      Dialog.alert('Please check your input values.');
      return;
    }

    const id = $('txId').value;
    if (id) Store.updateTransaction(id, data);
    else Store.addTransaction(data);

    Views.renderAll();
    this.close();
  },
};

// ---------- Category manager ----------

const CategoryModal = {
  open() {
    Views.renderCategoryModalList();
    $('categoryModal').classList.remove('hidden');
    lucide.createIcons();
  },

  close() {
    $('categoryModal').classList.add('hidden');
  },

  add() {
    const name = $('newCatName').value.trim();
    if (!name) {
      Dialog.alert('Please enter a category title.');
      return;
    }

    Store.addCategory({
      name,
      emoji: $('newCatEmoji').value.trim() || FALLBACK_EMOJI,
      color: $('newCatColor').value || FALLBACK_COLOR,
    });

    $('newCatName').value = '';
    $('newCatEmoji').value = '';
    Views.renderCategoryModalList();
    Views.renderAll();
  },
};
