// Supabase public runtime configuration.
// This is a publishable/anon browser key; Supabase RLS must protect database writes.
window.SUPABASE_PUBLISHABLE_KEY = window.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_6q3op1_SHPm1j_bd8KSDYQ_Anycaiwg';

(function(){
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h)}
  function fallbackMonster(name){const h=hash(String(name||'Fighter'));const stats=[55+h%46,50+(h>>3)%51,45+(h>>6)%56,55+(h>>9)%46];const power=Math.round(stats.reduce((a,b)=>a+b,0)/4);return {name:['TURBO','LORD','CAPTAIN','PROFESSOR','KING','GENERAL'][h%6]+' '+['SUPREMO','NINJA','DESTROYER','GOBLIN','WARRIOR','BOSS','PROPHET','MENACE','OVERLORD','CHAOS'][Math.floor(h/11)%10],lore:['escaped from a suspicious supermarket at 3AM.','was banned from three dimensions for excessive aura.','has one mission: become ridiculously famous.','looks harmless. It is absolutely not.'][h%4],stats,rarity:power>90?'MYTHIC':power>78?'LEGENDARY':power>65?'EPIC':'UNCOMMON',power,seed:h,raw:String(name||'Fighter')}}
  function bind(){
    const create=document.getElementById('createBtn'),generate=document.getElementById('generateBtn');
    if(create)create.onclick=function(e){e.preventDefault();if(typeof window.show==='function')window.show('create');else document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='create'));document.getElementById('nameInput')?.focus()};
    if(generate)generate.onclick=async function(e){e.preventDefault();const input=document.getElementById('nameInput'),name=(input?.value||'').trim();if(!name){input?.focus();return}localStorage.setItem('who_player_name',name);if(window.RoomEngine?.generate){try{await window.RoomEngine.generate();return}catch(err){console.error('RoomEngine.generate',err)}}const m=fallbackMonster(name);localStorage.setItem('who_current_monster',JSON.stringify(m));['monsterName','monsterLore','rarity','power','chaos','luck','aura'].forEach((id,i)=>{const el=document.getElementById(id);if(!el)return;el.textContent=i===0?m.name:i===1?m.lore:i===2?m.rarity:i===3?m.power:i===4?m.stats[1]:i===5?m.stats[2]:m.stats[3]});if(window.Character3D?.setSlot)await window.Character3D.setSlot('#monster3d',m);if(typeof window.show==='function')window.show('result');else document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='result'))};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,0));else setTimeout(bind,0);
})();