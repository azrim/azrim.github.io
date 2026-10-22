/**
 * azrim.my.id - Interactive Systems
 * Wingfo-style theme switcher, bilingual toggle, spotlight hover,
 * floating dock tracker, accordion FAQ, and smooth interactions.
 */

(function () {
  'use strict';

  // --- Dynamic Year ---
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // --- Theme Management ---
  const THEME_KEY = 'azrim-theme';
  const htmlEl = document.documentElement;
  const themeSwitch = document.getElementById('theme-toggle');
  const themeSwitchMobile = document.getElementById('theme-toggle-mobile');

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;

    applyTheme(isDark);
  }

  function applyTheme(isDark) {
    if (isDark) {
      htmlEl.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
      if (themeSwitch) themeSwitch.setAttribute('aria-checked', 'true');
      if (themeSwitchMobile) themeSwitchMobile.setAttribute('aria-checked', 'true');
    } else {
      htmlEl.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
      if (themeSwitch) themeSwitch.setAttribute('aria-checked', 'false');
      if (themeSwitchMobile) themeSwitchMobile.setAttribute('aria-checked', 'false');
    }
  }

  function toggleTheme() {
    const isCurrentlyDark = htmlEl.classList.contains('dark');
    applyTheme(!isCurrentlyDark);
  }

  if (themeSwitch) themeSwitch.addEventListener('click', toggleTheme);
  if (themeSwitchMobile) themeSwitchMobile.addEventListener('click', toggleTheme);

  // Listen for system changes if no preference saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches);
    }
  });

  initTheme();

  // --- Bilingual Language Switcher ---
  const LANG_KEY = 'azrim-lang';
  const langButtons = document.querySelectorAll('[data-lang-choice]');

  function initLang() {
    const saved = localStorage.getItem(LANG_KEY);
    const lang = saved === 'id' ? 'id' : 'en';
    applyLang(lang);
  }

  function applyLang(lang) {
    htmlEl.setAttribute('data-lang', lang);
    localStorage.setItem(LANG_KEY, lang);

    langButtons.forEach((btn) => {
      const choice = btn.getAttribute('data-lang-choice');
      const isActive = choice === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    updateDeckInfo();
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-lang-choice');
      applyLang(choice);
    });
  });

  initLang();

  // --- Spotlight Cursor Tracking ---
  const spotlights = document.querySelectorAll('.spotlight');
  if (window.matchMedia('(pointer: fine)').matches) {
    spotlights.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
      });
    });
  }

  // --- Mobile Drawer Navigation ---
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (menuClose) menuClose.addEventListener('click', closeDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // --- FAQ Accordion ---
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const body = item.querySelector('.accordion-body');

    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other accordion items
      accordionItems.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherTrigger = other.querySelector('.accordion-trigger');
          const otherBody = other.querySelector('.accordion-body');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
    });
  });

  // --- Copy to Clipboard Toast ---
  const toast = document.getElementById('toast');
  let toastTimer = 0;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.getAttribute('data-copy');
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const isId = htmlEl.getAttribute('data-lang') === 'id';
        const msg = isId ? 'Tersalin ke clipboard!' : 'Copied to clipboard!';
        showToast(msg);
      }).catch(() => {
        showToast(text);
      });
    });
  });

  // --- Floating Deck Bar & Scroll Spy ---
  const sectionIds = ['top', 'focus', 'projects', 'tools', 'journey', 'faq'];
  const deckLabel = document.getElementById('deck-label');
  const deckSub = document.getElementById('deck-sub');
  const deckDots = document.querySelectorAll('.deck-dot');
  const navLinks = document.querySelectorAll('.nav-pill-link');

  const sectionMeta = {
    top: {
      en: { label: 'Home', sub: 'Android, Kernels & Systems' },
      id: { label: 'Beranda', sub: 'Android, Kernel & Sistem' },
    },
    focus: {
      en: { label: 'Focus Lanes', sub: 'Android, Flutter, Systems, Web3' },
      id: { label: 'Bidang Utama', sub: 'Android, Flutter, Sistem, Web3' },
    },
    projects: {
      en: { label: 'Selected Work', sub: 'Recent Builds & Maintained Apps' },
      id: { label: 'Karya Pilihan', sub: 'Build Terbaru & Aplikasi Rilis' },
    },
    tools: {
      en: { label: 'Open-Source Tools', sub: 'Scripts, Compilers & Utilities' },
      id: { label: 'Tools Open-Source', sub: 'Script, Kompilator & Utilitas' },
    },
    journey: {
      en: { label: 'The Journey', sub: 'Seven Years of Open-Source History' },
      id: { label: 'Perjalanan', sub: 'Tujuh Tahun Rekam Jejak Terbuka' },
    },
    faq: {
      en: { label: 'Verified & FAQ', sub: 'Security Channels & Common Questions' },
      id: { label: 'Verifikasi & FAQ', sub: 'Saluran Resmi & Tanya Jawab' },
    },
  };

  let currentSection = 'top';

  function updateDeckInfo() {
    const isId = htmlEl.getAttribute('data-lang') === 'id';
    const lang = isId ? 'id' : 'en';
    const meta = sectionMeta[currentSection] || sectionMeta.top;

    if (deckLabel) deckLabel.textContent = meta[lang].label;
    if (deckSub) deckSub.textContent = meta[lang].sub;
  }

  function setActiveSection(id) {
    if (!id || !sectionMeta[id]) return;
    currentSection = id;
    updateDeckInfo();

    // Update dock indicators
    deckDots.forEach((dot) => {
      const target = dot.getAttribute('data-section');
      dot.classList.toggle('active', target === id);
    });

    // Update header nav pill
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const target = href ? href.replace('#', '') : '';
      link.classList.toggle('active', target === id);
    });
  }

  // Click on dock dots to jump smoothly
  deckDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const id = dot.getAttribute('data-section');
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Intersection Observer for scroll spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id);
      }
    });
  }, observerOptions);

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  // Header background blur intensification on scroll
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.style.borderBottomColor = 'var(--line-strong)';
    } else {
      siteHeader.style.borderBottomColor = 'var(--line)';
    }
  }, { passive: true });

  // Optional: Gentle tilt effect on hero avatar card
  const heroCard = document.querySelector('.hero-avatar-card');
  if (heroCard && window.matchMedia('(pointer: fine)').matches) {
    const showcase = document.querySelector('.hero-showcase');
    if (showcase) {
      showcase.addEventListener('pointermove', (e) => {
        const rect = showcase.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroCard.style.transform = `rotate(${x * 8}deg) scale(1.02) translateY(${y * -8}px)`;
      });
      showcase.addEventListener('pointerleave', () => {
        heroCard.style.transform = 'rotate(2.5deg)';
      });
    }
  }

})();
