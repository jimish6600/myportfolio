/* ── Main Orchestrator ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  /* Boot visual effects first (no async needed) */
  Background.init();
  FX.init();

  /* Show loading skeletons */
  Render.showSkeletons();

  /* Fetch all live data */
  const data = await API.fetchAll();

  /* Render dynamic sections */
  Render.renderCP(data);
  Render.renderGitHub(data.github, data.contributions);

  /* Re-run tilt after dynamic cards are inserted */
  setTimeout(() => FX.initTilt(), 200);
});
