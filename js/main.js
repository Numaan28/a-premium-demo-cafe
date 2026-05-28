/**
 * Velvet Brew — Main JavaScript
 * main.js | v1.0
 * Handles: Navbar, Mobile Menu, Scroll Reveal,
 *          Animated Counters, FAQ Accordion, Form Validation
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY HELPERS
     ============================================================ */

  /** Select a single element */
  const $ = (selector, parent = document) => parent.querySelector(selector);

  /** Select all elements */
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  /** Throttle — limits call frequency */
  function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ============================================================
     NAVBAR — Sticky scroll state + Mobile toggle
     ============================================================ */

  function initNavbar() {
    const navbar   = $('.navbar');
    const toggle   = $('.nav-toggle');
    const drawer   = $('.nav-drawer');

    if (!navbar) return;

    /* Scroll state */
    const onScroll = throttle(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 48);
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile hamburger */
    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.classList.toggle('open');
        drawer.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        toggle.setAttribute('aria-expanded', isOpen);
      });

      /* Close drawer when a link is clicked */
      $$('.nav-link', drawer).forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('open');
          drawer.classList.remove('open');
          document.body.style.overflow = '';
        });
      });

      /* Close on Escape */
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
          toggle.classList.remove('open');
          drawer.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    /* Active nav link — highlight current page */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     SCROLL REVEAL — Pure IntersectionObserver
     ============================================================ */

  function initScrollReveal() {
    const elements = $$('.reveal, .reveal-left, .reveal-right');
    if (!elements.length || !('IntersectionObserver' in window)) {
      /* Fallback: make everything visible */
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */

  function initCounters() {
    const counters = $$('.stat-item__num[data-target]');
    if (!counters.length || !('IntersectionObserver' in window)) return;

    function animateCounter(el) {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const stepTime = 16;
      const steps    = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString();
        }
      }, stepTime);
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */

  function initFAQ() {
    const items = $$('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const question = $('.faq-question', item);
      const answer   = $('.faq-answer',   item);

      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        /* Close all others */
        items.forEach(other => {
          other.classList.remove('open');
          other.setAttribute('aria-expanded', 'false');
        });

        /* Toggle current */
        if (!isOpen) {
          item.classList.add('open');
          item.setAttribute('aria-expanded', 'true');
        }
      });

      /* Keyboard accessibility */
      question.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  /* ============================================================
     CONTACT FORM VALIDATION
     ============================================================ */

  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const successBox = $('#form-success');

    function showError(fieldId, message) {
      const field = $(`#${fieldId}`);
      const error = $(`#${fieldId}-error`);
      if (field) field.classList.add('error');
      if (error) {
        error.textContent = message;
        error.classList.add('visible');
      }
    }

    function clearError(fieldId) {
      const field = $(`#${fieldId}`);
      const error = $(`#${fieldId}-error`);
      if (field) field.classList.remove('error');
      if (error) error.classList.remove('visible');
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
      return /^[\d\s\-\+\(\)]{7,}$/.test(phone);
    }

    /* Real-time clear on input */
    $$('input, textarea, select', form).forEach(field => {
      field.addEventListener('input', () => clearError(field.id));
      field.addEventListener('change', () => clearError(field.id));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const firstName = $('#first-name');
      const lastName  = $('#last-name');
      const email     = $('#email');
      const phone     = $('#phone');
      const subject   = $('#subject');
      const message   = $('#message');

      /* Validate first name */
      if (firstName && firstName.value.trim().length < 2) {
        showError('first-name', 'Please enter your first name (min. 2 characters).');
        valid = false;
      } else if (firstName) {
        clearError('first-name');
      }

      /* Validate last name */
      if (lastName && lastName.value.trim().length < 2) {
        showError('last-name', 'Please enter your last name (min. 2 characters).');
        valid = false;
      } else if (lastName) {
        clearError('last-name');
      }

      /* Validate email */
      if (email && !isValidEmail(email.value.trim())) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      } else if (email) {
        clearError('email');
      }

      /* Validate phone (optional but must be valid if provided) */
      if (phone && phone.value.trim() && !isValidPhone(phone.value.trim())) {
        showError('phone', 'Please enter a valid phone number.');
        valid = false;
      } else if (phone) {
        clearError('phone');
      }

      /* Validate subject */
      if (subject && !subject.value) {
        showError('subject', 'Please select a subject.');
        valid = false;
      } else if (subject) {
        clearError('subject');
      }

      /* Validate message */
      if (message && message.value.trim().length < 20) {
        showError('message', 'Your message must be at least 20 characters.');
        valid = false;
      } else if (message) {
        clearError('message');
      }

      if (valid) {
        /* Simulate form submission */
        const submitBtn = $('[type="submit"]', form);
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }

        setTimeout(() => {
          form.style.display = 'none';
          if (successBox) successBox.classList.add('visible');
        }, 900);
      }
    });
  }

  /* ============================================================
     MENU TABS (home page featured section)
     ============================================================ */

  function initMenuTabs() {
    const tabs  = $$('.menu-tab');
    const grids = $$('.menu-items-panel');

    if (!tabs.length || !grids.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t  => t.classList.remove('active'));
        grids.forEach(g => g.style.display = 'none');

        tab.classList.add('active');
        const panel = $(`[data-panel="${target}"]`);
        if (panel) panel.style.display = 'grid';
      });
    });
  }

  /* ============================================================
     SMOOTH BACK-TO-TOP
     ============================================================ */

  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    const onScroll = throttle(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     INIT — Run on DOM ready
     ============================================================ */

  function init() {
    initNavbar();
    initScrollReveal();
    initCounters();
    initFAQ();
    initContactForm();
    initMenuTabs();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();