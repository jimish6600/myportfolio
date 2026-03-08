/* ── Main Orchestrator ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  /* Email card — open mailto, fall back to Gmail web after 400ms */
  const emailCard = document.getElementById('email-card');
  if (emailCard) {
    emailCard.addEventListener('click', e => {
      e.preventDefault();
      const mailto = emailCard.href;
      window.location.href = mailto;

      // If no mail client opens within 400ms, open Gmail compose in new tab
      setTimeout(() => {
        const gmailUrl =
          'https://mail.google.com/mail/?view=cm&to=jimishpately50@gmail.com' +
          '&su=Job%20Opportunity%20%E2%80%93%20Jimish%20Patel' +
          '&body=Hi%20Jimish%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20would%20love%20to%20connect%20regarding%20an%20opportunity.%0A%0ARegards%2C';
        window.open(gmailUrl, '_blank');
      }, 400);
    });
  }

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
