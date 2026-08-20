(() => {
  let muted = false, ctx;
  function audio(){ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==='suspended')ctx.resume(); return ctx; }
  function tone(freq,duration,type='sine',gain=.045,delay=0){ if(muted)return; const c=audio(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02); }
  window.gameSound={mute(){muted=!muted;return muted},countdown(){tone(440,.12,'square');},fight(){tone(660,.14,'sawtooth');tone(990,.18,'sawtooth',.04,.12)},attack(){tone(180,.08,'sawtooth',.05);tone(90,.12,'square',.035,.06)},hit(){tone(120,.08,'triangle',.06);tone(70,.16,'triangle',.04,.07)},win(){[523,659,784,1047].forEach((n,i)=>tone(n,.2,'sine',.05,i*.09))},lose(){[392,330,262].forEach((n,i)=>tone(n,.25,'sawtooth',.04,i*.12))}};
})();
