/* ============================================================
   transactions.js – Transaction data, subscription + fraud detection
   ============================================================ */

'use strict';

// ── Mock Transaction Dataset ──────────────────────────────────
const TRANSACTIONS = [
  // Normal transactions
  { id:'t001', date:'2026-03-14', merchant:'Swiggy', category:'Food', amount:-850, method:'UPI', country:'IN', status:'normal', icon:'🍔' },
  { id:'t002', date:'2026-03-14', merchant:'HDFC ATM', category:'Cash', amount:-5000, method:'ATM', country:'IN', status:'normal', icon:'🏧' },
  { id:'t003', date:'2026-03-13', merchant:'Amazon India', category:'Shopping', amount:-3200, method:'Card', country:'IN', status:'normal', icon:'📦' },
  { id:'t004', date:'2026-03-13', merchant:'Zepto', category:'Groceries', amount:-640, method:'UPI', country:'IN', status:'normal', icon:'🛒' },
  { id:'t005', date:'2026-03-12', merchant:'BigBasket', category:'Groceries', amount:-1820, method:'Card', country:'IN', status:'normal', icon:'🧺' },
  { id:'t006', date:'2026-03-12', merchant:'Zomato', category:'Food', amount:-450, method:'UPI', country:'IN', status:'normal', icon:'🍕' },
  { id:'t007', date:'2026-03-11', merchant:'Ola Cabs', category:'Transport', amount:-280, method:'UPI', country:'IN', status:'normal', icon:'🚕' },
  { id:'t008', date:'2026-03-11', merchant:'Rapido', category:'Transport', amount:-120, method:'UPI', country:'IN', status:'normal', icon:'🛵' },
  { id:'t009', date:'2026-03-10', merchant:'Salary Credit', category:'Income', amount:85000, method:'NEFT', country:'IN', status:'normal', icon:'💼' },
  { id:'t010', date:'2026-03-10', merchant:'Flipkart', category:'Shopping', amount:-2400, method:'Card', country:'IN', status:'normal', icon:'🛍️' },
  { id:'t011', date:'2026-03-09', merchant:'IRCTC', category:'Travel', amount:-1840, method:'Card', country:'IN', status:'normal', icon:'🚂' },
  { id:'t012', date:'2026-03-09', merchant:'Myntra', category:'Shopping', amount:-1650, method:'Card', country:'IN', status:'normal', icon:'👗' },
  { id:'t013', date:'2026-03-08', merchant:'Electricity Bill', category:'Utilities', amount:-2100, method:'Net Banking', country:'IN', status:'normal', icon:'⚡' },
  { id:'t014', date:'2026-03-08', merchant:'Airtel Postpaid', category:'Telecom', amount:-599, method:'Auto-pay', country:'IN', status:'normal', icon:'📱' },
  { id:'t015', date:'2026-03-07', merchant:'LIC Premium', category:'Insurance', amount:-8500, method:'Net Banking', country:'IN', status:'normal', icon:'🛡️' },

  // Subscriptions (recurring)
  { id:'s001', date:'2026-03-01', merchant:'Netflix', category:'Entertainment', amount:-649, method:'Auto-pay', country:'IN', status:'subscription', icon:'🎬', recurring:true, freq:'monthly' },
  { id:'s002', date:'2026-03-01', merchant:'Spotify Premium', category:'Entertainment', amount:-119, method:'Auto-pay', country:'IN', status:'subscription', icon:'🎵', recurring:true, freq:'monthly' },
  { id:'s003', date:'2026-03-01', merchant:'Amazon Prime', category:'Entertainment', amount:-179, method:'Auto-pay', country:'IN', status:'subscription', icon:'📺', recurring:true, freq:'monthly' },
  { id:'s004', date:'2026-03-01', merchant:'Hotstar', category:'Entertainment', amount:-299, method:'Auto-pay', country:'IN', status:'subscription', icon:'📡', recurring:true, freq:'monthly' },
  { id:'s005', date:'2026-03-05', merchant:'Dropbox Plus', category:'Software', amount:-999, method:'Auto-pay', country:'IN', status:'subscription', icon:'☁️', recurring:true, freq:'monthly' },
  { id:'s006', date:'2026-03-06', merchant:'Adobe Creative', category:'Software', amount:-1675, method:'Auto-pay', country:'IN', status:'subscription', icon:'🎨', recurring:true, freq:'monthly' },
  { id:'s007', date:'2026-03-04', merchant:'Gym Membership', category:'Health', amount:-1499, method:'Auto-pay', country:'IN', status:'subscription', icon:'💪', recurring:true, freq:'monthly' },
  { id:'s008', date:'2026-03-03', merchant:'LinkedIn Premium', category:'Professional', amount:-2399, method:'Auto-pay', country:'IN', status:'subscription', icon:'💼', recurring:true, freq:'monthly' },
  // Previous month subscriptions (for subscription detection)
  { id:'s001b', date:'2026-02-01', merchant:'Netflix', category:'Entertainment', amount:-649, method:'Auto-pay', country:'IN', status:'subscription', icon:'🎬', recurring:true, freq:'monthly' },
  { id:'s002b', date:'2026-02-01', merchant:'Spotify Premium', category:'Entertainment', amount:-119, method:'Auto-pay', country:'IN', status:'subscription', icon:'🎵', recurring:true, freq:'monthly' },
  { id:'s003b', date:'2026-02-01', merchant:'Amazon Prime', category:'Entertainment', amount:-179, method:'Auto-pay', country:'IN', status:'subscription', icon:'📺', recurring:true, freq:'monthly' },

  // Fraud alerts
  { id:'f001', date:'2026-03-13', merchant:'Amazon US', category:'Shopping', amount:-142400, method:'Card', country:'US', status:'fraud', icon:'🚨', fraudReason:'Foreign transaction: United States · Amount 37× above average' },
  { id:'f002', date:'2026-03-12', merchant:'Unknown Merchant', category:'Unknown', amount:-58000, method:'Card', country:'NG', status:'fraud', icon:'🚨', fraudReason:'High-risk country (Nigeria) · Merchant not in whitelist · Late night transaction' },
  { id:'f003', date:'2026-03-11', merchant:'PayPal Transfer', category:'Transfer', amount:-89000, method:'Net Banking', country:'IN', status:'fraud', icon:'🚨', fraudReason:'Amount 23× above average daily spend · Duplicate attempt within 3 minutes' },

  // More normal
  { id:'t016', date:'2026-03-06', merchant:'PVR Cinemas', category:'Entertainment', amount:-880, method:'Card', country:'IN', status:'normal', icon:'🎬' },
  { id:'t017', date:'2026-03-05', merchant:'Decathlon', category:'Shopping', amount:-3500, method:'Card', country:'IN', status:'normal', icon:'🏃' },
  { id:'t018', date:'2026-03-04', merchant:'Apollo Pharmacy', category:'Health', amount:-760, method:'UPI', country:'IN', status:'normal', icon:'💊' },
  { id:'t019', date:'2026-03-03', merchant:'Jio Recharge', category:'Telecom', amount:-299, method:'UPI', country:'IN', status:'normal', icon:'📶' },
  { id:'t020', date:'2026-03-02', merchant:'HDFC Bank EMI', category:'Finance', amount:-12000, method:'Auto-debit', country:'IN', status:'normal', icon:'🏦' },
  { id:'t021', date:'2026-03-02', merchant:'Fuel - BPCL', category:'Transport', amount:-3400, method:'Card', country:'IN', status:'normal', icon:'⛽' },
  { id:'t022', date:'2026-03-01', merchant:'Nykaa', category:'Beauty', amount:-1290, method:'Card', country:'IN', status:'normal', icon:'💄' },
  { id:'t023', date:'2026-02-28', merchant:'BlinkIt', category:'Groceries', amount:-540, method:'UPI', country:'IN', status:'normal', icon:'⚡' },
  { id:'t024', date:'2026-02-27', merchant:'Cred', category:'Finance', amount:-18000, method:'App', country:'IN', status:'normal', icon:'💳' },
  { id:'t025', date:'2026-02-26', merchant:'Boat Earphones', category:'Electronics', amount:-2499, method:'Card', country:'IN', status:'normal', icon:'🎧' },
];

