const CATEGORIES = [
  { id: 'food', label: 'Food', color: '#ff6b6b' },
  { id: 'transport', label: 'Transport', color: '#feca57' },
  { id: 'shopping', label: 'Shopping', color: '#48dbfb' },
  { id: 'bills', label: 'Bills', color: '#ff9ff3' },
  { id: 'health', label: 'Health', color: '#2ed573' },
  { id: 'entertainment', label: 'Fun', color: '#f368e0' },
  { id: 'education', label: 'Education', color: '#54a0ff' },
  { id: 'travel', label: 'Travel', color: '#ffa502' },
  { id: 'other', label: 'Other', color: '#a4a4a4' },
];

const STORAGE_KEY = 'expense_tracker_data';

function loadExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveExpenses(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatCurrency(n) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(key) {
  const [y, m] = key.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

let expenses = loadExpenses();
let currentMonth = getMonthKey(new Date());
let currentTab = 'list';

function getFilteredExpenses() {
  return expenses.filter(e => getMonthKey(new Date(e.date)) === currentMonth)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getTotalForMonth() {
  return getFilteredExpenses().reduce((sum, e) => sum + e.amount, 0);
}

function getTodayTotal() {
  const today = new Date().toISOString().split('T')[0];
  return expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
}

function getCategoryBreakdown() {
  const filtered = getFilteredExpenses();
  const map = {};
  filtered.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return CATEGORIES
    .filter(c => map[c.id])
    .map(c => ({ ...c, amount: map[c.id] }))
    .sort((a, b) => b.amount - a.amount);
}

function render() {
  const app = document.getElementById('app');
  const filtered = getFilteredExpenses();
  const monthTotal = getTotalForMonth();
  const todayTotal = getTodayTotal();
  const breakdown = getCategoryBreakdown();

  app.innerHTML = `
    <header>
      <h1>Expenses</h1>
      <div class="header-actions">
        <button class="btn-icon" onclick="exportJSON()" title="Export JSON">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="importJSON()" title="Import JSON">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </button>
      </div>
    </header>

    <div class="month-nav">
      <button onclick="changeMonth(-1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span>${formatMonth(currentMonth)}</span>
      <button onclick="changeMonth(1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <div class="label">This Month</div>
        <div class="amount">${formatCurrency(monthTotal)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Today</div>
        <div class="amount">${formatCurrency(todayTotal)}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${currentTab === 'list' ? 'active' : ''}" onclick="switchTab('list')">Transactions</button>
      <button class="tab ${currentTab === 'charts' ? 'active' : ''}" onclick="switchTab('charts')">Charts</button>
    </div>

    <div id="tab-content">
      ${currentTab === 'list' ? renderList(filtered) : renderCharts(breakdown, monthTotal)}
    </div>

    <button class="fab" onclick="openModal()">+</button>
  `;
}

function renderList(filtered) {
  if (filtered.length === 0) {
    return `<div class="empty-state"><div class="icon">&#128203;</div><p>No expenses this month</p></div>`;
  }
  return `<div class="expense-list">
    ${filtered.map(e => {
      const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[8];
      return `<div class="expense-item">
        <div class="expense-cat-dot" style="background:${cat.color}"></div>
        <div class="expense-info">
          <div class="name">${esc(e.name)}</div>
          <div class="meta">${cat.label} &middot; ${formatDate(e.date)}</div>
        </div>
        <div class="expense-amount">${formatCurrency(e.amount)}</div>
        <button class="expense-delete" onclick="deleteExpense('${e.id}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    }).join('')}
  </div>`;
}

function renderCharts(breakdown, total) {
  if (breakdown.length === 0) {
    return `<div class="empty-state"><div class="icon">&#128202;</div><p>Add expenses to see charts</p></div>`;
  }
  const maxAmount = Math.max(...breakdown.map(b => b.amount));

  let donutSegments = '';
  let offset = 0;
  breakdown.forEach(b => {
    const pct = (b.amount / total) * 100;
    const dashArray = `${pct} ${100 - pct}`;
    donutSegments += `<circle cx="50%" cy="50%" r="15.9" fill="none" stroke="${b.color}" stroke-width="6"
      stroke-dasharray="${dashArray}" stroke-dashoffset="${-offset}" transform="rotate(-90 21 21)"/>`;
    offset += pct;
  });

  return `
    <div class="chart-container">
      <h3>Category Breakdown</h3>
      <div class="donut-chart">
        <svg class="donut-svg" viewBox="0 0 42 42">
          ${donutSegments}
        </svg>
        <div class="donut-legend">
          ${breakdown.slice(0, 5).map(b => `
            <div class="legend-item">
              <div class="legend-dot" style="background:${b.color}"></div>
              <span class="legend-label">${b.label}</span>
              <span class="legend-value">${Math.round(b.amount / total * 100)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="chart-container">
      <h3>Spending by Category</h3>
      <div class="chart-bar-group">
        ${breakdown.map(b => `
          <div class="chart-bar-item">
            <span class="chart-bar-label">${b.label}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width:${(b.amount / maxAmount) * 100}%;background:${b.color}"></div>
            </div>
            <span class="chart-bar-value">${formatCurrency(b.amount)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

function switchTab(tab) {
  currentTab = tab;
  render();
}

function changeMonth(dir) {
  const [y, m] = currentMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  currentMonth = getMonthKey(d);
  render();
}

function openModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'modal';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Add Expense</h2>
      <div class="form-group">
        <label>Amount</label>
        <input type="number" id="inp-amount" placeholder="0" inputmode="decimal" autofocus>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="inp-name" placeholder="What did you spend on?">
      </div>
      <div class="form-group">
        <label>Category</label>
        <div class="category-grid">
          ${CATEGORIES.map(c => `<div class="category-chip" data-cat="${c.id}" onclick="selectCat('${c.id}')">${c.label}</div>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="inp-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <button class="btn-primary" onclick="addExpense()">Add Expense</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  setTimeout(() => document.getElementById('inp-amount').focus(), 100);
}

function closeModal() {
  const m = document.getElementById('modal');
  if (m) {
    m.classList.remove('open');
    setTimeout(() => m.remove(), 300);
  }
}

let selectedCat = null;
function selectCat(id) {
  selectedCat = id;
  document.querySelectorAll('.category-chip').forEach(el => {
    el.classList.toggle('selected', el.dataset.cat === id);
  });
}

function addExpense() {
  const amount = parseFloat(document.getElementById('inp-amount').value);
  const name = document.getElementById('inp-name').value.trim();
  const date = document.getElementById('inp-date').value;

  if (!amount || amount <= 0) return;
  if (!name) return;
  if (!selectedCat) return;

  expenses.push({
    id: genId(),
    amount,
    name,
    category: selectedCat,
    date,
    createdAt: new Date().toISOString(),
  });

  saveExpenses(expenses);
  selectedCat = null;
  closeModal();
  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses(expenses);
  render();
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(expenses, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${currentMonth}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          const existingIds = new Set(expenses.map(e => e.id));
          const newItems = imported.filter(i => !existingIds.has(i.id));
          expenses = [...expenses, ...newItems];
          saveExpenses(expenses);
          render();
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

render();
