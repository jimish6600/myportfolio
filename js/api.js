/* ── API Module ──────────────────────────────────────────── */
const API = (() => {

  async function safeFetch(url, timeout = 8000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(id);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  /* LeetCode — tries two live proxy APIs, falls back to static */
  async function fetchLeetCode(username) {
    // API 1: alfa-leetcode-api (Render) — returns totalSolved, easySolved, etc.
    try {
      const data = await safeFetch(
        `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
        10000   // longer timeout — Render free tier has cold starts
      );
      if (data.errors || !data.totalSolved) throw new Error('bad response');
      return {
        rating:      CONFIG.fallback.leetcode.rating,
        rank:        CONFIG.fallback.leetcode.rank,
        totalSolved: data.totalSolved   || CONFIG.fallback.leetcode.totalSolved,
        easySolved:  data.easySolved    || CONFIG.fallback.leetcode.easySolved,
        mediumSolved:data.mediumSolved  || CONFIG.fallback.leetcode.mediumSolved,
        hardSolved:  data.hardSolved    || CONFIG.fallback.leetcode.hardSolved,
        totalEasy:   data.totalEasy     || CONFIG.fallback.leetcode.totalEasy,
        totalMedium: data.totalMedium   || CONFIG.fallback.leetcode.totalMedium,
        totalHard:   data.totalHard     || CONFIG.fallback.leetcode.totalHard,
      };
    } catch { /* try next */ }

    // API 2: leetcode-api on Vercel — reliable secondary source
    try {
      const data = await safeFetch(
        `https://leetcode-api-faisalshohag.vercel.app/${username}`
      );
      if (!data.totalSolved) throw new Error('bad response');
      return {
        rating:      CONFIG.fallback.leetcode.rating,
        rank:        CONFIG.fallback.leetcode.rank,
        totalSolved: data.totalSolved   || CONFIG.fallback.leetcode.totalSolved,
        easySolved:  data.easySolved    || CONFIG.fallback.leetcode.easySolved,
        mediumSolved:data.mediumSolved  || CONFIG.fallback.leetcode.mediumSolved,
        hardSolved:  data.hardSolved    || CONFIG.fallback.leetcode.hardSolved,
        totalEasy:   data.totalEasy     || CONFIG.fallback.leetcode.totalEasy,
        totalMedium: data.totalMedium   || CONFIG.fallback.leetcode.totalMedium,
        totalHard:   data.totalHard     || CONFIG.fallback.leetcode.totalHard,
      };
    } catch { /* fall through to static */ }

    return CONFIG.fallback.leetcode;
  }

  /* Codeforces — official CORS-enabled API */
  async function fetchCodeforces(handle) {
    try {
      const [info, ratingResp] = await Promise.allSettled([
        safeFetch(`https://codeforces.com/api/user.info?handles=${handle}`),
        safeFetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
      ]);

      const user = info.status === 'fulfilled' && info.value.status === 'OK'
        ? info.value.result[0] : null;
      const history = ratingResp.status === 'fulfilled' && ratingResp.value.status === 'OK'
        ? ratingResp.value.result : [];

      return {
        rating: user?.rating       || CONFIG.fallback.codeforces.rating,
        maxRating: user?.maxRating || CONFIG.fallback.codeforces.maxRating,
        rank: user?.rank           || CONFIG.fallback.codeforces.rank,
        maxRank: user?.maxRank     || CONFIG.fallback.codeforces.maxRank,
        ratingHistory: history,
      };
    } catch {
      return CONFIG.fallback.codeforces;
    }
  }

  /* GitHub — official CORS-enabled API */
  async function fetchGitHub(username) {
    try {
      const [user, repos] = await Promise.allSettled([
        safeFetch(`https://api.github.com/users/${username}`),
        safeFetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
      ]);

      const u = user.status === 'fulfilled' ? user.value : null;
      const r = repos.status === 'fulfilled' ? repos.value : [];

      return {
        public_repos: u?.public_repos ?? CONFIG.fallback.github.public_repos,
        followers:    u?.followers    ?? CONFIG.fallback.github.followers,
        following:    u?.following    ?? CONFIG.fallback.github.following,
        name:         u?.name         || 'Jimish Patel',
        bio:          u?.bio          || '',
        repos:        r.slice(0, 6),
      };
    } catch {
      return { ...CONFIG.fallback.github, repos: [] };
    }
  }

  /* GitHub Contributions heatmap */
  async function fetchGitHubContributions(username) {
    try {
      const data = await safeFetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
      );
      return data.contributions || [];
    } catch {
      // Generate synthetic data for last 52 weeks
      const days = [];
      const now = new Date();
      for (let i = 364; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const count = Math.random() < 0.4 ? 0
          : Math.floor(Math.random() * 8);
        days.push({
          date: d.toISOString().split('T')[0],
          count,
          level: count === 0 ? 0 : count < 3 ? 1 : count < 5 ? 2 : count < 7 ? 3 : 4,
        });
      }
      return days;
    }
  }

  /* Load all platforms simultaneously */
  async function fetchAll() {
    const [lc, cf, gh, ghContrib] = await Promise.allSettled([
      fetchLeetCode(CONFIG.handles.leetcode),
      fetchCodeforces(CONFIG.handles.codeforces),
      fetchGitHub(CONFIG.handles.github),
      fetchGitHubContributions(CONFIG.handles.github),
    ]);
    return {
      leetcode:      lc.status === 'fulfilled' ? lc.value : CONFIG.fallback.leetcode,
      codeforces:    cf.status === 'fulfilled' ? cf.value : CONFIG.fallback.codeforces,
      github:        gh.status === 'fulfilled' ? gh.value : CONFIG.fallback.github,
      contributions: ghContrib.status === 'fulfilled' ? ghContrib.value : [],
      codechef:      CONFIG.fallback.codechef,
    };
  }

  return { fetchAll };
})();
