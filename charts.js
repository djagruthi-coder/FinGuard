/* ============================================================
   charts.js – Chart.js spending analytics (dashboard)
   ============================================================ */

'use strict';

function initCharts() {
  initDonutChart();
  initLineChart();
}

function initDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;

  const data = {
    labels: ['Food', 'Shopping', 'Subscriptions', 'Transport', 'Health', 'Utilities', 'Other'],
    values: [6200, 8400, 3847, 2880, 2260, 2100, 12963]
  };
  const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1', '#475569'];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₹${ctx.parsed.toLocaleString('en-IN')}`
          },
          backgroundColor: '#0d1b2e',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
        }
      }
    }
  });

  // Legend
  const legend = document.getElementById('donut-legend');
  if (!legend) return;
  data.labels.forEach((label, i) => {
    const total = data.values.reduce((a, b) => a + b, 0);
    const pct   = ((data.values[i] / total) * 100).toFixed(0);
    const div   = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;font-size:0.75rem';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:8px;height:8px;border-radius:2px;background:${colors[i]};flex-shrink:0"></div>
        <span style="color:var(--text-secondary)">${label}</span>
      </div>
      <div style="display:flex;gap:10px">
        <span style="color:var(--text-muted)">${pct}%</span>
        <span style="font-weight:600">₹${data.values[i].toLocaleString('en-IN')}</span>
      </div>`;
    legend.appendChild(div);
  });
}

function initLineChart() {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  const months  = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const spending = [28000, 34000, 51000, 31000, 35700, 38650];
  const income   = [75000, 75000, 90000, 75000, 75000, 85000];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Spending',
          data: spending,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Income',
          data: income,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.06)',
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          borderDash: [5, 3]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1b2e',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            callback: v => '₹' + (v/1000).toFixed(0) + 'K'
          }
        }
      }
    }
  });
}
