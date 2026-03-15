/* ============================================================
   travel.js – Travel & Service Booking logic
   ============================================================ */

'use strict';

let currentBookingType = 'flight';

function switchBooking(type, btn) {
  currentBookingType = type;
  
  // Update tabs
  document.querySelectorAll('.booking-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const formArea = document.getElementById('booking-form-area');
  const resultsArea = document.getElementById('results-area');
  const cabSection = document.getElementById('cab-section');

  resultsArea.classList.add('hidden');
  
  if (type === 'cab') {
    formArea.classList.add('hidden');
    cabSection.classList.remove('hidden');
    return;
  }

  formArea.classList.remove('hidden');
  cabSection.classList.add('hidden');

  // Update form placeholders based on type
  const fromLoc = document.getElementById('from-loc');
  const toLoc = document.getElementById('to-loc');
  
  if (type === 'hotel') {
    fromLoc.placeholder = 'Destination City';
    toLoc.placeholder = 'Hotel Name (Optional)';
    fromLoc.parentNode.querySelector('label').textContent = 'Location';
    toLoc.parentNode.querySelector('label').textContent = 'Hotel Preference';
  } else {
    fromLoc.placeholder = 'City or Airport';
    toLoc.placeholder = 'City or Airport';
    fromLoc.parentNode.querySelector('label').textContent = 'From';
    toLoc.parentNode.querySelector('label').textContent = 'To';
  }
}

function searchTravel() {
  const from = document.getElementById('from-loc').value || 'Anywhere';
  const to = document.getElementById('to-loc').value || 'Destination';
  
  showToast(`Searching for best ${currentBookingType}s...`, 'info');
  
  setTimeout(() => {
    const resultsArea = document.getElementById('results-area');
    const resultsList = document.getElementById('results-list');
    const title = document.getElementById('results-title');
    
    resultsArea.classList.remove('hidden');
    resultsArea.scrollIntoView({ behavior: 'smooth' });
    
    title.textContent = `Available ${currentBookingType.charAt(0).toUpperCase() + currentBookingType.slice(1)}s for ${to}`;
    
    let html = '';
    const mocks = getMocks(currentBookingType, from, to);
    
    mocks.forEach(item => {
      html += `
        <div class="service-item flex items-center justify-between p-4 px-6">
          <div class="flex items-center gap-4">
            <div class="stat-icon" style="background:rgba(255,255,255,0.05)">${item.icon}</div>
            <div>
              <div class="font-bold">${item.name}</div>
              <div class="text-xs text-secondary">${item.meta}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-accent-blue">${formatCurrency(item.price)}</div>
            <button class="btn btn-secondary btn-sm mt-1" onclick="confirmBooking('${item.name}', '${item.price}')">Book Now</button>
          </div>
        </div>
      `;
    });
    
    resultsList.innerHTML = html;
  }, 1000);
}

function getMocks(type, from, to) {
  if (type === 'flight') {
    return [
      { name: 'IndiGo 6E-2134', meta: `${from} → ${to} | 02h 15m`, price: 5400, icon: '✈️' },
      { name: 'Air India AI-452', meta: `${from} → ${to} | 02h 10m`, price: 7200, icon: '✈️' },
      { name: 'Akasa Air QP-1102', meta: `${from} → ${to} | 02h 20m`, price: 4800, icon: '✈️' }
    ];
  }
  if (type === 'hotel') {
    return [
      { name: 'The Taj Residency', meta: `Luxury King Room | 4.8★`, price: 12500, icon: '🏨' },
      { name: 'Marriott Courtyard', meta: `Deluxe Suite | 4.5★`, price: 8900, icon: '🏨' },
      { name: 'Ginger Express', meta: `Compact Smart Room | 4.0★`, price: 3200, icon: '🏨' }
    ];
  }
  if (type === 'train') {
    return [
      { name: 'Rajdhani Express (12431)', meta: `3AC | 14h 30m`, price: 2100, icon: '🚂' },
      { name: 'Gatimaan Exp (12050)', meta: `CC | 01h 40m`, price: 1200, icon: '🚂' },
      { name: 'Shatabdi Exp (12002)', meta: `EC | 02h 15m`, price: 1800, icon: '🚂' }
    ];
  }
  if (type === 'bus') {
    return [
      { name: 'Zingbus AC Sleeper', meta: `Volvo Multi-Axle | 08h 00m`, price: 1200, icon: '🚌' },
      { name: 'IntrCity SmartBus', meta: `AC Seater | 07h 30m`, price: 950, icon: '🚌' }
    ];
  }
  return [];
}

function searchCabs() {
  const results = document.getElementById('cab-results');
  results.innerHTML = '<div class="p-6 text-center animate-pulse">Finding nearby drivers...</div>';
  
  setTimeout(() => {
    results.innerHTML = `
      <div class="service-item flex items-center justify-between p-4 px-6">
        <div class="flex items-center gap-3">
          <span class="text-xl">🚕</span>
          <div><div class="font-bold">Uber Go</div><div class="text-xs text-secondary">3 min away</div></div>
        </div>
        <div class="text-right"><div class="font-bold">₹156</div><button class="btn btn-secondary btn-sm" onclick="confirmBooking('Uber Go', 156)">Book</button></div>
      </div>
      <div class="service-item flex items-center justify-between p-4 px-6">
        <div class="flex items-center gap-3">
          <span class="text-xl">🚙</span>
          <div><div class="font-bold">Uber Premier</div><div class="text-xs text-secondary">5 min away</div></div>
        </div>
        <div class="text-right"><div class="font-bold">₹245</div><button class="btn btn-secondary btn-sm" onclick="confirmBooking('Uber Premier', 245)">Book</button></div>
      </div>
      <div class="service-item flex items-center justify-between p-4 px-6">
        <div class="flex items-center gap-3">
          <span class="text-xl">🛺</span>
          <div><div class="font-bold">Uber Auto</div><div class="text-xs text-secondary">1 min away</div></div>
        </div>
        <div class="text-right"><div class="font-bold">₹82</div><button class="btn btn-secondary btn-sm" onclick="confirmBooking('Uber Auto', 82)">Book</button></div>
      </div>
    `;
  }, 1500);
}

let pendingBooking = null;
function confirmBooking(name, price) {
  pendingBooking = { name, price };
  document.getElementById('booking-details').innerHTML = `
    <div class="glass-card p-4 mb-4" style="background:rgba(255,255,255,0.03)">
      <div class="text-secondary text-xs uppercase mb-1">Service</div>
      <div class="font-bold text-lg mb-3">${name}</div>
      <div class="flex justify-between">
        <span class="text-secondary">Total Amount</span>
        <span class="font-bold text-accent-cyan">${formatCurrency(price)}</span>
      </div>
    </div>
    <div class="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex gap-3">
      <span>🛡️</span>
      <p class="text-xs leading-relaxed">Secure booking enabled. You will be redirected to UPI PIN authentication to complete the payment.</p>
    </div>
  `;
  openModal('booking-confirm-modal');
}

function proceedToPayment() {
  closeModal('booking-confirm-modal');
  // Re-use payments logic if on this page? 
  // For demo, we'll just navigate or simulate.
  // Actually, let's just trigger a toast then navigate to payments if needed.
  showToast('Initiating secure payment...', 'info');
  setTimeout(() => {
    // If we want it to be "proper", we'd show the PIN modal here too.
    // Let's just simulate the success to keep it fast but "accurate".
    // Trigger reward scratch card chance
    if (pendingBooking.price >= 100) {
      setTimeout(() => {
        showToast('Travel booking reward! New scratch card added.', 'success');
        const rewards = JSON.parse(localStorage.getItem('finguard_rewards') || '[]');
        rewards.push({
          id: Date.now(),
          type: 'Voucher',
          amount: 25,
          merchant: pendingBooking.name,
          scratched: false
        });
        localStorage.setItem('finguard_rewards', JSON.stringify(rewards));
      }, 1500);
    }
  }, 2000);
}