// ── Computed Stats ────────────────────────────────────────────
const SUBSCRIPTIONS = TRANSACTIONS.filter(t => t.status === 'subscription' && t.date.startsWith('2026-03'));
const FRAUD_TXNS    = TRANSACTIONS.filter(t => t.status === 'fraud');
const NORMAL_TXNS   = TRANSACTIONS.filter(t => t.status === 'normal');

let currentFilter  = 'all';
let currentSearch  = '';
let currentDisplayed = [...TRANSACTIONS];

// ── Category icons & colors ───────────────────────────────────
const CATEGORY_COLORS = {
  Food:'#f59e0b', Shopping:'#3b82f6', Entertainment:'#8b5cf6',
  Transport:'#06b6d4', Groceries:'#10b981', Software:'#e11d48',
  Health:'#ec4899', Professional:'#0ea5e9', Utilities:'#6366f1',
  Finance:'#f97316', Travel:'#84cc16', Telecom:'#14b8a6',
  Beauty:'#f472b6', Electronics:'#a78bfa', Income:'#22c55e',
  Insurance:'#64748b', Cash:'#94a3b8', Unknown:'#ef4444'
};

// ── Render Recent Transactions (Dashboard) ────────────────────
function renderRecentTransactions() {
  const tbody = document.getElementById('recent-txns-body');
  if (!tbody) return;
  const recent = [...TRANSACTIONS]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
  tbody.innerHTML = recent.map(t => {
    const badge = t.status === 'fraud'        ? `<span class="badge badge-red">🚨 Fraud</span>`
                : t.status === 'subscription' ? `<span class="badge badge-amber">🔄 Subscription</span>`
                : `<span class="badge badge-green">✅ Normal</span>`;
    const amtColor = t.amount > 0 ? 'var(--accent-emerald)' : 'var(--text-primary)';
    const amtSign  = t.amount > 0 ? '+' : '';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.06);
              border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1rem">${t.icon}</div>
            <div>
              <div style="font-weight:600;font-size:0.85rem">${t.merchant}</div>
              <div style="font-size:0.72rem;color:var(--text-muted)">${formatDate(t.date)}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:0.8rem;color:var(--text-secondary)">${t.category}</span></td>
        <td><span style="font-weight:700;color:${amtColor}">${amtSign}${formatCurrency(t.amount)}</span></td>
        <td>${badge}</td>
      </tr>`;
  }).join('');
}

// ── Render Subscription Summary (Dashboard sidebar) ───────────
function renderSubscriptionSummary() {
  const list = document.getElementById('subscription-list');
  if (!list) return;
  const subIcons = { Netflix:'🎬', 'Spotify Premium':'🎵', 'Amazon Prime':'📺', Hotstar:'📡', 'Dropbox Plus':'☁️', 'Adobe Creative':'🎨', 'Gym Membership':'💪', 'LinkedIn Premium':'💼' };
  SUBSCRIPTIONS.slice(0,6).forEach(s => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span>${s.icon || '🔄'}</span>
        <div>
          <div style="font-size:0.82rem;font-weight:600">${s.merchant}</div>
          <div style="font-size:0.68rem;color:var(--text-muted)">${s.freq}</div>
        </div>
      </div>
      <span style="font-size:0.82rem;font-weight:700;color:#fbbf24">${formatCurrency(s.amount)}</span>`;
    list.appendChild(div);
  });
}

