(() => {
  const SUPABASE_URL = 'https://pbouvkzalxeragrpsotl.supabase.co';
  const KEY = window.SUPABASE_PUBLISHABLE_KEY || '';
  let db = null, pollTimer = null, activeCode = null, lastStatus = '', lastOpponent = false;
  const getDb = () => {
    if (!KEY || !window.supabase) return null;
    return db || (db = window.supabase.createClient(SUPABASE_URL, KEY));
  };
  function getChallengeCode() {
    const h = location.hash || '';
    if (h.startsWith('#c=')) return decodeURIComponent(h.slice(3)).trim().toUpperCase();
    if (!h.startsWith('#challenge=')) return null;
    try {
      const raw = h.slice('#challenge='.length);
      const padded = raw + '='.repeat((4 - raw.length % 4) % 4);
      const payload = JSON.parse(decodeURIComponent(escape(atob(padded))));
      const code = payload.roomCode || payload.rootCode || payload.code || payload.liveRoomCode;
      return code ? String(code).trim().toUpperCase() : null;
    } catch (_) { return null; }
  }
  async function sync(code) {
    if (!code || !getDb()) return;
    try {
      const { data, error } = await db.from('game_battles').select('*').eq('code', code).maybeSingle();
      if (error || !data) return;
      const hasOpponent = !!data.opponent;
      const changed = data.status !== lastStatus || hasOpponent !== lastOpponent || !!data.winner;
      lastStatus = data.status || '';
      lastOpponent = hasOpponent;
      if (hasOpponent && changed && typeof window.renderFight === 'function') window.renderFight(data);
      if (data.status === 'finished' && data.winner && typeof window.renderFight === 'function') window.renderFight(data);
    } catch (_) {}
  }
  function start(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code || code === activeCode) return;
    activeCode = code;
    lastStatus = '';
    lastOpponent = false;
    clearInterval(pollTimer);
    sync(code);
    pollTimer = setInterval(() => sync(activeCode), 900);
  }
  function boot() {
    const code = getChallengeCode();
    if (code) start(code);
  }
  window.addEventListener('hashchange', boot);
  window.addEventListener('pageshow', boot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) boot(); });
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  window.getLiveBattleCode = getChallengeCode;
})();