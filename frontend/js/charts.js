/**
 * charts.js — Futuristic clean line chart renderer for SID Tactical Grid
 */

const charts = {};

function renderSolarChart(flares) {
  const ctx = document.getElementById('solarChartClean');
  if (!ctx || !flares?.length) return;

  // Group by date
  const byDate = {};
  flares.forEach(f => {
    const d = (f.beginTime || '').slice(0, 10);
    if (d) byDate[d] = (byDate[d] || 0) + 1;
  });
  const labels = Object.keys(byDate).sort().slice(-15);
  const data = labels.map(d => byDate[d] || 0);

  if (charts.solar) charts.solar.destroy();
  charts.solar = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Solar Flares',
        data,
        borderColor: '#EF4444',
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#050608',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#090B0E',
          titleColor: '#E5E7EB',
          bodyColor: '#6B7280',
          borderColor: 'rgba(255,255,255,0.05)',
          borderWidth: 1,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6B7280', font: { size: 9, family: 'JetBrains Mono' } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.015)', drawBorder: false },
          ticks: { color: '#6B7280', font: { size: 9, family: 'JetBrains Mono' }, precision: 0 }
        }
      }
    }
  });
}