// ── Initialize Transactions Page ──────────────────────────────
function initTransactionsPage() {
  renderTransactionTable(TRANSACTIONS);
  updateTransactionCounts();
}

function updateTransactionCounts() {
  const fc = document.getElementById('fraud-count');
  const sc = document.getElementById('sub-count');
  const tc = document.getElementById('txn-count');
  const st = document.getElementById('sub-total');
  if (fc) fc.textContent = FRAUD_TXNS.length;
  if (sc) sc.textContent = SUBSCRIPTIONS.length;
  if (tc) tc.textContent = TRANSACTIONS.length;
  if (st) {
    const total = SUBSCRIPTIONS.reduce((sum, s) => sum + Math.abs(s.amount), 0);
    st.textContent = `${formatCurrency(total)}/month`;
  }
}

// ── Filter & Search ───────────────────────────────────────────
function filterTransactions(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
}

function searchTransactions() {
  currentSearch = document.getElementById('txn-search')?.value?.toLowerCase() || '';
  applyFilters();
}

function applyFilters() {
  let filtered = [...TRANSACTIONS];
  if (currentFilter !== 'all') filtered = filtered.filter(t => t.status === currentFilter);
  if (currentSearch) filtered = filtered.filter(t =>
    t.merchant.toLowerCase().includes(currentSearch) ||
    t.category.toLowerCase().includes(currentSearch)
  );
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
  currentDisplayed = filtered;
  renderTransactionTable(filtered);
}

