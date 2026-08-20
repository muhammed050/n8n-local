(() => {
  const $=s=>document.querySelector(s), base=()=>location.href.split('#')[0], lang=()=>window.APP_LANG==='ar';
  const text={en:{ready:'BOTH MONSTERS ARE READY',live:'BATTLE IN PROGRESS',get:'GET READY',fight:'FIGHT!',attack:'ATTACKS!',round:'ROUND',ko:'KNOCKOUT!',first:'FIRST TO KNOCK OUT WINS',win:'YOU WIN 🏆',lose:'YOU LOST 💀'},ar:{ready:'الشخصيتان جاهزتان',live:'المعركة جارية',get:'استعد',fight:'ابدأ القتال!',attack:'يهجم!',round:'الجولة',ko:'إسقاط!',first:'أول من يُسقط خصمه يفوز',win:'لقد فزت 🏆',lose:'لقد خسرت 💀'}};
  const T=k=>(text[window.APP_LANG]||text.en)[k];
  window.challengeUrl=(m,code='')=>base()+(code?'#c='+encodeURIComponent(code):'');

  // Final mobile battle polish: compact cards, readable HP bars, safe-area spacing and sound control.
  const style=document.createElement('style');style.textContent=`
    .fighter>div:first-child{font-size:65px}.fighter .hp-wrap{font-size:initial;margin-top:10px}
    .hp-wrap{width:100%;text-align:left}.hp-label{display:flex;justify-content:space-between;align-items:center;font-size:10px}.hp-track{height:8px}.hp-fill{display:block;transition:width .35s ease}
    .sound-toggle{border:1px solid #333;background:#141416;color:#a1a1aa;border-radius:999px;padding:8px 11px;min-height:38px;font:600 11px 'Space Grotesk';cursor:pointer}
    .topbar{gap:8px}.topbar-actions{display:flex;gap:7px;align-items:center}.final-banner{text-align:center}.battle-result{overflow:hidden}
    @media(max-width:600px){.app{padding-top:10px;padding-bottom:calc(14px + env(safe-area-inset-bottom))}.topbar{position:sticky;top:0;z-index:20;background:rgba(9,9,11,.9);backdrop-filter:blur(10px);padding:8px 0}.fighter{width:calc(50vw - 46px)!important;max-width:155px}.fighter>div:first-child{font-size:48px}.hp-wrap{margin-top:7px}.hp-label{font-size:8px}.hp-track{height:6px}.versus{margin:18px 0}.battle h2{font-size:44px!important}.battle-result{margin-top:10px}.final-banner{font-size:26px}.damage-pop{font-size:36px}}
  `;document.head.appendChild(style);

  function addSoundToggle(){
    const top=document.querySelector('.topbar');if(!top||document.querySelector('.sound-toggle'))return;
    const actions=document.createElement('div');actions.className='topbar-actions';
    actions.innerHTML='<button class="sound-toggle" id="soundToggle" type="button">🔊 SOUND</button><div class="pill" id="betaPill2">'+(lang()?'فوضى':'CHAOS')+'</div>';
    top.appendChild(actions);
    $('#soundToggle').onclick=()=>{const muted=window.gameSound?.mute?.()??false;$('#soundToggle').textContent=muted?'🔇 MUTE':'🔊 SOUND';};
  }
  function addHUD(){['battleLeft','battleRight'].forEach(id=>{const host=document.getElementById(id)?.closest('.fighter');if(!host||host.querySelector('.hp-wrap'))return;host.insertAdjacentHTML('beforeend','<div class="hp-wrap"><div class="hp-label"><span>HP</span><b class="hp-value">100</b></div><div class="hp-track"><i class="hp-fill"></i></div></div>');});}
  function setHP(id,v){const h=document.getElementById(id)?.closest('.fighter');if(!h)return;const f=h.querySelector('.hp-fill'),n=h.querySelector('.hp-value');if(f)f.style.width=Math.max(0,v)+'%';if(n)n.textContent=Math.max(0,Math.round(v));}
  function fx(id,type){const e=document.getElementById(id)?.closest('.fighter');if(!e)return;e.classList.remove('fight-lunge','fight-hit','fight-ko');void e.offsetWidth;e.classList.add(type==='attack'?'fight-lunge':type==='ko'?'fight-ko':'fight-hit');setTimeout(()=>e.classList.remove('fight-lunge','fight-hit','fight-ko'),650);}
  function sound(k){try{window.gameSound?.[k]?.()}catch{}}

  window.renderFight=function(r){
    if(!r?.creator||!r?.opponent)return;addHUD();
    setAvatar(document.getElementById('battleLeft'),r.creator);setAvatar(document.getElementById('battleRight'),r.opponent);
    $('#battleLeftName').textContent=r.creator.name;$('#battleLeftPower').textContent='POWER '+r.creator.power;$('#battleRightName').textContent=r.opponent.name;$('#battleRightPower').textContent='POWER '+r.opponent.power;
    document.querySelector('.mystery')?.classList.remove('mystery');
    const winner=r.winner||(r.creator.power+(r.creator.seed||0)%17>=r.opponent.power+(r.opponent.seed||0)%17?r.creator:r.opponent);
    if(r.status==='finished'){renderResult(r,{winner,loser:winner===r.creator?r.opponent:r.creator,margin:Math.abs(winner.power-(winner===r.creator?r.opponent:r.creator).power)});return;}
    if(r.status==='ready'&&!window.__battleAnimating){window.__battleAnimating=true;animateFight(r,winner);}else if(r.status!=='ready'){$('#battleStatus').textContent=T('ready');$('#battleResult').innerHTML='<p class="hint">'+T('ready')+'…</p>';}
  };

  window.animateFight=function(r,winner){
    addHUD();const out=$('#battleResult');let left=100,right=100,round=0;
    out.innerHTML='<div class="countdown big">3</div><p class="battle-tip">'+T('get')+'</p>';sound('countdown');
    const cd=setInterval(()=>{round++;if(round<3){out.innerHTML=`<div class="countdown big">${3-round}</div><p class="battle-tip">${T('get')}</p>`;sound('countdown');return;}
      clearInterval(cd);$('#battleStatus').textContent=T('live');out.innerHTML='<div class="fight-now huge">'+T('fight')+'</div><p class="battle-tip">'+T('first')+'</p>';sound('fight');let hit=0;
      const timer=setInterval(()=>{hit++;const attacker=hit%2?'battleLeft':'battleRight',victim=hit%2?'battleRight':'battleLeft',damage=14+(hit%3)*7;fx(attacker,'attack');setTimeout(()=>fx(victim,'hit'),120);sound('attack');setTimeout(()=>sound('hit'),130);if(victim==='battleRight')right-=damage;else left-=damage;setHP('battleLeft',left);setHP('battleRight',right);out.innerHTML=`<div class="round-badge">${T('round')} ${hit}</div><div class="damage-pop">-${damage}</div><p><b>${attacker==='battleLeft'?r.creator.name:r.opponent.name}</b> ${T('attack')}</p>`;
        if(hit>=6){clearInterval(timer);const winLeft=winner===r.creator;left=winLeft?Math.max(22,left):0;right=winLeft?0:Math.max(22,right);setHP('battleLeft',left);setHP('battleRight',right);fx(winLeft?'battleLeft':'battleRight','ko');out.innerHTML='<div class="fight-now huge">'+T('ko')+'</div>';setTimeout(()=>renderResult(r,{winner,loser:winLeft?r.opponent:r.creator,margin:Math.abs(winner.power-(winLeft?r.opponent:r.creator).power)}),750);}},800);
    },700);
  };

  const oldResult=window.renderResult;window.renderResult=function(r,result){oldResult?.(r,result);const out=$('#battleResult');if(!out)return;const mine=$('#monsterName')?.textContent?.trim(),won=result.winner?.name===mine;const banner=document.createElement('div');banner.className='final-banner '+(won?'victory':'defeat');banner.textContent=won?T('win'):T('lose');out.prepend(banner);sound(won?'win':'lose');window.__battleAnimating=false;};
  const originalFinish=window.finishBattle;window.finishBattle=async function(r,result){const me=localStorage.getItem('who_player_id');if(r?.creator_id&&r.creator_id!==me)return;try{return originalFinish?.(r,result)}catch{}};
  function boot(){addSoundToggle();const m=location.hash.match(/^#c=([^&]+)/);if(!m)return;setTimeout(()=>{try{window.joinRoom?.(decodeURIComponent(m[1]))}catch{}},500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addSoundToggle);else addSoundToggle();window.addEventListener('load',boot);
})();
