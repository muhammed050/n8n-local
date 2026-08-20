(() => {
  const URL = 'https://pbouvkzalxeragrpsotl.supabase.co';
  const KEY = window.SUPABASE_PUBLISHABLE_KEY || '';
  let db = null, timer = null, code = null, busy = false, booted = false;
  const getDb = () => {
    if (!KEY || !window.supabase) return null;
    return db || (db = window.supabase.createClient(URL, KEY));
  };
  const playerId = () => localStorage.getItem('who_player_id') || '';
  const getCode = () => window.getLiveBattleCode?.() || (location.hash.startsWith('#c=') ? location.hash.slice(3).toUpperCase() : '');
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

  function ensureReadyUI() {
    const battle = document.querySelector('#battle .battle');
    if (!battle || document.querySelector('#readyRoomPanel')) return false;
    const panel = document.createElement('div');
    panel.id = 'readyRoomPanel';
    panel.innerHTML = `
      <div class="ready-room-title">⚔️ ROOM READY</div>
      <div id="readyRoomCode" class="ready-room-code"></div>
      <div id="readyPlayers" class="ready-players"></div>
      <button id="readyBtn" class="primary wide" type="button">I AM READY ⚔️</button>
      <div id="readyHint" class="hint">Waiting for both players…</div>`;
    const share = document.querySelector('#shareUrl');
    battle.insertBefore(panel, share || battle.firstChild);
    document.querySelector('#readyBtn').addEventListener('click', setReady);
    return true;
  }

  async function fetchRoom() {
    const c = code || getCode();
    const client = getDb();
    if (!c || !client) return null;
    const { data } = await client.from('game_battles').select('*').eq('code', c).maybeSingle();
    return data || null;
  }

  function mySide(r) {
    const id = playerId();
    if (r?.creator_id === id) return 'creator';
    if (r?.opponent_id === id) return 'opponent';
    return null;
  }

  function readyValue(m) { return !!m?.ready; }

  function paint(r) {
    if (!ensureReadyUI()) return;
    const side = mySide(r);
    const cReady = readyValue(r?.creator);
    const oReady = readyValue(r?.opponent);
    const bothPlayers = !!r?.creator && !!r?.opponent;
    const bothReady = bothPlayers && cReady && oReady;
    const codeEl = document.querySelector('#readyRoomCode');
    const players = document.querySelector('#readyPlayers');
    const btn = document.querySelector('#readyBtn');
    const hint = document.querySelector('#readyHint');
    if (codeEl) codeEl.textContent = r?.code ? `ROOM ${r.code}` : '';
    if (players) players.innerHTML = `<span>${cReady ? '🟢' : '⚪'} ${esc(r?.creator?.playerName || r?.creator?.raw || r?.creator?.name || 'Player 1')}</span><span>${oReady ? '🟢' : '⚪'} ${esc(r?.opponent?.playerName || r?.opponent?.raw || r?.opponent?.name || 'Player 2')}</span>`;
    if (btn) {
      const mineReady = side === 'creator' ? cReady : side === 'opponent' ? oReady : false;
      btn.disabled = !side || !bothPlayers || mineReady || r?.status === 'finished';
      btn.textContent = mineReady ? 'READY ✓' : 'I AM READY ⚔️';
    }
    if (hint) {
      if (!bothPlayers) hint.textContent = 'Waiting for the second player to join the room…';
      else if (bothReady) hint.textContent = 'Both players are ready! Starting battle…';
      else hint.textContent = `${cReady ? 'Player 1 ready' : 'Player 1 not ready'} · ${oReady ? 'Player 2 ready' : 'Player 2 not ready'}`;
    }
    if (bothReady && r.status !== 'ready' && r.status !== 'finished') startBattle(r);
  }

  async function setReady() {
    if (busy) return;
    busy = true;
    try {
      const r = await fetchRoom();
      const side = mySide(r);
      if (!r || !side || !r.creator || !r.opponent) return;
      const mine = JSON.parse(JSON.stringify(side === 'creator' ? r.creator : r.opponent));
      mine.ready = true;
      const patch = side === 'creator' ? { creator: mine } : { opponent: mine };
      const { error } = await getDb().from('game_battles').update(patch).eq('code', r.code).neq('status','finished');
      if (error) throw error;
      paint(await fetchRoom());
    } catch (_) {
      const hint = document.querySelector('#readyHint');
      if (hint) hint.textContent = 'Could not update READY. Please try again.';
    } finally { busy = false; }
  }

  async function startBattle(r) {
    if (r.status === 'ready' || r.status === 'finished') return;
    const { error } = await getDb().from('game_battles').update({ status: 'ready' }).eq('code', r.code).eq('status','waiting');
    if (!error) {
      const hint = document.querySelector('#readyHint');
      if (hint) hint.textContent = 'Both players are ready! Starting battle…';
    }
  }

  async function sync() {
    code = getCode();
    ensureReadyUI();
    if (!code) return;
    const r = await fetchRoom();
    if (!r) return;
    paint(r);
    if (r.status === 'ready' && r.creator && r.opponent) {
      window.room = r;
      if (typeof window.renderFight === 'function') window.renderFight(r);
    }
  }

  function boot() {
    const newCode = getCode();
    if (newCode && newCode !== code) {
      code = newCode;
      clearInterval(timer);
      timer = setInterval(sync, 800);
    }
    ensureReadyUI();
    sync();
    booted = true;
  }

  // app.js changes screens without changing the URL, so MutationObserver is required.
  const observer = new MutationObserver(() => {
    const battle = document.querySelector('#battle.active');
    if (battle) boot();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('hashchange', boot);
  window.addEventListener('pageshow', boot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) boot(); });
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2000);
})();
