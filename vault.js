/* ============================================================
   vault.js – Digital Asset Vault with localStorage CRUD
   ============================================================ */

'use strict';

const VAULT_KEY = 'finguard_vault_assets';
const VAULT_PIN = '1234';
let vaultUnlocked = false;
let editingAssetId = null;
let currentVaultFilter = 'all';
let pinBuffer = '';

// ── Sample seed data ─────────────────────────────────────────
const SEED_ASSETS = [
  {
    id:'va001', type:'bank', name:'HDFC Savings Account', institution:'HDFC Bank',
    accountId:'XXXX4821', value:482340, contact:'Priya Kumar - priya@email.com',
    notes:'Primary savings account. Passbook in home locker. ATM PIN: stored in phone notes.',
    createdAt:'2026-01-10'
  },
  {
    id:'va002', type:'crypto', name:'Bitcoin Cold Wallet', institution:'Ledger Nano',
    accountId:'1A2b3C4d5E6f7G8h9I0j...', value:1250000, contact:'Rahul Kumar - 9876543210',
    notes:'24-word recovery phrase written on paper stored in bank locker. Do NOT store digitally.',
    createdAt:'2026-01-15'
  },
  {
    id:'va003', type:'investment', name:'Zerodha Portfolio', institution:'Zerodha',
    accountId:'ZR882344', value:380000, contact:'Priya Kumar - priya@email.com',
    notes:'Stocks & MF. 2FA via phone. Nominee: Priya Kumar (wife). App password stored in KeePass.',
    createdAt:'2026-01-20'
  },
  {
    id:'va004', type:'insurance', name:'LIC Money Back Policy', institution:'LIC India',
    accountId:'LIC-7843291', value:500000, contact:'LIC Agent: Ram Kumar - 9988776655',
    notes:'Policy maturity: 2034. Premium ₹8,500/year. Nominee: Priya Kumar. Physical bond in home locker.',
    createdAt:'2026-02-01'
  },
  {
    id:'va005', type:'investment', name:'PPF Account', institution:'SBI Bank',
    accountId:'PPF-88721643', value:245000, contact:'Priya Kumar - priya@email.com',
    notes:'Lock-in till 2031. Annual contribution ₹1,50,000. Auto-debit from SBI account.',
    createdAt:'2026-02-10'
  },
  {
    id:'va006', type:'bank', name:'SBI Fixed Deposit', institution:'State Bank of India',
    accountId:'FD-7723948', value:500000, contact:'SBI Branch Manager - 9944556677',
    notes:'5-year FD. Maturity: Nov 2028. Reinvestment mode. Receipt in bank locker.',
    createdAt:'2026-02-12'
  }
];

const TYPE_CONFIG = {
  bank:       { icon:'🏦', label:'Bank Account',        color:'rgba(59,130,246,0.15)',   border:'rgba(59,130,246,0.3)'   },
  crypto:     { icon:'₿',  label:'Crypto Wallet',       color:'rgba(245,158,11,0.15)',   border:'rgba(245,158,11,0.3)'   },
  investment: { icon:'📈', label:'Investment',          color:'rgba(139,92,246,0.15)',   border:'rgba(139,92,246,0.3)'   },
  insurance:  { icon:'🛡️', label:'Insurance Policy',    color:'rgba(16,185,129,0.15)',   border:'rgba(16,185,129,0.3)'   },
  password:   { icon:'🔑', label:'Password / Key',      color:'rgba(244,63,94,0.15)',    border:'rgba(244,63,94,0.3)'    },
};

// ── PIN Input Logic ───────────────────────────────────────────
function pinInput(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updatePinDots();
}
function pinClear() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
}
function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < pinBuffer.length);
  }
}
function pinSubmit() {
  if (pinBuffer === VAULT_PIN) {
    vaultUnlocked = true;
    const lockScreen = document.getElementById('vault-lock');
    if (lockScreen) {
      lockScreen.style.opacity = '0';
      lockScreen.style.transform = 'scale(1.05)';
      lockScreen.style.transition = 'all 0.4s ease';
      setTimeout(() => lockScreen.remove(), 400);
    }
  } else {
    pinBuffer = '';
    updatePinDots();
    const errEl = document.getElementById('pin-error');
    if (errEl) {
      errEl.style.display = 'block';
      setTimeout(() => errEl.style.display = 'none', 2000);
    }
  }
}

// Add keyboard support for PIN
document.addEventListener('keydown', (e) => {
  if (!vaultUnlocked && document.getElementById('vault-lock')) {
    if (e.key >= '0' && e.key <= '9') pinInput(parseInt(e.key));
    else if (e.key === 'Backspace') pinClear();
    else if (e.key === 'Enter') pinSubmit();
  }
});

// ── Storage helpers ───────────────────────────────────────────
function loadAssets() {
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) {
    saveAssets(SEED_ASSETS);
    return SEED_ASSETS;
  }
  return JSON.parse(raw);
}
function saveAssets(assets) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(assets));
}

