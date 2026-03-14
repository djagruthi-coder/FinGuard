/* ============================================================
   payments.js – UPI logic, QR scanner simulation, Billing
   ============================================================ */

'use strict';

let upiPinBuffer = '';
const CORRECT_UPI_PIN = '1234'; // Demo PIN
let currentPaymentData = { target: '', amount: 0 };

// ── UPI PIN Logic ────────────────────────────────────────────
function upiPinInput(digit) {
  if (upiPinBuffer.length >= 4) return;
  upiPinBuffer += digit;
  updateUpiPinDots();
}
function upiPinClear() {
  upiPinBuffer = upiPinBuffer.slice(0, -1);
  updateUpiPinDots();
}
function updateUpiPinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`upi-dot-${i}`);
    if (dot) dot.classList.toggle('filled', i < upiPinBuffer.length);
  }
}
function upiPinSubmit() {
  if (upiPinBuffer === CORRECT_UPI_PIN) {
    processPaymentSuccess();
  } else {
    upiPinBuffer = '';
    updateUpiPinDots();
    showToast('Incorrect UPI PIN. Please try again.', 'error');
  }
}

// ── Payment Flow ─────────────────────────────────────────────
function openUPIModal() {
  document.getElementById('payment-modal-title').textContent = 'UPI Transfer';
  document.getElementById('payment-id-label').textContent = 'UPI ID or Mobile Number';
  document.getElementById('payment-target').value = '';
  document.getElementById('payment-amount').value = '';
  openModal('upi-modal');
}

function openBillModal(billType) {
  document.getElementById('payment-modal-title').textContent = `${billType} Payment`;
  document.getElementById('payment-id-label').textContent = `${billType} Consumer ID / Number`;
  
  // Dynamic provider list for demo
  const providers = {
    'Electricity': ['TATA Power', 'BESCOM', 'Adani Electricity', 'MSEB'],
    'Water': ['Municipal Corporation', 'Water Board', 'BWSSB'],
    'Gas': ['Bharat Gas', 'Indane Gas', 'HP Gas'],
    'Mobile Recharge': ['Jio', 'Airtel', 'Vi', 'BSNL'],
    'DTH': ['Tata Play', 'Airtel DTH', 'DishTV', 'Sun Direct'],
    'Broadband': ['Airtel Xstream', 'JioFiber', 'ACT Fibernet']
  };

  const providerList = providers[billType] || [];
  const targetInput = document.getElementById('payment-target');
  targetInput.value = '';
  targetInput.placeholder = providerList.length > 0 ? `Select ${billType} Provider...` : `Enter ${billType} ID`;
  
  // For demo, we'll auto-populate a random provider if list exists
  if (providerList.length > 0) {
    targetInput.value = providerList[Math.floor(Math.random() * providerList.length)];
  }

  document.getElementById('payment-amount').value = '';
  openModal('upi-modal');
}

function initiatePayment() {
  const target = document.getElementById('payment-target').value;
  const amount = document.getElementById('payment-amount').value;

  if (!target || !amount || amount <= 0) {
    showToast('Please enter valid payment details', 'error');
    return;
  }

  currentPaymentData = { target, amount };
  closeModal('upi-modal');
  
  // Update PIN modal info
  document.getElementById('pin-pay-amount').textContent = formatCurrency(amount);
  document.getElementById('pin-pay-target').textContent = target;
  
  openModal('pin-modal');
}

function processPaymentSuccess() {
  closeModal('pin-modal');
  upiPinBuffer = '';
  updateUpiPinDots();
  
  showToast('Payment successful!', 'success');
  
  // Simulate transaction appearing in history
  if (typeof TRANSACTIONS !== 'undefined') {
    TRANSACTIONS.unshift({
      id: 'txn' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      merchant: currentPaymentData.target,
      category: 'Bills',
      amount: -currentPaymentData.amount,
      method: 'UPI',
      country: 'IN',
      status: 'normal',
      icon: '💸'
    });
  }
  
  // Trigger reward scratch card chance
  if (currentPaymentData.amount >= 100) {
    setTimeout(() => {
      showToast('You earned a scratch card! Visit Rewards section.', 'success');
      // Store the reward in localStorage for the rewards page to see
      const rewards = JSON.parse(localStorage.getItem('finguard_rewards') || '[]');
      rewards.push({
        id: Date.now(),
        type: currentPaymentData.amount > 500 ? 'Cashback' : 'Voucher',
        amount: Math.floor(Math.random() * 50) + 10,
        merchant: currentPaymentData.target,
        scratched: false
      });
      localStorage.setItem('finguard_rewards', JSON.stringify(rewards));
    }, 1500);
  }
}

// ── QR Scanner Logic ──────────────────────────────────────────
function openScanner() {
  openModal('scanner-modal');
}

function simulateQRSuccess() {
  closeModal('scanner-modal');
  document.getElementById('payment-modal-title').textContent = 'Scan & Pay';
  document.getElementById('payment-id-label').textContent = 'Scanned Merchant';
  document.getElementById('payment-target').value = 'Starbucks Coffee (QR)';
  document.getElementById('payment-amount').value = '';
  openModal('upi-modal');
}
