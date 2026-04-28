/* ============================================================
   HENNAFY STUDIO — Main JavaScript
   Handles: nav scroll, mobile menu, pricing hand interaction,
   FAQ accordion, gallery filters, lightbox, contact form, reveal animations
   ============================================================ */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showToast(msg, type = '') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' toast-' + type : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = 'toast'; }, 3800);
}

/* ── Scroll-based nav ────────────────────────────────────── */
(function initNav() {
  const nav = $('#mainNav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── Mobile hamburger menu ────────────────────────────────── */
(function initMobileNav() {
  const btn    = $('#hamburger');
  const drawer = $('#mobileNav');
  if (!btn || !drawer) return;

  function toggle(open) {
    btn.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));

  // Close when a link inside the drawer is clicked
  $$('.mobile-link, .nav-mobile .btn', drawer).forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) toggle(false);
  });
})();


/* ── Scroll-reveal animations ─────────────────────────────── */
(function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();


/* ── Pricing: Interactive Hand with Scroll ────────────────── */
(function initPricingHand() {
  const cards      = $$('.pricing-card');
  const zoneHand   = $('#svgZoneHand');
  const zoneWrist  = $('#svgZoneWrist');
  const zoneFore   = $('#svgZoneFore');
  const trackFill  = $('#trackFill');
  const trackDot   = $('#trackDot');
  const labelHand  = $('#labelHand');
  const labelWrist = $('#labelWrist');
  const labelFore  = $('#labelFore');

  if (!cards.length || !zoneHand) return;

  const zones = {
    'hand':  { svgEls: [zoneHand],               pct: 30, label: labelHand  },
    'wrist': { svgEls: [zoneHand, zoneWrist],     pct: 62, label: labelWrist },
    'fore':  { svgEls: [zoneHand, zoneWrist, zoneFore], pct: 92, label: labelFore  },
  };

  function activateZone(zone) {
    // Reset all SVG zones
    [zoneHand, zoneWrist, zoneFore].forEach(el => el && el.classList.remove('active'));
    // Reset all labels
    [labelHand, labelWrist, labelFore].forEach(el => el && el.classList.remove('visible'));
    // Reset all cards
    cards.forEach(c => c.classList.remove('active'));

    const z = zones[zone];
    if (!z) return;

    // Activate SVG zones
    z.svgEls.forEach(el => el && el.classList.add('active'));
    // Show label
    if (z.label) z.label.classList.add('visible');

    // Update track
    if (trackFill) trackFill.style.height = z.pct + '%';
    if (trackDot)  trackDot.style.top     = z.pct + '%';

    // Activate matching card
    const card = $('[data-zone="' + zone + '"]');
    if (card) card.classList.add('active');
  }

  // Intersection Observer on each pricing card
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateZone(entry.target.dataset.zone);
      }
    });
  }, { threshold: 0.55 });

  cards.forEach(card => io.observe(card));

  // Also allow clicking on card to activate
  cards.forEach(card => {
    card.addEventListener('click', () => activateZone(card.dataset.zone));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') activateZone(card.dataset.zone);
    });
  });

  // Start with hand zone active
  activateZone('hand');
})();


/* ── FAQ Accordion ────────────────────────────────────────── */
(function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Category filter buttons
  const catBtns = $$('.faq-cat-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      catBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      items.forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = '';
        } else {
          item.classList.remove('open');
          item.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
          item.style.display = 'none';
        }
      });
    });
  });
})();


