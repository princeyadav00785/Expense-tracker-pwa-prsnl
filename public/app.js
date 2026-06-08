const CATEGORIES = [
  { id: 'food', label: 'Food', color: '#ff6b6b', icon: '🍕' },
  { id: 'transport', label: 'Transport', color: '#feca57', icon: '🚕' },
  { id: 'shopping', label: 'Shopping', color: '#48dbfb', icon: '🛍️' },
  { id: 'bills', label: 'Bills', color: '#ff9ff3', icon: '📄' },
  { id: 'health', label: 'Health', color: '#2ed573', icon: '💊' },
  { id: 'entertainment', label: 'Fun', color: '#f368e0', icon: '🎮' },
  { id: 'education', label: 'Education', color: '#54a0ff', icon: '📚' },
  { id: 'travel', label: 'Travel', color: '#ffa502', icon: '✈️' },
  { id: 'other', label: 'Other', color: '#a4a4a4', icon: '📦' },
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
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(key) {
  const [y, m] = key.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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

function getDailyBreakdown() {
  const filtered = getFilteredExpenses();
  const [y, m] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const daily = new Array(daysInMonth).fill(0);
  filtered.forEach(e => {
    const day = new Date(e.date).getDate();
    daily[day - 1] += e.amount;
  });
  return daily;
}

function getTransactionCount() {
  return getFilteredExpenses().length;
}

function render() {
  const app = document.getElementById('app');
  const filtered = getFilteredExpenses();
  const monthTotal = getTotalForMonth();
  const todayTotal = getTodayTotal();
  const breakdown = getCategoryBreakdown();
  const txCount = getTransactionCount();

  app.innerHTML = `
    <header>
      <h1>Expenses</h1>
      <div class="header-actions">
        <button class="btn-icon" onclick="exportJSON()" title="Export JSON">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="importJSON()" title="Import JSON">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </button>
      </div>
    </header>

    <div class="month-nav">
      <button onclick="changeMonth(-1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span>${formatMonth(currentMonth)}</span>
      <button onclick="changeMonth(1)">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <div class="icon-wrapper">
          <svg width="18" height="18" fill="none" stroke="#6c5ce7" stroke-width="2" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 10h20"/>
          </svg>
        </div>
        <div class="label">This Month</div>
        <div class="amount">${formatCurrency(monthTotal)}</div>
      </div>
      <div class="summary-card">
        <div class="icon-wrapper">
          <svg width="18" height="18" fill="none" stroke="#00d2d3" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="label">Today</div>
        <div class="amount">${formatCurrency(todayTotal)}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${currentTab === 'list' ? 'active' : ''}" onclick="switchTab('list')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
        </svg>
        ${txCount} Transactions
      </button>
      <button class="tab ${currentTab === 'charts' ? 'active' : ''}" onclick="switchTab('charts')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        Charts
      </button>
    </div>

    <div id="tab-content">
      ${currentTab === 'list' ? renderList(filtered) : renderCharts(breakdown, monthTotal)}
    </div>

    <button class="fab" onclick="openModal()">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <footer class="footer">
      made with <span>&hearts;</span> by prnc
    </footer>
  `;
}

function renderList(filtered) {
  if (filtered.length === 0) {
    return `<div class="empty-state">
      <div class="icon">💸</div>
      <p>No expenses this month</p>
      <p class="hint">Tap + to add your first expense</p>
    </div>`;
  }

  let lastDate = '';
  let html = '<div class="expense-list">';

  filtered.forEach((e, i) => {
    const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[8];
    const delay = Math.min(i * 0.05, 0.5);

    html += `<div class="expense-item" style="animation-delay:${delay}s">
      <div class="expense-cat-icon" style="background:${cat.color}20">
        ${cat.icon}
      </div>
      <div class="expense-info">
        <div class="name">${esc(e.name)}</div>
        <div class="meta">
          <span class="cat-badge">${cat.label}</span>
          ${formatDate(e.date)}
        </div>
      </div>
      <div class="expense-amount">- ${formatCurrency(e.amount)}</div>
      <button class="expense-delete" onclick="deleteExpense('${e.id}')">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>`;
  });

  html += '</div>';
  return html;
}

function renderCharts(breakdown, total) {
  if (breakdown.length === 0) {
    return `<div class="empty-state">
      <div class="icon">📊</div>
      <p>Add expenses to see charts</p>
      <p class="hint">Visual breakdown appears here</p>
    </div>`;
  }

  const maxAmount = Math.max(...breakdown.map(b => b.amount));
  const daily = getDailyBreakdown();
  const maxDaily = Math.max(...daily, 1);

  let donutSegments = '';
  let offset = 0;
  breakdown.forEach(b => {
    const pct = (b.amount / total) * 100;
    const dashArray = `${pct} ${100 - pct}`;
    donutSegments += `<circle cx="50%" cy="50%" r="15.9" fill="none" stroke="${b.color}" stroke-width="5"
      stroke-dasharray="${dashArray}" stroke-dashoffset="${-offset}" transform="rotate(-90 21 21)"
      style="transition: stroke-dasharray 0.6s ease"/>`;
    offset += pct;
  });

  return `
    <div class="chart-container" style="animation-delay:0s">
      <h3>
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/></svg>
        Category Split
      </h3>
      <div class="donut-chart">
        <svg class="donut-svg" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="${'var(--surface-2)'}" stroke-width="5"/>
          ${donutSegments}
        </svg>
        <div class="donut-legend">
          ${breakdown.slice(0, 6).map((b, i) => `
            <div class="legend-item" style="animation-delay:${i * 0.1}s">
              <span class="legend-icon">${b.icon}</span>
              <span class="legend-label">${b.label}</span>
              <span class="legend-value">${Math.round(b.amount / total * 100)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="chart-container" style="animation-delay:0.1s">
      <h3>
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
        Daily Spending
      </h3>
      <div class="daily-chart">
        ${daily.map((d, i) => `
          <div class="daily-bar" title="Day ${i + 1}: ${formatCurrency(d)}">
            <div class="fill" style="height:${d > 0 ? Math.max((d / maxDaily) * 100, 4) : 0}%"></div>
          </div>
        `).join('')}
      </div>
      <div class="daily-labels">
        <span>1</span>
        <span>${Math.ceil(daily.length / 4)}</span>
        <span>${Math.ceil(daily.length / 2)}</span>
        <span>${Math.ceil(daily.length * 3 / 4)}</span>
        <span>${daily.length}</span>
      </div>
    </div>

    <div class="chart-container" style="animation-delay:0.2s">
      <h3>
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        Spending by Category
      </h3>
      <div class="chart-bar-group">
        ${breakdown.map((b, i) => `
          <div class="chart-bar-item" style="animation-delay:${i * 0.1}s">
            <span class="chart-bar-icon">${b.icon}</span>
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
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
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
  overlay.className = 'modal-overlay';
  overlay.id = 'modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <h2>
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        Add Expense
      </h2>
      <div class="form-group">
        <label>Amount (₹)</label>
        <input type="number" id="inp-amount" placeholder="0" inputmode="decimal" autofocus>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="inp-name" placeholder="What did you spend on?">
      </div>
      <div class="form-group">
        <label>Category</label>
        <div class="category-grid">
          ${CATEGORIES.map(c => `<div class="category-chip" data-cat="${c.id}" onclick="selectCat('${c.id}')">
            <span class="chip-icon">${c.icon}</span>
            ${c.label}
          </div>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="inp-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <button class="btn-primary" onclick="addExpense()">
        Add Expense
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  setTimeout(() => document.getElementById('inp-amount').focus(), 300);
}

function closeModal() {
  const m = document.getElementById('modal');
  if (m) {
    m.classList.remove('open');
    setTimeout(() => m.remove(), 350);
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

  if (!amount || amount <= 0) {
    document.getElementById('inp-amount').style.borderColor = '#ff4757';
    return;
  }
  if (!name) {
    document.getElementById('inp-name').style.borderColor = '#ff4757';
    return;
  }
  if (!selectedCat) {
    document.querySelector('.category-grid').style.outline = '2px solid #ff4757';
    document.querySelector('.category-grid').style.borderRadius = '12px';
    return;
  }

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
  const item = document.querySelector(`[onclick="deleteExpense('${id}')"]`).closest('.expense-item');
  item.style.transform = 'translateX(100%)';
  item.style.opacity = '0';
  item.style.transition = 'all 0.3s ease';
  setTimeout(() => {
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses(expenses);
    render();
  }, 300);
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
  navigator.serviceWorker.register('/sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast(newWorker);
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

function showUpdateToast(worker) {
  const toast = document.createElement('div');
  toast.className = 'update-toast';
  toast.innerHTML = `
    <span class="toast-text">New version available</span>
    <button class="toast-btn" onclick="applyUpdate()">Update</button>
  `;
  document.body.appendChild(toast);
  window._pendingWorker = worker;
}

function applyUpdate() {
  if (window._pendingWorker) {
    window._pendingWorker.postMessage('skipWaiting');
  }
}

render();
