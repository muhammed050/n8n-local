(() => {
  // Cross-device identity + deterministic monster sync fixes.
  const PLAYER_NAME_KEY = 'who_player_name';
  const originalSetAvatar = window.setAvatar;

  function getPlayerName() {
    return (localStorage.getItem(PLAYER_NAME_KEY) || '').trim();
  }

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
    // Keep the generated character identity stable across devices.
    copy.seed = Number(copy.seed || 0);
    copy.stats = Array.isArray(copy.stats) ? copy.stats : [copy.power || 70, 60, 60, 60];
    return copy;
  }

  // Capture the user's name immediately after character generation.
  document.addEventListener('click', (e) => {
    if (e.target.closest('#generateBtn')) {
      setTimeout(() => {
        const input = document.querySelector('#nameInput');
        const value = input?.value?.trim();
        if (value) {
          localStorage.setItem(PLAYER_NAME_KEY, value.slice(0, 24));
          if (window.monster) window.monster.playerName = value.slice(0, 24);
        }
      }, 50);
    }
  });

  // Make the stored monster authoritative for the creator and opponent.
  const originalCreateRoom = window.createRoom;
  if (typeof originalCreateRoom === 'function') {
    window.createRoom = function () {
      rememberName();
      if (window.monster) window.monster = normalizeMonster(window.monster, getPlayerName());
      return originalCreateRoom.apply(this, arguments);
    };
  }

  // The original functions are lexical bindings in app.js, so use a capture
  // listener to repair the local object before Accept Battle invokes joinRoom.
  document.addEventListener('click', (e) => {
    if (e.target.closest('#acceptChallengeBtn')) {
      const input = document.querySelector('#nameInput');
      const saved = getPlayerName() || input?.value?.trim();
      if (saved) localStorage.setItem(PLAYER_NAME_KEY, saved.slice(0, 24));
    }
  });

  // Render both sides from the exact JSON saved in game_battles.
  function renderStableBattle(r) {
    if (!r?.creator || !r?.opponent) return;
    const left = normalizeMonster(r.creator);
    const right = normalizeMonster(r.opponent);
    const leftEl = document.querySelector('#battleLeft');
    const rightEl = document.querySelector('#battleRight');
    if (leftEl) leftEl.innerHTML = `<img class="monster-avatar" src="${window.avatarSvg(left)}" alt="${left.playerName || left.name}">`;
    if (rightEl) rightEl.innerHTML = `<img class="monster-avatar" src="${window.avatarSvg(right)}" alt="${right.playerName || right.name}">`;
    const ln = document.querySelector('#battleLeftName');
    const rn = document.querySelector('#battleRightName');
    const lp = document.querySelector('#battleLeftPower');
    const rp = document.querySelector('#battleRightPower');
    if (ln) ln.textContent = left.playerName || left.raw || left.name;
    if (rn) rn.textContent = right.playerName || right.raw || right.name;
    if (lp) lp.textContent = `${left.name} · POWER ${left.power}`;
    if (rp) rp.textContent = `${right.name} · POWER ${right.power}`;
  }

  // If Supabase sync finds the room, always render the exact stored creator
  // and opponent. This prevents each device from regenerating the character.
  window.addEventListener('who:battle-sync', e => renderStableBattle(e.detail));

  // Patch the existing renderFight without replacing its battle logic.
  const patch = () => {
    if (typeof window.renderFight !== 'function') return;
    const original = window.renderFight;
    if (original.__stablePatched) return;
    const wrapped = function (r) {
      renderStableBattle(r);
      return original.apply(this, arguments);
    };
    wrapped.__stablePatched = true;
    window.renderFight = wrapped;
  };
  setTimeout(patch, 0);
  setTimeout(patch, 100);
  setTimeout(patch, 500);

  // Periodically repair the display from the authoritative room object.
  setInterval(() => {
    if (window.room?.creator && window.room?.opponent) renderStableBattle(window.room);
  }, 1200);
})();
