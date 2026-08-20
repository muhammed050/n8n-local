(() => {
  // Reliable fallback for GitHub Pages / mobile browsers where Supabase Realtime
  // can be delayed or unavailable. Realtime remains enabled; polling is a safety net.
  const SUPABASE_URL = 'https://pbouvkzalxeragrpsotl.supabase.co';
  const KEY = window.SUPABASE_PUBLISHABLE_KEY || '';
  let db = null;
  let pollTimer = null;
  let activeCode = null;
  let lastStatus = '';
  let lastOpponent = false;
  let stopped = false;

  const getDb = () => {
    if (!KEY || !window.supabase) return null;
    return db || (db = window.supabase.createClient(SUPABASE_URL, KEY));
  };

  const hashCode = () => {
    const h = location.hash || '';
    if (h.startsWith('#c=')) return decodeURIComponent(h.slice(3)).trim().toUpperCase();
    if (h.startsWith('#challenge=')) {
      try {
        const raw = h.slice(11);
        const json = decodeURIComponent(escape(atob(raw)));
        return JSON.parse(json).roomCode?.trim().toUpperCase() || null;
      } catch (_) {}
    }
    return null;
  };

  async function sync(code) {
    if (stopped || !code || !getDb()) return;
    try {
      const { data, error } = await db.from('game_battles').select('*').eq('code', code).maybeSingle();
      if (error || !data) return;

      const hasOpponent = !!data.opponent;
      const changed = data.status !== lastStatus || hasOpponent !== lastOpponent || !!data.winner;
      lastStatus = data.status || '';
      lastOpponent = hasOpponent;

      if (hasOpponent && changed && typeof window.renderFight === 'function') {
        window.renderFight(data);
      }
      if (data.status === 'finished' && data.winner && typeof window.renderFight === 'function') {
        window.renderFight(data);
      }
    } catch (_) {}
  }

  function start(code) {
    if (!code || code === activeCode) return;
    activeCode = code;
    clearInterval(pollTimer);
    sync(code);
    pollTimer = setInterval(() => sync(activeCode), 900);
  }

  function stop() {
    clearInterval(pollTimer);
    pollTimer = null;
    activeCode = null;
  }

  const originalCreate = window.createRoom;
  if (typeof originalCreate === 'function') {
    window.createRoom = (...args) => {
      const result = originalCreate(...args);
      setTimeout(() => {
        const el = document.getElementById('shareUrl');
        const text = el?.textContent || '';
        const match = text.match(/#(?:c=|challenge=.*roomCode[^A-Z0-9]*)([A-Z0-9]{6})/i);
        const code = match?.[1] || (text.match(/#c=([A-Z0-9]{6})/i)?.[1]);
        if (code) start(code);
      }, 700);
      return result;
    };
  }

  const originalJoin = window.joinRoom;
  if (typeof originalJoin === 'function') {
    window.joinRoom = (...args) => {
      const code = String(args[0] || '').toUpperCase();
      start(code);
      return originalJoin(...args);
    };
  }

  // Also detect the current challenge URL after page load / navigation.
  const boot = () => {
    const code = hashCode();
    if (code) start(code);
  };
  window.addEventListener('hashchange', () => {
    stop();
    boot();
  });
  window.addEventListener('pageshow', boot);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) boot();
  });
  setTimeout(boot, 1200);
})();
