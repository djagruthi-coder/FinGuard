/* ============================================================
   auth.js – Simple client-side login check + user profile helper
   ============================================================ */

'use strict';

const USER_STORAGE_KEY = 'finguardUser';

function getUserProfile() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    const sessionUser = raw ? JSON.parse(raw) : null;
    if (sessionUser && sessionUser.mobile) {
      // Prefer the session user data, but try to enrich from DB if available.
      if (window.FinGuardDB && window.FinGuardDB.getUserByMobile) {
        window.FinGuardDB.getUserByMobile(sessionUser.mobile)
          .then((dbUser) => {
            if (dbUser && dbUser.name && !sessionUser.name) {
              sessionUser.name = dbUser.name;
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
            }
          })
          .catch(() => {});
      }
      return sessionUser;
    }
    return null;
  } catch (err) {
    console.warn('Unable to parse user profile', err);
    return null;
  }
}

function requireLogin() {
  const user = getUserProfile();
  return Boolean(user && user.name);
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function applyUserProfile() {
  const user = getUserProfile();
  if (!user) return;

  // Sidebar user block
  const avatar = document.querySelector('.sidebar-bottom .user-avatar');
  const nameEl = document.querySelector('.sidebar-bottom div > div:first-child');
  const statusEl = document.querySelector('.sidebar-bottom div > div:nth-child(2)');

  if (avatar) avatar.textContent = getInitials(user.name);
  if (nameEl) nameEl.textContent = user.name;
  if (statusEl) statusEl.textContent = user.bank ? 'Linked Bank' : 'Guest';

  // Page heading personalization
  const heading = document.querySelector('h1');
  if (heading && heading.textContent.includes('Good')) {
    heading.textContent = `Good ${getTimeOfDay()}, ${user.name.split(' ')[0]} 👋`;
  }
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function logout() {
  localStorage.removeItem(USER_STORAGE_KEY);
  window.location.href = 'login.html';
}

window.addEventListener('load', () => {
  const path = window.location.pathname.split('/').pop();
  const publicPages = ['index.html', 'login.html', ''];

  // Protect pages other than public ones
  if (!publicPages.includes(path) && !requireLogin()) {
    window.location.href = 'login.html';
    return;
  }

  applyUserProfile();
});
