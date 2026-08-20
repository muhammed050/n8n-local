(() => {
  const lang = (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  window.APP_LANG = lang;
  const t = {
    ar: { fight:'ابدأ المعركة', waiting:'بانتظار الخصم…', live:'المعركة مستمرة', complete:'انتهت المعركة', wins:'فوز', loss:'خسارة', attack:'هجوم!', victory:'فاز!', defeat:'خسرت!', rematch:'إعادة المباراة', share:'مشاركة النتيجة', streak:'سلسلة الانتصارات', power:'القوة', challenger:'المتحدي', opponent:'الخصم', copy:'نسخ رابط المعركة', copied:'تم النسخ ✓', first:'كن أول من يخوض معركة!' },
    en: { fight:'FIGHT', waiting:'WAITING FOR OPPONENT…', live:'LIVE BATTLE', complete:'BATTLE COMPLETE', wins:'WINS', loss:'LOSS', attack:'ATTACK!', victory:'WINS!', defeat:'YOU LOST!', rematch:'REMATCH', share:'SHARE RESULT', streak:'WIN STREAK', power:'POWER', challenger:'CHALLENGER', opponent:'OPPONENT', copy:'COPY BATTLE LINK 🔗', copied:'COPIED ✓', first:'Be the first to battle!' }
  };
  window.t = key => (t[window.APP_LANG] && t[window.APP_LANG][key]) || t.en[key] || key;
})();
