(() => {
  const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.lang = lang;
  window.APP_LANG = lang;
  const dict={
    en:{todayChaos:"TODAY'S CHAOS IS WAITING",heroDesc:"Turn any name into a ridiculous monster. Battle friends, build a streak, and become today's champion.",createCharacter:'CREATE MY CHARACTER →',champions:"TODAY'S CHAOS CHAMPIONS",viewLeaderboard:'VIEW FULL LEADERBOARD →',whatCall:'What should<br>we call you?',nameHint:'Real name, nickname, pet, whatever.',generate:'GENERATE MY MONSTER ⚡',back:'back',incoming:'INCOMING CHALLENGE',challenged:"YOU'VE BEEN<br><em>CHALLENGED.</em>",accept:'ACCEPT BATTLE',sendChallenge:'SEND THIS CHALLENGE',yourCreation:'YOUR CREATION',startOver:'START OVER',streak:'WIN STREAK',liveBattle:'CREATE LIVE BATTLE',shareMonster:'SHARE MY MONSTER',saveCollection:'SAVE TO MY COLLECTION',copy:'COPY BATTLE LINK 🔗',another:'create another',shareFusion:'SHARE THE FUSION',makeAnother:'MAKE ANOTHER',power:'POWER',battleTitle:'WHO<br><em>WINS?</em>',fusionTitle:'YOU<br><em>FUSED THEM.</em>'},
    ar:{todayChaos:'فوضى اليوم بانتظارك',heroDesc:'حوّل أي اسم إلى وحش مضحك. تحدَّ أصدقاءك، ابنِ سلسلة انتصارات، وكن بطل اليوم.',createCharacter:'أنشئ شخصيتي ←',champions:'أبطال فوضى اليوم',viewLeaderboard:'عرض لوحة المتصدرين ←',whatCall:'ماذا يجب<br>أن نسميك؟',nameHint:'اسمك الحقيقي، لقبك، اسم حيوانك… أي شيء.',generate:'أنشئ وحشي ⚡',back:'رجوع',incoming:'تحدٍّ وارد',challenged:'لقد تم<br><em>تحدّيك.</em>',accept:'اقبل المعركة',sendChallenge:'أرسل هذا التحدي',yourCreation:'شخصيتك',startOver:'ابدأ من جديد',streak:'سلسلة الانتصارات',liveBattle:'أنشئ معركة مباشرة',shareMonster:'شارك وحشي',saveCollection:'احفظ في مجموعتي',copy:'انسخ رابط المعركة 🔗',another:'أنشئ واحداً آخر',shareFusion:'شارك الدمج',makeAnother:'أنشئ واحداً آخر',power:'القوة',battleTitle:'من<br><em>يفوز؟</em>',fusionTitle:'لقد<br><em>دمجتهما.</em>'}
  };
  const d=dict[lang];
  window.t=key=>d[key]??dict.en[key]??key;
  function applyLanguage(){
    document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=window.t(el.dataset.i18n));
    const input=document.querySelector('#nameInput'); if(input) input.placeholder=lang==='ar'?'مثال: محمد':'e.g. Muhammed';
    const h1=document.querySelector('#home h1'); if(h1) h1.innerHTML=lang==='ar'?'اصنع<br><em>شخصيتك الغريبة.</em>':'MAKE A<br><em>WEIRD ONE.</em>';
    const battle=document.querySelector('#battle h2'); if(battle) battle.innerHTML=window.t('battleTitle');
    const fusion=document.querySelector('#fusion h2'); if(fusion) fusion.innerHTML=window.t('fusionTitle');
    const beta=document.querySelector('#betaPill'); if(beta) beta.textContent=lang==='ar'?'تجريبي · مختبر الفوضى':'BETA · CHAOS LAB';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyLanguage);else applyLanguage();
  window.refreshLanguage=applyLanguage;
})();
