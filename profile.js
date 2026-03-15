/* ============================================================
   profile.js – Profile page storage + editing
   ============================================================ */

'use strict';

const PROFILE_KEY = 'finguardUser';

function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (window.FinGuardDB && window.FinGuardDB.saveUserProfile) {
    try {
      await window.FinGuardDB.saveUserProfile(profile);
    } catch {
      // ignore storage failure
    }
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `${icons[type] || '📢'} ${message}`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2800);
}

function initProfilePage() {
  if (!requireLogin()) return;

  const profile = getProfile();
  const nameInput = document.getElementById('profile-name');
  const phoneInput = document.getElementById('profile-phone');
  const bankInput = document.getElementById('profile-bank');
  const saveBtn = document.getElementById('save-profile');
  const logoutBtn = document.getElementById('logout');
  const messageEl = document.getElementById('profile-message');

  if (!nameInput || !phoneInput || !bankInput || !saveBtn || !logoutBtn) return;

  if (profile) {
    nameInput.value = profile.name || '';
    phoneInput.value = profile.phone || '';
    bankInput.value = profile.bank || '';
  }

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const bank = bankInput.value.trim();

    if (!name) {
      messageEl.textContent = 'Please enter your name.';
      messageEl.style.color = '#d93025';
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      messageEl.textContent = 'Phone number must be 10 digits.';
      messageEl.style.color = '#d93025';
      return;
    }

saveProfile({ name, phone, bank, updatedAt: new Date().toISOString() }).then(() => {
    messageEl.textContent = 'Saved!';
    messageEl.style.color = '#10b981';
    showToast('Profile updated', 'success');
  });
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(PROFILE_KEY);
    window.location.href = 'login.html';
  });
}

window.addEventListener('load', initProfilePage);