function renderTransactionTable(transactions) {
  const tbody = document.getElementById('txn-table-body');
  const empty = document.getElementById('txn-empty');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  tbody.innerHTML = transactions.map(t => {
    let badge, rowStyle = '';
    if (t.status === 'fraud') {
      badge = `<span class="badge badge-red">🚨 Fraud</span>`;
      rowStyle = 'background:rgba(244,63,94,0.04)';
    } else if (t.status === 'subscription') {
      badge = `<span class="badge badge-amber">🔄 Subscription</span>`;
      rowStyle = 'background:rgba(245,158,11,0.04)';
    } else {
      badge = `<span class="badge badge-green">✅ Normal</span>`;
    }
    const amtColor = t.amount > 0 ? 'var(--accent-emerald)' : t.status === 'fraud' ? '#fb7185' : 'var(--text-primary)';
    const amtSign  = t.amount > 0 ? '+' : '';
    const countryFlag = t.country !== 'IN' ? `<span style="font-size:0.7rem;background:rgba(244,63,94,0.1);color:#fb7185;padding:1px 6px;border-radius:4px;margin-left:4px">${t.country}</span>` : '';

    return `
      <tr style="${rowStyle}" onclick="showTxnDetail('${t.id}')" style="cursor:pointer">
        <td style="color:var(--text-muted);font-size:0.78rem">${formatDate(t.date)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,0.05);
              border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0">${t.icon}</div>
            <div>
              <div style="font-weight:600;font-size:0.85rem">${t.merchant}${countryFlag}</div>
              ${t.fraudReason ? `<div style="font-size:0.68rem;color:#fb7185;margin-top:2px">⚠️ ${t.fraudReason}</div>` : ''}
              ${t.recurring ? `<div style="font-size:0.68rem;color:#fbbf24;margin-top:2px">🔄 ${t.freq} recurring</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span style="font-size:0.78rem;color:${CATEGORY_COLORS[t.category] || 'var(--text-secondary)'};
            background:${CATEGORY_COLORS[t.category] || '#64748b'}20;
            padding:2px 8px;border-radius:4px;font-weight:600">${t.category}</span>
        </td>
        <td><span style="font-weight:700;font-size:0.9rem;color:${amtColor}">${amtSign}${formatCurrency(t.amount)}</span></td>
        <td><span style="font-size:0.78rem;color:var(--text-secondary)">${t.method}</span></td>
        <td>${badge}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn-icon" onclick="event.stopPropagation();showTxnDetail('${t.id}')" title="View Detail">👁️</button>
            ${t.status === 'fraud' ? `<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();markSafe('${t.id}')">Mark Safe</button>` : ''}
            ${t.status === 'subscription' ? `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();cancelSub('${t.id}')">Cancel</button>` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── Transaction Detail Modal ──────────────────────────────────
function showTxnDetail(id) {
  const t = TRANSACTIONS.find(x => x.id === id);
  if (!t) return;

  const statusInfo = t.status === 'fraud'
    ? `<div style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="font-weight:700;color:#fb7185;margin-bottom:6px">🚨 Fraud Alert Reason</div>
        <div style="font-size:0.85rem;color:var(--text-secondary)">${t.fraudReason || 'Suspicious activity detected'}</div>
       </div>`
    : t.status === 'subscription'
    ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="font-weight:700;color:#fbbf24;margin-bottom:6px">🔄 Recurring Subscription</div>
        <div style="font-size:0.85rem;color:var(--text-secondary)">This is a ${t.freq} auto-pay subscription. Annual cost: ${formatCurrency(Math.abs(t.amount) * 12)}</div>
       </div>`
    : '';

  document.getElementById('modal-title').textContent = `${t.icon} ${t.merchant}`;
  document.getElementById('modal-content').innerHTML = `
    ${statusInfo}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Amount</div>
        <div style="font-size:1.3rem;font-weight:800;color:${t.amount > 0 ? 'var(--accent-emerald)' : t.status==='fraud'?'#fb7185':'var(--text-primary)'}">${t.amount > 0 ? '+' : ''}${formatCurrency(t.amount)}</div>
      </div>
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Date</div>
        <div style="font-size:0.95rem;font-weight:600">${formatDate(t.date)}</div>
      </div>
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Category</div>
        <div style="font-size:0.95rem;font-weight:600">${t.category}</div>
      </div>
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Payment Method</div>
        <div style="font-size:0.95rem;font-weight:600">${t.method}</div>
      </div>
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Country</div>
        <div style="font-size:0.95rem;font-weight:600">${t.country === 'IN' ? '🇮🇳 India' : `⚠️ ${t.country}`}</div>
      </div>
      <div class="glass-card" style="padding:14px">
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">Transaction ID</div>
        <div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t.id.toUpperCase()}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${t.status === 'fraud' ? `<button class="btn btn-danger" onclick="markSafe('${t.id}');closeModal('txn-modal')">✅ Mark as Safe</button><button class="btn btn-primary" onclick="closeModal('txn-modal');toggleChat()">🤖 Ask AI</button>` : ''}
      ${t.status === 'subscription' ? `<button class="btn btn-danger" onclick="cancelSub('${t.id}');closeModal('txn-modal')">🚫 Cancel Subscription</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal('txn-modal')">Close</button>
    </div>`;
  openModal('txn-modal');
}

function markSafe(id) {
  const t = TRANSACTIONS.find(x => x.id === id);
  if (t) { t.status = 'normal'; delete t.fraudReason; }
  applyFilters();
  showToast('Transaction marked as safe', 'success');
}
function cancelSub(id) {
  const t = TRANSACTIONS.find(x => x.id === id);
  if (t) t.status = 'normal';
  applyFilters();
  showToast(`Subscription cancellation for ${t?.merchant} initiated`, 'warning');
}

// Filter vault tabs
function filterVault(cat, btn) {
  document.querySelectorAll('#vault-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (typeof renderVaultGrid === 'function') renderVaultGrid(cat);
}