/* ── Gallery: Filter ──────────────────────────────────────── */
(function initGalleryFilter() {
  const filterBtns = $$('.filter-btn');
  const items      = $$('.gallery-masonry-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      items.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.style.transition = 'opacity .3s ease, transform .3s ease';
        if (show) {
          item.style.display = 'block';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(.95)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();


/* ── Gallery: Lightbox ────────────────────────────────────── */
(function initLightbox() {
  const lightbox = $('#lightbox');
  if (!lightbox) return;

  const lbImg    = $('#lightboxImg');
  const lbTag    = $('#lightboxTag');
  const lbTitle  = $('#lightboxTitle');
  const lbDesc   = $('#lightboxDesc');
  const lbPrice  = $('#lightboxPrice');
  const lbZone   = $('#lightboxZone');
  const closeBtn = $('#lightboxClose');
  const prevBtn  = $('#lightboxPrev');
  const nextBtn  = $('#lightboxNext');

  const items = $$('.gallery-masonry-item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = items[index];
    if (!item) return;

    const img   = item.querySelector('img');
    const tag   = item.querySelector('.gallery-item-tag');
    const title = item.querySelector('.gallery-item-style');

    if (lbImg)   { lbImg.src = img?.src || ''; lbImg.alt = img?.alt || ''; }
    if (lbTag)   lbTag.textContent  = tag?.textContent  || item.dataset.cat || '';
    if (lbTitle) lbTitle.textContent = title?.textContent || item.dataset.title || '';
    if (lbDesc)  lbDesc.textContent  = item.dataset.desc  || '';
    if (lbPrice) lbPrice.textContent = item.dataset.price || '';
    if (lbZone)  lbZone.textContent  = item.dataset.zone  ? 'Coverage: ' + item.dataset.zone : '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus management
    setTimeout(() => closeBtn?.focus(), 50);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    items[currentIndex]?.focus();
  }

  function navigate(dir) {
    let next = currentIndex + dir;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    openLightbox(next);
  }

  // Open on item click / keypress
  items.forEach((item, i) => {
    const triggerOpen = () => openLightbox(i);
    item.addEventListener('click', triggerOpen);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerOpen(); }
    });

    // Also trigger from the overlay button
    const btn = item.querySelector('.gallery-item-btn');
    if (btn) btn.addEventListener('click', e => { e.stopPropagation(); triggerOpen(); });
  });

  // Close
  closeBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Navigate
  prevBtn?.addEventListener('click', () => navigate(-1));
  nextBtn?.addEventListener('click', () => navigate(1));

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
  });
})();


/* ── Contact Form ─────────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Gather form data
    const data = Object.fromEntries(new FormData(form));

    /*
      HOW TO CONNECT A REAL BACKEND:
      Option A — Formspree (free, no backend needed):
        1. Go to formspree.io and create a form
        2. Replace the fetch URL below:
           fetch('https://formspree.io/f/xrerwkwg', { method:'POST', ... })
        3. Add: headers: { 'Accept': 'application/json' }

      Option B — EmailJS (free tier available):
        1. Set up at emailjs.com
        2. Use their JS SDK to send directly from the browser

      Option C — Netlify Forms (if hosting on Netlify):
        Add data-netlify="true" to the <form> tag — zero config needed.
    */

    // Simulate sending (replace with real fetch call)
    await new Promise(resolve => setTimeout(resolve, 1200));

    showToast('Message sent! We\'ll reply within 24 hours. ✦', 'accent');
    form.reset();

    btn.textContent = originalText;
    btn.disabled = false;
  });
})();


/* ── Google Review Link placeholder warning ───────────────── */
(function initGoogleLink() {
  const link = $('#googleReviewLink');
  if (!link) return;
  link.addEventListener('click', e => {
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
      showToast('Add your Google Business profile URL to activate this link.');
    }
  });
})();


/* ── Active nav link on scroll (homepage) ────────────────── */
(function initActiveLink() {
  const sections = $$('section[id]');
  const links    = $$('.nav-links a');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          const isActive = link.getAttribute('href') === '#' + entry.target.id;
          link.style.color = isActive ? 'var(--primary)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();


/* ── Smooth scroll for anchor links ──────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── Lazy load images with fade-in ───────────────────────── */
(function initLazyImages() {
  const imgs = $$('img[loading="lazy"]');
  imgs.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity .4s ease';
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => { img.style.opacity = '1'; });
    }
  });
})();
