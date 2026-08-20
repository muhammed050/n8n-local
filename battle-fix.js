(() => {
  // Cross-device identity, deterministic monster sync, and robust share links.
  const PLAYER_NAME_KEY = 'who_player_name';
  const originalSetAvatar = window.setAvatar;

  function getPlayerName() { return (localStorage.getItem(PLAYER_NAME_KEY) || '').trim(); }
  function rememberName() {
    const input = document.querySelector('#nameInput');
    const value = input?.value?.trim();
    if (value) localStorage.setItem(PLAYER_NAME_KEY, value.slice(0, 24));
    if (window.monster && value) window.monster.playerName = value.slice(0, 24);
  }
  function normalizeMonster(m, fallbackName) {
    if (!m) return m;
    const copy = JSON.parse(JSON.stringify(m));
    copy.playerName = String(copy.playerName || copy.raw || fallbackName || 'Player').trim().slice(0, 24);
    copy.seed = Number(copy.seed || 0);
    copy.stats = Array.isArray(copy.stats) ? copy.stats : [copy.power || 70, 60, 60, 60];
    return copy;
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#generateBtn')) setTimeout(() => {
      const value = document.querySelector('#nameInput')?.value?.trim();
      if (value) {
        localStorage.setItem(PLAYER_NAME_KEY, value.slice(0, 24));
        if (window.monster) window.monster.playerName = value.slice(0, 24);
      }
    }, 50);
    if (e.target.closest('#acceptChallengeBtn')) {
      const value = getPlayerName() || document.querySelector('#nameInput')?.value?.trim();
      if (value) localStorage.setItem(PLAYER_NAME_KEY, value.slice(0, 24));
    }
  });

  // Always use a short, stable room-code link instead of embedding the monster JSON.
  function shortRoomUrl(code) {
    return location.href.split('#')[0] + '#c=' + encodeURIComponent(String(code || '').toUpperCase());
  }
  function putShortShareLink() {
    const code = window.room?.code;
    const el = document.querySelector('#shareUrl');
    if (code && el) el.textContent = shortRoomUrl(code);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#copyBtn')) {
      const code = window.room?.code;
      if (code) navigator.clipboard?.writeText(shortRoomUrl(code));
    }
  });
  setInterval(putShortShareLink, 500);

  // Accept both the old #challenge=payload and the new compact #c=ROOMCODE format.
  function decodePayload(value) {
    try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; }
  }
  async function openShortRoom(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code || typeof window.supa !== 'function') return;
    try {
      const { data, error } = await window.supa().from('game_battles').select('*').eq('code', code).single();
      if (error || !data || data.status === 'finished') throw new Error('unavailable');
      if (data.opponent) {
        // The room is already occupied; let the normal flow explain that it is full.
        alert('This battle room is already full.');
        return;
      }
      if (typeof window.openChallenge === 'function') {
        window.openChallenge({ ...data.creator, roomCode: data.code });
        return;
      }
      window.incoming = { ...data.creator, roomCode: data.code };
      if (typeof window.show === 'function') window.show('challenge');
    } catch {
      alert('This battle room does not exist or has expired.');
    }
  }
  function processShareHash() {
    const hash = location.hash || '';
    if (hash.startsWith('#c=')) {
      const code = decodeURIComponent(hash.slice(3));
      setTimeout(() => openShortRoom(code), 250);
      return;
    }
    if (hash.startsWith('#challenge=')) {
      const payload = decodePayload(hash.slice(11));
      if (payload) {
        if (payload.roomCode || payload.rootCode || payload.code || payload.liveRoomCode) {
          const code = payload.roomCode || payload.rootCode || payload.code || payload.liveRoomCode;
          setTimeout(() => openShortRoom(code), 250);
        } else if (typeof window.openChallenge === 'function') {
          setTimeout(() => window.openChallenge(payload), 250);
        }
      }
    }
  }
  window.addEventListener('hashchange', processShareHash);
  window.addEventListener('load', processShareHash);

  function renderStableBattle(r) {
    if (!r?.creator || !r?.opponent) return;
    const left = normalizeMonster(r.creator), right = normalizeMonster(r.opponent);
    const leftEl = document.querySelector('#battleLeft'), rightEl = document.querySelector('#battleRight');
    if (leftEl && typeof window.avatarSvg === 'function') leftEl.innerHTML = `<img class="monster-avatar" src="${window.avatarSvg(left)}" alt="${left.playerName || left.name}">`;
    if (rightEl && typeof window.avatarSvg === 'function') rightEl.innerHTML = `<img class="monster-avatar" src="${window.avatarSvg(right)}" alt="${right.playerName || right.name}">`;
    const ln = document.querySelector('#battleLeftName'), rn = document.querySelector('#battleRightName');
    const lp = document.querySelector('#battleLeftPower'), rp = document.querySelector('#battleRightPower');
    if (ln) ln.textContent = left.playerName || left.raw || left.name;
    if (rn) rn.textContent = right.playerName || right.raw || right.name;
    if (lp) lp.textContent = `${left.name} · POWER ${left.power}`;
    if (rp) rp.textContent = `${right.name} · POWER ${right.power}`;
  }
  window.addEventListener('who:battle-sync', e => renderStableBattle(e.detail));
  const patch = () => {
    if (typeof window.renderFight !== 'function') return;
    const original = window.renderFight;
    if (original.__stablePatched) return;
    const wrapped = function(r) { renderStableBattle(r); return original.apply(this, arguments); };
    wrapped.__stablePatched = true;
    window.renderFight = wrapped;
  };
  setTimeout(patch, 0); setTimeout(patch, 100); setTimeout(patch, 500);
  setInterval(() => { if (window.room?.creator && window.room?.opponent) renderStableBattle(window.room); }, 1200);
})();