;(function () {
  let translations = {} // JSON obyektlar saqlanadi

  // sahifaga tarjimalarni qo'llash
  function applyTranslations(data) {
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key')
      const index = el.getAttribute('data-index')
      if (!key) return

      let text = null

      // massiv elementini olish
      if (Array.isArray(data[key]) && index !== null) {
        text = data[key][parseInt(index)]
      } else {
        text = data[key]
      }

      if (!text) return

      if (el.tagName.toLowerCase() === 'title') {
        document.title = text
      } else {
        el.innerText = text
      }
    })
  }

  // dropdown tugmadagi matnni yangilash
  function updateDropdownLabel(lang) {
    const currentLangEl = document.getElementById('currentLang')
    if (!currentLangEl) return

    if (lang === 'uz') currentLangEl.innerText = 'O‘zbek'
    if (lang === 'en') currentLangEl.innerText = 'English'
    if (lang === 'ru') currentLangEl.innerText = 'Русский'
  }

  // global funksiya — til yuklash
  function loadLang(lang) {
    if (location.protocol === 'file:') {
      // fayl rejimida
      if (translations[lang]) {
        applyTranslations(translations[lang])
        localStorage.setItem('lang', lang)
        updateDropdownLabel(lang)
      } else {
        console.error('Til fayli topilmadi (file://):', lang)
      }
    } else {
      // serverda
      fetch(`js/lang/${lang}.json`)
        .then(res => res.json())
        .then(data => {
          applyTranslations(data)
          localStorage.setItem('lang', lang)
          updateDropdownLabel(lang)
        })
        .catch(err => console.error('loadLang error:', err))
    }
  }

  // global qilib qo‘yamiz
  window.loadLang = loadLang

  // sahifa ochilganda oxirgi tanlangan tilni yuklaymiz
  document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('lang') || 'uz'
    loadLang(lang)
  })

  // agar file:// rejimida bo‘lsa — inline jsonlardan olamiz
  if (location.protocol === 'file:') {
    if (window.lang_uz) translations['uz'] = window.lang_uz
    if (window.lang_en) translations['en'] = window.lang_en
    if (window.lang_ru) translations['ru'] = window.lang_ru
  }
})()
