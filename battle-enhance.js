(() => {
  const play = (name) => { try { window.gameSound?.[name]?.(); } catch {} };
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'challengeBtn' || b.id === 'acceptChallengeBtn' || b.id === 'rematchBtn') play('fight');
    if (b.id === 'copyBtn' || b.id === 'shareResultBtn') play('attack');
  });
  const result = document.querySelector('#battleResult');
  if (result) {
    const observer = new MutationObserver(() => {
      const text = result.textContent || '';
      if (text.includes('FIGHT!')) play('fight');
      else if (text.includes('YOU WIN')) play('win');
      else if (text.includes('YOU LOST')) play('lose');
      else if (/^3$|^2$|^1$/.test(text.trim())) play('countdown');
    });
    observer.observe(result, {childList:true, subtree:true, characterData:true});
  }
  window.addEventListener('load', () => {
    if (window.APP_LANG === 'ar') document.documentElement.setAttribute('dir','rtl');
  });
})();
