(() => {
  const $ = s => document.querySelector(s);
  const shortBase = () => location.href.split('#')[0];
  // Short challenge URLs: the monster is stored in Supabase, only the 6-char room code is shared.
  window.challengeUrl = (m, code='') => shortBase() + (code ? '#c=' + encodeURIComponent(code) : '');

  function addBattleHUD() {
    const vs = document.querySelector('.versus');
    if (!vs || vs.querySelector('.hp-wrap')) return;
    ['battleLeft','battleRight'].forEach((id, i) => {
      const host = document.getElementById(id)?.closest('.fighter');
      if (!host) return;
      const w = document.createElement('div');
      w.className = 'hp-wrap';
      w.innerHTML = `<div class="hp-label"><span>${i===0?'HP':'HP'}</span><b class="hp-value">100</b></div><div class="hp-track"><i class="hp-fill"></i></div>`;
      host.appendChild(w);
    });
  }
  function hp(side, value) {
    const host = document.getElementById(side)?.closest('.fighter');
    if (!host) return;
    const fill = host.querySelector('.hp-fill'), val = host.querySelector('.hp-value');
    if (fill) fill.style.width = Math.max(0,value)+'%';
    if (val) val.textContent = Math.max(0,value);
  }
  function fx(side, type) {
    const el = document.getElementById(side)?.closest('.fighter');
    if (!el) return;
    el.classList.remove('fight-lunge','fight-hit','fight-ko');
    void el.offsetWidth;
    el.classList.add(type === 'attack' ? 'fight-lunge' : type === 'ko' ? 'fight-ko' : 'fight-hit');
    setTimeout(() => el.classList.remove('fight-lunge','fight-hit','fight-ko'), 480);
  }
  window.animateFight = function(r, result) {
    addBattleHUD();
    const out=$('#battleResult'), status=$('#battleStatus');
    let leftHP=100,rightHP=100,round=0;
    const leftName=r.creator.name,rightName=r.opponent.name;
    out.innerHTML='<div class="countdown big">3</div><p class="battle-tip">GET READY</p>';
    gameSound?.countdown?.();
    const cd=setInterval(()=>{
      round++;
      if(round<3){out.innerHTML=`<div class="countdown big">${3-round}</div><p class="battle-tip">GET READY</p>`;gameSound?.countdown?.();return;}
      clearInterval(cd);out.innerHTML='<div class="fight-now huge">FIGHT!</div><p class="battle-tip">FIRST TO KNOCK OUT WINS</p>';gameSound?.fight?.();
      let hit=0;
      const seq=setInterval(()=>{
        hit++;
        const attacker=hit%2? 'battleLeft':'battleRight';
        const victim=hit%2? 'battleRight':'battleLeft';
        fx(attacker,'attack');setTimeout(()=>fx(victim,'hit'),160);gameSound?.attack?.();setTimeout(()=>gameSound?.hit?.(),160);
        const damage=16+(hit%3)*7;
        if(victim==='battleRight') rightHP-=damage; else leftHP-=damage;
        hp('battleLeft',leftHP);hp('battleRight',rightHP);
        const name=attacker==='battleLeft'?leftName:rightName;
        out.innerHTML=`<div class="round-badge">ROUND ${hit}</div><div class="damage-pop">-${damage}</div><p><b>${name}</b> ATTACKS!</p>`;
        if(leftHP<=0||rightHP<=0||hit>=6){
          clearInterval(seq);
          const winner=leftHP>rightHP?r.creator:r.opponent;
          fx(winner===r.creator?'battleLeft':'battleRight','ko');
          setTimeout(()=>renderResult(r,{winner,loser:winner===r.creator?r.opponent:r.creator,margin:Math.abs((winner.power||0)-(winner===r.creator?r.opponent.power:r.creator.power))}),700);
        }
      },900);
    },700);
  };

  // Make the result impossible to miss.
  const oldRenderResult = window.renderResult;
  window.renderResult = function(r,result){
    oldRenderResult?.(r,result);
    const out=$('#battleResult');
    if(!out) return;
    const localWon=result.winner?.name===window.monster?.name;
    const banner=document.createElement('div');
    banner.className='final-banner '+(localWon?'victory':'defeat');
    banner.innerHTML=localWon?'🏆 YOU WIN!':'💀 YOU LOST';
    out.prepend(banner);
  };

  // Compact links use #c=CODE and load the battle directly from Supabase.
  function bootShortLink(){
    const m=location.hash.match(/^#c=([^&]+)/);
    if(!m) return;
    const code=decodeURIComponent(m[1]);
    setTimeout(()=>{
      try { if(window.joinRoom) window.joinRoom(code); } catch {}
    },350);
  }
  window.addEventListener('load',bootShortLink);
})();
