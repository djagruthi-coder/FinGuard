/* ============================================================
   rewards.js – Gamified rewards & scratch card logic
   ============================================================ */

'use strict';

function initScratchCards() {
  const rewards = JSON.parse(localStorage.getItem('finguard_rewards') || '[]');
  const grid = document.getElementById('scratch-cards-grid');
  if (!grid) return;

  // Clear existing static cards but keep the "Locked" one
  const lockedCard = grid.querySelector('.opacity-50');
  grid.innerHTML = '';
  
  // Add saved rewards
  rewards.forEach(reward => {
    if (reward.scratched) return;
    
    const cardEl = document.createElement('div');
    cardEl.className = 'glass-card p-4 flex flex-col items-center';
    cardEl.innerHTML = `
      <div class="scratch-card-container" id="scratch-container-${reward.id}">
        <canvas class="scratch-card-canvas" id="canvas-${reward.id}" width="200" height="200"></canvas>
        <div class="scratch-card-content">
          <span class="text-4xl mb-2">${reward.type === 'Cashback' ? '💰' : '🎁'}</span>
          <div class="font-bold text-xl">${reward.type === 'Cashback' ? '₹' + reward.amount : reward.amount + '% Off'}</div>
          <div class="text-xs text-secondary">${reward.type}</div>
        </div>
      </div>
      <p class="mt-4 text-xs text-secondary">Earned for ${reward.merchant}</p>
    `;
    grid.appendChild(cardEl);
    
    setupCanvas(reward.id);
  });

  // Re-add locked card
  if (lockedCard) grid.appendChild(lockedCard);
  
  // Update UI count
  const unused = document.getElementById('unused-count');
  if (unused) unused.textContent = rewards.filter(r => !r.scratched).length;
}

function setupCanvas(id) {
  const canvas = document.getElementById(`canvas-${id}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Fill with premium pattern
  const grad = ctx.createLinearGradient(0, 0, 200, 200);
  grad.addColorStop(0, '#2a2a2a');
  grad.addColorStop(1, '#444');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 200, Math.random() * 200, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.font = '700 16px Inter';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('SCRATCH TO WIN', 100, 110);

  let isDrawing = false;
  let scratchedAmount = 0;

  function scratch(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    scratchedAmount++;
    if (scratchedAmount > 50) {
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        canvas.remove();
        markScratched(id);
      }, 500);
    }
  }

  canvas.addEventListener('mousedown', () => isDrawing = true);
  canvas.addEventListener('mousemove', scratch);
  window.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('touchstart', e => { isDrawing = true; e.preventDefault(); });
  canvas.addEventListener('touchmove', e => { scratch(e); e.preventDefault(); });
}

function markScratched(id) {
  const rewards = JSON.parse(localStorage.getItem('finguard_rewards') || '[]');
  const reward = rewards.find(r => r.id == id);
  if (reward) {
    reward.scratched = true;
    localStorage.setItem('finguard_rewards', JSON.stringify(rewards));
    showToast(`You won ${reward.type === 'Cashback' ? '₹' + reward.amount : reward.amount + '% cashback'}!`, 'success');
    
    // Update summary stat
    const countEl = document.getElementById('unused-count');
    if (countEl) countEl.textContent = rewards.filter(r => !r.scratched).length;
  }
}

window.addEventListener('load', initScratchCards);
