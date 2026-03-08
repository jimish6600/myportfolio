/* ── Charts & Heatmap Module ─────────────────────────────── */
const Charts = (() => {

  /* LeetCode Donut ---------------------------------------- */
  function renderLeetcodeDonut(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { easySolved, mediumSolved, hardSolved } = data;
    const total = easySolved + mediumSolved + hardSolved;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: [easySolved, mediumSolved, hardSolved],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderColor: 'transparent',
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} solved`,
            },
          },
        },
        animation: { animateRotate: true, duration: 1200 },
      },
      plugins: [{
        id: 'center-text',
        afterDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const cx = width / 2, cy = height / 2;
          ctx.font = `bold ${width * 0.2}px "Space Grotesk", sans-serif`;
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(total, cx, cy - height * 0.06);
          ctx.font = `${width * 0.09}px Inter, sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Solved', cx, cy + height * 0.1);
          ctx.restore();
        },
      }],
    });
  }

  /* Codeforces Rating Chart ------------------------------- */
  function renderCFRating(canvasId, history) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let labels, ratings;
    if (history && history.length > 0) {
      const trimmed = history.slice(-30);
      labels  = trimmed.map(h => {
        const d = new Date(h.ratingUpdateTimeSeconds * 1000);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      });
      ratings = trimmed.map(h => h.newRating);
    } else {
      labels  = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'];
      ratings = [1200, 1350, 1480, 1550, 1620, 1640, 1648];
    }

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(108,99,255,0.4)');
    grad.addColorStop(1, 'rgba(108,99,255,0.0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Rating',
          data: ratings,
          borderColor: '#6c63ff',
          backgroundColor: grad,
          pointBackgroundColor: '#6c63ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,15,46,0.95)',
            borderColor: 'rgba(108,99,255,0.4)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            callbacks: {
              label: ctx => ` Rating: ${ctx.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 6 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748b', font: { size: 10 } },
          },
        },
        animation: { duration: 1400, easing: 'easeInOutQuart' },
      },
    });
  }

  /* GitHub Contribution Heatmap --------------------------- */
  function renderHeatmap(containerId, contributions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const COLS = 53;
    const today = new Date();

    // Ensure exactly 371 days (53 weeks × 7)
    let days = [...contributions];
    while (days.length < 371) days.unshift({ date: '', count: 0, level: 0 });
    days = days.slice(-371);

    // Group into weeks (columns)
    const weeks = [];
    for (let w = 0; w < COLS; w++) {
      weeks.push(days.slice(w * 7, w * 7 + 7));
    }

    const colors = [
      'rgba(255,255,255,0.05)',
      'rgba(108,99,255,0.25)',
      'rgba(108,99,255,0.5)',
      'rgba(108,99,255,0.75)',
      'rgba(108,99,255,1.0)',
    ];

    const totalContribs = days.reduce((s, d) => s + (d.count || 0), 0);
    document.getElementById('contrib-count').textContent = totalContribs.toLocaleString();

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    weeks.forEach(week => {
      const col = document.createElement('div');
      col.className = 'heatmap-col';
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const lvl = Math.min(day.level || 0, 4);
        cell.style.background = colors[lvl];
        if (day.date && day.count !== undefined) {
          cell.title = `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`;
        }
        col.appendChild(cell);
      });
      grid.appendChild(col);
    });

    container.appendChild(grid);
  }

  /* Animated stat counter --------------------------------- */
  function countUp(el, target, duration = 1200) {
    if (!el || isNaN(target)) return;
    const start = performance.now();
    const startVal = 0;
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(startVal + (target - startVal) * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return { renderLeetcodeDonut, renderCFRating, renderHeatmap, countUp };
})();
