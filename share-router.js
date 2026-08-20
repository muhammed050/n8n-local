(() => {
  const SUPABASE_URL = 'https://pbouvkzalxeragrpsotl.supabase.co';
  const key = window.SUPABASE_PUBLISHABLE_KEY || '';
  const $ = (s) => document.querySelector(s);

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id));
    window.scrollTo(0, 0);
  }

  function decodeChallenge(value) {
    try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; }
  }

  async function openRoom(code) {
    if (!code) return;
    if (!key || !window.supabase) {
      alert('This battle link cannot connect to the live room.');
      return;
    }
    try {
      const client = window.supabase.createClient(SUPABASE_URL, key);
      const { data, error } = await client.from('game_battles').select('*').eq('code', code).single();
      if (error || !data || data.status === 'finished') throw new Error('unavailable');

      const creator = data.creator;
      if (creator) {
        const avatar = $('#challengeEmoji');
        if (avatar && window.avatarSvg) avatar.innerHTML = `<img class="monster-avatar" src="${window.avatarSvg(creator)}" alt="${creator.playerName || creator.name || 'Monster'}">`;
        if ($('#challengeName')) $('#challengeName').textContent = creator.playerName || creator.name || 'Monster';
        if ($('#challengeLore')) $('#challengeLore').textContent = creator.lore || 'Can you beat this creature?';
        if ($('#challengePower')) $('#challengePower').textContent = creator.power || 0;
        if ($('#challengeRarity')) $('#challengeRarity').textContent = creator.rarity || 'EPIC';
      }

      const generate = $('#generateBtn');
      if (generate) generate.dataset.room = code;

      const accept = $('#acceptChallengeBtn');
      if (accept) {
        accept.onclick = () => {
          showScreen('create');
          if (generate) generate.dataset.room = code;
          $('#nameInput')?.focus();
        };
      }

      showScreen('challenge');
    } catch {
      alert('This battle room does not exist, is full, or has already finished.');
    }
  }

  function route() {
    const hash = location.hash || '';
    if (hash.startsWith('#c=')) return openRoom(decodeURIComponent(hash.slice(3)));
    if (hash.startsWith('#room=')) {
      const code = hash.slice(6).trim().toUpperCase();
      const generate = $('#generateBtn');
      if (generate) generate.dataset.room = code;
      showScreen('create');
      $('#nameInput')?.focus();
      return;
    }
    if (hash.startsWith('#challenge=')) {
      const payload = decodeChallenge(hash.slice(11));
      const code = payload?.roomCode || payload?.rootCode || payload?.code;
      if (code) return openRoom(code);
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('load', () => setTimeout(route, 250));
})();