// ── Vault Init ────────────────────────────────────────────────
function initVault() {
  // Delay rendering until unlock
  const lockEl = document.getElementById('vault-lock');
  if (lockEl) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById('vault-lock')) {
        renderVaultGrid('all');
        updateVaultStats();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    renderVaultGrid('all');
    updateVaultStats();
  }
}

// ── Render Grid ───────────────────────────────────────────────
function renderVaultGrid(filter = 'all') {
  currentVaultFilter = filter;
  const assets = loadAssets();
  const filtered = filter === 'all' ? assets : assets.filter(a => a.type === filter);
  const grid = document.getElementById('vault-grid');
  const empty = document.getElementById('vault-empty');
  if (!grid) return;

  updateVaultStats();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  grid.innerHTML = filtered.map(asset => {
    const cfg = TYPE_CONFIG[asset.type] || TYPE_CONFIG.bank;
    return `
      <div class="asset-card glass-card" style="border-color:${cfg.border}">
        <div class="asset-card-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="asset-type-icon" style="background:${cfg.color};font-size:1.3rem">${cfg.icon}</div>
            <div>
              <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:2px">${cfg.label}</div>
              <div style="font-weight:700;font-size:0.95rem">${asset.name}</div>
            </div>
          </div>
          <div class="asset-card-actions">
            <button class="btn-icon" onclick="viewAsset('${asset.id}')" title="View">👁️</button>
            <button class="btn-icon" onclick="openAssetModal('${asset.id}')" title="Edit">✏️</button>
            <button class="btn-icon" onclick="deleteAsset('${asset.id}')" title="Delete" style="color:var(--accent-rose)">🗑️</button>
          </div>
        </div>

        <div class="asset-field">
          <label>Institution</label>
          <div class="asset-field-value">${asset.institution || '—'}</div>
        </div>

        <div class="asset-field">
          <label>Account / ID</label>
          <div class="asset-field-value masked" id="id-${asset.id}">
            ${maskString(asset.accountId)}
            <button class="toggle-mask" onclick="toggleMask('${asset.id}','${asset.accountId}')">👁️</button>
          </div>
        </div>

        ${asset.value ? `
        <div class="asset-field">
          <label>Estimated Value</label>
          <div class="asset-field-value" style="color:var(--accent-emerald);font-weight:700">${formatCurrency(asset.value)}</div>
        </div>` : ''}

        <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.7rem;color:var(--text-muted)">Added ${formatDate(asset.createdAt)}</span>
          ${asset.contact ? `<span style="font-size:0.7rem;color:#60a5fa">🆘 Contact set</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

let maskStates = {};
function toggleMask(id, original) {
  maskStates[id] = !maskStates[id];
  const el = document.getElementById(`id-${id}`);
  if (!el) return;
  const btn = el.querySelector('.toggle-mask');
  const text = maskStates[id] ? original : maskString(original);
  el.innerHTML = `<span class="${maskStates[id] ? '' : 'masked'}">${text}</span>
    <button class="toggle-mask" onclick="toggleMask('${id}','${original}')">${maskStates[id] ? '🙈' : '👁️'}</button>`;
}

function updateVaultStats() {
  const assets = loadAssets();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('vault-total-count', assets.length);
  set('vault-bank-count', assets.filter(a => a.type === 'bank').length);
  set('vault-crypto-count', assets.filter(a => a.type === 'crypto').length);
  set('vault-invest-count', assets.filter(a => a.type === 'investment').length);
}

// ── View Asset Detail ─────────────────────────────────────────
function viewAsset(id) {
  const assets = loadAssets();
  const asset  = assets.find(a => a.id === id);
  if (!asset) return;
  const cfg = TYPE_CONFIG[asset.type] || TYPE_CONFIG.bank;

  document.getElementById('view-asset-title').textContent = `${cfg.icon} ${asset.name}`;
  document.getElementById('view-asset-content').innerHTML = `
    <div style="background:${cfg.color};border:1px solid ${cfg.border};border-radius:12px;padding:16px;margin-bottom:20px;text-align:center">
      <div style="font-size:2rem;margin-bottom:4px">${cfg.icon}</div>
      <div style="font-weight:700">${cfg.label}</div>
      <div style="font-size:0.8rem;color:var(--text-secondary)">${asset.institution || ''}</div>
      ${asset.value ? `<div style="font-size:1.3rem;font-weight:800;margin-top:8px;color:var(--accent-emerald)">${formatCurrency(asset.value)}</div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:12px">
        <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Account / Wallet ID</div>
        <div style="font-weight:600;font-family:monospace;word-break:break-all">${asset.accountId || '—'}</div>
      </div>
      ${asset.contact ? `
      <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:12px">
        <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">🆘 Emergency Contact</div>
        <div style="font-weight:600">${asset.contact}</div>
      </div>` : ''}
      ${asset.notes ? `
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:12px">
        <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px">🔒 Secure Notes</div>
        <div style="font-size:0.85rem;line-height:1.6;color:var(--text-secondary)">${asset.notes}</div>
      </div>` : ''}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openAssetModal('${id}');closeModal('view-asset-modal')">✏️ Edit</button>
      <button class="btn btn-danger" onclick="deleteAsset('${id}');closeModal('view-asset-modal')">🗑️ Delete</button>
      <button class="btn btn-secondary" onclick="closeModal('view-asset-modal')">Close</button>
    </div>`;
  openModal('view-asset-modal');
}

// ── Add / Edit Asset Modal ────────────────────────────────────
function openAssetModal(id = null) {
  editingAssetId = id;
  const titleEl = document.getElementById('asset-modal-title');
  if (id) {
    const assets = loadAssets();
    const asset  = assets.find(a => a.id === id);
    if (!asset) return;
    titleEl.textContent = '✏️ Edit Asset';
    document.getElementById('asset-type').value        = asset.type || '';
    document.getElementById('asset-name').value        = asset.name || '';
    document.getElementById('asset-institution').value = asset.institution || '';
    document.getElementById('asset-account-id').value  = asset.accountId || '';
    document.getElementById('asset-value').value       = asset.value || '';
    document.getElementById('asset-contact').value     = asset.contact || '';
    document.getElementById('asset-notes').value       = asset.notes || '';
  } else {
    titleEl.textContent = '+ Add Digital Asset';
    document.getElementById('asset-form').reset();
  }
  openModal('asset-modal');
}

function saveAsset(e) {
  e.preventDefault();
  const assets = loadAssets();
  const assetData = {
    type:        document.getElementById('asset-type').value,
    name:        document.getElementById('asset-name').value,
    institution: document.getElementById('asset-institution').value,
    accountId:   document.getElementById('asset-account-id').value,
    value:       parseFloat(document.getElementById('asset-value').value) || 0,
    contact:     document.getElementById('asset-contact').value,
    notes:       document.getElementById('asset-notes').value,
  };

  if (editingAssetId) {
    const idx = assets.findIndex(a => a.id === editingAssetId);
    if (idx !== -1) assets[idx] = { ...assets[idx], ...assetData };
    showToast('Asset updated successfully!', 'success');
  } else {
    assetData.id = 'va' + Date.now();
    assetData.createdAt = new Date().toISOString().split('T')[0];
    assets.push(assetData);
    showToast('Asset added to vault!', 'success');
  }

  saveAssets(assets);
  closeModal('asset-modal');
  renderVaultGrid(currentVaultFilter);
  editingAssetId = null;
}

function deleteAsset(id) {
  if (!confirm('Delete this asset from the vault? This cannot be undone.')) return;
  const assets = loadAssets().filter(a => a.id !== id);
  saveAssets(assets);
  renderVaultGrid(currentVaultFilter);
  showToast('Asset deleted', 'warning');
}

// ── Emergency Share / Print ───────────────────────────────────
function emergencyShare() {
  const assets = loadAssets();
  const rows = assets.map(a => {
    const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.bank;
    return `
      <tr>
        <td style="padding:10px;border:1px solid #ddd">${cfg.icon} ${cfg.label}</td>
        <td style="padding:10px;border:1px solid #ddd"><strong>${a.name}</strong></td>
        <td style="padding:10px;border:1px solid #ddd">${a.institution || '—'}</td>
        <td style="padding:10px;border:1px solid #ddd">${a.accountId || '—'}</td>
        <td style="padding:10px;border:1px solid #ddd">${a.value ? '₹' + a.value.toLocaleString() : '—'}</td>
        <td style="padding:10px;border:1px solid #ddd">${a.contact || '—'}</td>
      </tr>`;
  }).join('');

  const totalValue = assets.reduce((s, a) => s + (a.value || 0), 0);
  const printHTML = `
    <!DOCTYPE html><html>
    <head><title>FinGuard Emergency Document – ${new Date().toLocaleDateString()}</title>
    <style>body{font-family:Arial;color:#000;padding:40px} h1{color:#1e3a5f} .header{border-bottom:2px solid #1e3a5f;margin-bottom:20px;padding-bottom:10px} table{width:100%;border-collapse:collapse;margin-top:20px} th{background:#1e3a5f;color:white;padding:10px} .warning{background:#fff3cd;border:1px solid #ffc107;padding:12px;border-radius:4px;margin:20px 0}</style>
    </head>
    <body>
    <div class="header">
      <h1>🛡️ FinGuard – Emergency Financial Document</h1>
      <p>Account Holder: <strong>Arjun Kumar</strong> | Generated: ${new Date().toLocaleString()}</p>
    </div>
    <div class="warning">⚠️ <strong>CONFIDENTIAL</strong> – This document contains sensitive financial information. Keep in a secure location.</div>
    <h2>📋 Digital Asset Registry</h2>
    <table>
      <thead><tr><th>Type</th><th>Asset</th><th>Institution</th><th>Account/ID</th><th>Est. Value</th><th>Emergency Contact</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:20px"><strong>Total Estimated Value: ₹${totalValue.toLocaleString()}</strong></p>
    <p style="color:#666;font-size:0.8rem;margin-top:30px">This document was generated by FinGuard Digital Asset Vault. Please verify all details with respective institutions.</p>
    </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(printHTML);
  win.document.close();
  win.print();

  showToast('Emergency document opened for printing', 'success');
}
