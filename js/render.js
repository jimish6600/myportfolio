/* ── DOM Render Module ───────────────────────────────────── */
const Render = (() => {

  /* Skeleton loader util */
  const skel = (w='100%', h='1rem', r='6px') =>
    `<div class="skeleton" style="width:${w};height:${h};border-radius:${r}"></div>`;

  /* ── CP Section ────────────────────────────────────────── */
  function renderCP(data) {
    renderLeetCode(data.leetcode);
    renderCodeforces(data.codeforces);
    renderCodeChef(data.codechef);
  }

  function renderLeetCode(d) {
    const el = document.getElementById('lc-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="cp-stat-row">
        <div class="cp-stat"><span class="cp-stat-val" id="lc-solved">${d.totalSolved}</span><span class="cp-stat-lbl">Solved</span></div>
        <div class="cp-stat"><span class="cp-stat-val">${d.rating}</span><span class="cp-stat-lbl">Rating</span></div>
      </div>
      <div class="lc-breakdown">
        <div class="lc-diff easy">
          <span class="diff-label">Easy</span>
          <div class="diff-bar-wrap"><div class="diff-bar" style="width:${Math.round(d.easySolved/d.totalEasy*100)}%;background:#22c55e"></div></div>
          <span class="diff-count">${d.easySolved}</span>
        </div>
        <div class="lc-diff medium">
          <span class="diff-label">Medium</span>
          <div class="diff-bar-wrap"><div class="diff-bar" style="width:${Math.round(d.mediumSolved/d.totalMedium*100)}%;background:#f59e0b"></div></div>
          <span class="diff-count">${d.mediumSolved}</span>
        </div>
        <div class="lc-diff hard">
          <span class="diff-label">Hard</span>
          <div class="diff-bar-wrap"><div class="diff-bar" style="width:${Math.round(d.hardSolved/d.totalHard*100)}%;background:#ef4444"></div></div>
          <span class="diff-count">${d.hardSolved}</span>
        </div>
      </div>
      <div class="donut-wrap"><canvas id="lc-donut" width="140" height="140"></canvas></div>
    `;
    Charts.renderLeetcodeDonut('lc-donut', d);
    Charts.countUp(document.getElementById('lc-solved'), d.totalSolved);
  }

  function renderCodeforces(d) {
    const el = document.getElementById('cf-stats');
    if (!el) return;
    const rankColor = {
      'newbie':'#808080','pupil':'#008000','specialist':'#03a89e',
      'expert':'#0000ff','candidate master':'#aa00aa','master':'#ff8c00',
      'international master':'#ff8c00','grandmaster':'#ff0000',
      'international grandmaster':'#ff0000','legendary grandmaster':'#ff0000',
    };
    const color = rankColor[(d.rank||'').toLowerCase()] || '#6c63ff';
    el.innerHTML = `
      <div class="cp-stat-row">
        <div class="cp-stat"><span class="cp-stat-val" id="cf-rating">${d.rating}</span><span class="cp-stat-lbl">Rating</span></div>
        <div class="cp-stat"><span class="cp-stat-val" id="cf-max">${d.maxRating}</span><span class="cp-stat-lbl">Max Rating</span></div>
      </div>
      <span class="cp-rank-badge" style="color:${color};border-color:${color}40;background:${color}18">${d.rank||'Specialist'}</span>
      <div class="cf-chart-wrap"><canvas id="cf-chart"></canvas></div>
    `;
    Charts.countUp(document.getElementById('cf-rating'), d.rating);
    Charts.countUp(document.getElementById('cf-max'), d.maxRating);
    Charts.renderCFRating('cf-chart', d.ratingHistory);
  }

  function renderCodeChef(d) {
    const el = document.getElementById('cc-stats');
    if (!el) return;
    const stars = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    el.innerHTML = `
      <div class="cp-stat-row">
        <div class="cp-stat"><span class="cp-stat-val" id="cc-rating">${d.rating}</span><span class="cp-stat-lbl">Rating</span></div>
        <div class="cp-stat"><span class="cp-stat-val" style="color:#f59e0b;letter-spacing:2px">${d.stars}★</span><span class="cp-stat-lbl">Stars</span></div>
      </div>
      <div class="cc-stars">${stars}</div>
      <p class="cc-note">Division 2 · Active competitor</p>
    `;
    Charts.countUp(document.getElementById('cc-rating'), d.rating);
  }

  /* ── GitHub Section ─────────────────────────────────────── */
  function renderGitHub(gh, contributions) {
    // Stats
    const ghStats = document.getElementById('gh-stats');
    if (ghStats) {
      ghStats.innerHTML = `
        <div class="gh-stat"><span class="gh-val" id="gh-repos">${gh.public_repos}</span><span class="gh-lbl">Repos</span></div>
        <div class="gh-stat"><span class="gh-val" id="gh-followers">${gh.followers}</span><span class="gh-lbl">Followers</span></div>
        <div class="gh-stat"><span class="gh-val"><span id="contrib-count">0</span></span><span class="gh-lbl">Contributions/yr</span></div>
      `;
      Charts.countUp(document.getElementById('gh-repos'), gh.public_repos);
      Charts.countUp(document.getElementById('gh-followers'), gh.followers);
    }
    // Heatmap
    Charts.renderHeatmap('heatmap-container', contributions);
  }

  /* ── Loading skeletons ──────────────────────────────────── */
  function showSkeletons() {
    ['lc-stats','cf-stats','cc-stats'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = skel('100%','180px','12px');
    });
    const ghStats = document.getElementById('gh-stats');
    if (ghStats) ghStats.innerHTML = [1,2,3].map(() => skel('80px','50px','8px')).join('');
  }

  return { renderCP, renderGitHub, showSkeletons };
})();
