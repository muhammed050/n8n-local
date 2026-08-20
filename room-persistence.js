(()=>{
  const KEY='who_live_room_code';
  const active=()=>document.querySelector('#battle')?.classList.contains('active');
  const code=()=>String(localStorage.getItem(KEY)||'').trim().toUpperCase();
  async function restore(){
    const c=code();
    if(!c)return;
    try{
      if(typeof window.supa!=='function' && !window._supa && !window.SUPABASE_PUBLISHABLE_KEY)return;
      const db=typeof window.supa==='function'?window.supa():window._supa;
      if(!db)return;
      const {data,error}=await db.from('game_battles').select('*').eq('code',c).maybeSingle();
      if(error||!data){localStorage.removeItem(KEY);return;}
      if(data.status==='finished'){localStorage.removeItem(KEY);return;}
      window.room=data;
      localStorage.setItem('who_active_screen','battle');
      if(typeof window.show==='function' && !active())window.show('battle',false);
      if(typeof window.renderFight==='function' && data.creator && data.opponent)window.renderFight(data);
      if(typeof window.subscribeRoom==='function')window.subscribeRoom(c);
    }catch(e){console.warn('room restore failed',e)}
  }
  function schedule(){[0,150,500,1200].forEach(t=>setTimeout(restore,t))}
  window.addEventListener('load',schedule);
  window.addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.addEventListener('hashchange',schedule);
  window.RoomPersistence={restore};
})();