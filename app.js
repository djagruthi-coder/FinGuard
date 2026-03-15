/* ============================================================
   app.js – Global utilities, navigation, toast notifications
   ============================================================ */

'use strict';

// ── Toast notifications ──────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  toast.innerHTML = `${icons[type] || '📢'} ${message}`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, duration + 400);
}

// ── Modal controls ───────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ── Chatbot toggle ───────────────────────────────────────────
function toggleChat() {
  const win = document.getElementById('chatbot-window');
  if (win) win.classList.toggle('open');
}

// ── Formatting helpers ───────────────────────────────────────
function formatCurrency(amount) {
  return '₹' + Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function maskString(str) {
  if (!str || str.length < 5) return '••••••';
  return str.substring(0, 2) + '••••' + str.substring(str.length - 3);
}

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.animate-fade-in-up').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ── Export to CSV ────────────────────────────────────────────
function exportTransactions() {
  if (typeof TRANSACTIONS === 'undefined') { showToast('No data to export', 'error'); return; }
  const rows = [['Date','Merchant','Category','Amount','Method','Status']];
  TRANSACTIONS.forEach(t => {
    rows.push([t.date, t.merchant, t.category, t.amount, t.method, t.status]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fingard_transactions.csv';
  a.click();
  showToast('Transactions exported successfully!', 'success');
}

// ── Bank Balance Check ───────────────────────────────────────
function checkBankBalance(btn) {
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="animate-pulse">🔄 Authenticating...</span>';
  
  setTimeout(() => {
    btn.innerHTML = '<span class="animate-pulse">📶 Connecting to Bank...</span>';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      
      const newBalance = 482340 + Math.floor(Math.random() * 500); // Slight variation for realism
      
      // Update UI if on dashboard
      const balanceEl = document.querySelector('.stat-card .stat-value.gradient-text');
      if (balanceEl) {
        balanceEl.textContent = formatCurrency(newBalance);
        balanceEl.classList.add('animate-glow');
        setTimeout(() => balanceEl.classList.remove('animate-glow'), 2000);
      }
      
      showToast('Bank Balance refreshed: ' + formatCurrency(newBalance), 'success');
    }, 1500);
  }, 1000);
}

// ── Sidebar Active State ─────────────────────────────────────
function setActiveNavItem() {
  const path = window.location.pathname;
  const page = path.split("/").pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
window.addEventListener('load', setActiveNavItem);
