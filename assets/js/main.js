/* PromoInk — main.js */
const VERSION = '79.0';

// Global function for adding to cart quickly from the Home page
window.quickAddToCart = function(event, id, name, sku, price, image, minQty, shippingCost) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (typeof CartManager !== 'undefined') {
    const product = {
      product_id: id,
      name: name,
      sku: sku,
      unit_price: parseFloat(price),
      image_webp: image,
      quantity: parseInt(minQty) || 10,
      min_quantity: parseInt(minQty) || 10,
      shipping_cost: parseFloat(shippingCost) || 0
    };

    // Instant local update for better UX
    CartManager.addItem(product);
    
    // UI Updates
    if (window.CartUI && typeof window.CartUI.open === 'function') {
      window.CartUI.open();
    } else if (typeof openCart === 'function') {
      openCart();
    }
    
    if (typeof showToast === 'function') {
      showToast(`Agregado: ${name}`);
    }
  } else {
    console.error('CartManager not found');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  
  // --- SEO Canonical Fix ---
  (function() {
    if (!document.querySelector('link[rel="canonical"]')) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      const url = new URL(window.location.href);
      // Remove common tracking params so Google doesn't index them as duplicates
      ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'gclid'].forEach(p => url.searchParams.delete(p));
      
      let finalUrl = url.href;
      // Normalize index.php / home.html to root
      finalUrl = finalUrl.replace('/index.php', '/').replace('/home.html', '/');
      link.href = finalUrl;
      document.head.appendChild(link);
    }
  })();

  // --- Lenis Smooth Scroll ---
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis; // Expose to global if needed
  }


  // Page loader
  const loader = document.getElementById('page-loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1400);

  // Hero word rotation
  const heroWords = document.querySelectorAll('.hero-word');
  if (heroWords.length > 1) {
    let currentWord = 0;
    setInterval(() => {
      heroWords[currentWord].classList.remove('active');
      currentWord = (currentWord + 1) % heroWords.length;
      heroWords[currentWord].classList.add('active');
    }, 2500);
  }

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger & Mobile Menu
  const toggle = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  
  const openMobileMenu = () => {
    toggle?.classList.add('open');
    mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock scroll
  };

  const closeMobileMenu = () => {
    toggle?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = ''; // Unlock scroll
  };

  toggle?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  
  // Close menu on link click
  mobileMenu?.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const staggerContainers = document.querySelectorAll('.stagger-children');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '60px 0px 0px 0px' });
  reveals.forEach(el => io.observe(el));
  staggerContainers.forEach(el => io.observe(el));

  // Counter animation
  document.querySelectorAll('.counter').forEach(el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur = 2000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { requestAnimationFrame(step); cio.disconnect(); }
    });
    cio.observe(el);
  });

  // Ripple buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'btn-ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

  // Dynamic Brands Ticker
  const marquee = document.querySelector('.logos-marquee');
  if (marquee) {
    fetch('api/public_brand_logos.php')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          const brands = res.data;
          
          const renderTrack = (items, direction = 'normal') => {
            const html = items.map(b => `
              <div class="logo-item" style="flex-direction: column; width: auto; min-width: 280px; padding: 0 1.5rem;">
                <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
                  <img src="assets/images/${b.filename}" alt="${b.name}" style="opacity: 1; max-height: 100px; max-width: 250px; transition: all 0.3s ease; object-fit: contain;">
                </div>
                <span style="margin-top: 0.5rem; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.2; text-align: center; max-width: 220px; word-wrap: break-word; white-space: normal;">${b.name}</span>
              </div>
            `).join('');
            
            const track = document.createElement('div');
            track.className = 'logos-track';
            track.style.setProperty('--scroll-dist', `-${items.length * 280}px`);
            track.style.setProperty('--scroll-speed', `${items.length * 4}s`); // Smooth constant speed
            
            if (direction === 'reverse') {
              track.style.animationName = 'scroll-reverse';
            }
            track.innerHTML = html + html; 
            return track;
          };

          marquee.innerHTML = ''; // Clear original track placeholder
          
          if (brands.length > 8) {
            // Split into two rows
            const mid = Math.ceil(brands.length / 2);
            const row1 = brands.slice(0, mid);
            const row2 = brands.slice(mid);
            
            marquee.appendChild(renderTrack(row1, 'normal'));
            marquee.appendChild(renderTrack(row2, 'reverse'));
          } else {
            // Single row
            const track = renderTrack(brands, 'normal');
            if (brands.length <= 5) {
              track.style.animation = 'none';
              track.style.justifyContent = 'center';
              track.style.width = '100%';
              track.style.flexWrap = 'wrap';
            }
            marquee.appendChild(track);
          }

          // --- Inject logos into Hero Avatars (Social Proof) ---
          const slots = document.querySelectorAll('.brand-avatar-slot');
          if (slots.length > 0 && brands.length > 0) {
            slots.forEach((slot, idx) => {
               if (brands[idx]) {
                  const b = brands[idx];
                  slot.innerHTML = `<img src="assets/images/${b.filename}" alt="${b.name}" style="width:100%; height:100%; object-fit:contain; filter:brightness(0) invert(1);">`;
               }
            });
          }
        }
      })
      .catch(err => console.error('Error loading brands:', err));
  }

  // Toast helper
  window.showToast = (msg, type = 'success') => {
    const c = document.querySelector('.toast-container') || (() => {
      const el = document.createElement('div');
      el.className = 'toast-container';
      document.body.appendChild(el);
      return el;
    })();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" d="M5 13l4 4L19 7"/></svg><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  };

  // Quote form
  const qForm = document.getElementById('quote-form');
  qForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(qForm);
    const btn = qForm.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const res = await fetch('api/quote.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd))
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('¡Cotización enviada! Te contactamos en 24h.', 'success');
        qForm.reset();
      } else throw new Error(data.error || 'Error desconocido');
    } catch(err) {
      window.showToast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Solicitar Cotización';
    }
  });

  // Load all dynamic data
  console.log(`Main.js v${VERSION} initialized`);
  loadSiteSettings();
  loadDynamicCategories();
  
  // Navbar search event (Global)
  const doGlobalSearch = () => {
    const inp = document.getElementById('navbar-search-input');
    const q = inp?.value.trim();
    if (q) window.location.href = `catalogo.html?search=${encodeURIComponent(q)}`;
  };
  
  document.getElementById('btn-navbar-search')?.addEventListener('click', doGlobalSearch);
  document.getElementById('navbar-search-input')?.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') doGlobalSearch(); 
  });

  // Handle Quick Search click (both desktop icons & mobile chips)
  const handleQuickSearchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const term = btn.getAttribute('data-product');
    if (!term) return;

    const inp = document.getElementById('navbar-search-input');
    if (inp) {
      inp.value = term.charAt(0).toUpperCase() + term.slice(1);
      
      // If already on catalog page, search instantly without page reload
      const isCatalog = document.getElementById('catalog-grid');
      if (isCatalog && typeof reloadCatalog === 'function') {
        currentFilters.search = term;
        reloadCatalog();
      } else {
        window.location.href = `catalogo.html?search=${encodeURIComponent(term)}`;
      }
    }
  };

  document.querySelectorAll('.scattered-icon, .search-mobile-chip').forEach(el => {
    el.addEventListener('click', handleQuickSearchClick);
  });

  // Auth UI sync
  updateAuthUI();

  // Page specific init
  if (document.getElementById('catalog-grid')) {
    initCatalog();
  } else if (!document.getElementById('product-detail-container') && !window.location.pathname.includes('portal.html') && !window.location.pathname.includes('login.html')) {
    loadFeaturedProducts();
    loadSaleProducts();
  }
  
  // Link Ofertas (Event Delegation for dynamic nav)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.nav-link-ofertas');
    if (target) {
      e.preventDefault();
      window.location.href = 'catalogo.html?on_sale=1';
    }
  });
});

async function updateAuthUI() {
  const portalBtn = document.getElementById('auth-btn') || document.querySelector('a[href="login.html"]');
  if (!portalBtn) return;
  
  try {
    const res = await fetch('api/auth_b2b.php?action=me', { credentials: 'include', cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      const user = data.data.user;
      
      portalBtn.href = 'portal.html';
      portalBtn.classList.add('profile-link');
      portalBtn.style.padding = '0';
      portalBtn.style.background = 'transparent';
      portalBtn.style.border = 'none';
      
      const avatarHtml = user.picture 
        ? `<img src="${user.picture}" alt="${user.name}">`
        : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`;

      portalBtn.innerHTML = `
        <div class="profile-portal-widget">
          <div class="profile-avatar-mini">${avatarHtml}</div>
          <span class="profile-label">Mi Portal</span>
          <div class="profile-dropdown">
            <div class="profile-info">
              <strong>${user.name}</strong>
              <span>${user.email}</span>
            </div>
            <a href="portal.html" class="dropdown-item">Mi Dashboard</a>
            <button onclick="logout()" class="dropdown-item logout-btn">Cerrar Sesión</button>
          </div>
        </div>`;
    } else {
      portalBtn.href = 'login.html';
      portalBtn.innerHTML = 'Mi Portal';
      portalBtn.classList.remove('profile-link');
      portalBtn.style.padding = '';
      portalBtn.style.background = '';
      portalBtn.style.border = '';
    }
  } catch (err) {
    console.log('Auth check failed');
  }
}

async function loadSiteSettings() {
  try {
    const res = await fetch('api/settings.php');
    const json = await res.json();
    if (json.success) {
      const s = json.data;
      
      // Hero Title & Subtitle are defined directly in HTML (not overridden by DB)
      // to preserve the animated rotating words effect.
      // If you need to update these, edit index.php or catalogo.html directly.

      
      // WhatsApp and Phone
      if (s.whatsapp || s.site_phone) {
        if (s.whatsapp) window.siteWhatsapp = s.whatsapp.replace(/\D/g, '');
        const cleanWa = window.siteWhatsapp || '';
        if (cleanWa) {
          document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
            try {
              const url = new URL(a.href);
              const text = url.searchParams.get('text') || '';
              a.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`;
            } catch(e) {
              a.href = `https://wa.me/${cleanWa}`;
            }
          });
        }
        const waDisplay = document.querySelector('.footer-contact-item svg path[d*="M22 16.92"]')?.parentElement?.nextElementSibling;
        if (waDisplay) {
           const lines = waDisplay.innerHTML.split('<br>');
           if (lines.length > 1) {
             if (s.site_phone) lines[0] = s.site_phone;
             if (s.whatsapp) lines[1] = `+${s.whatsapp}`;
             waDisplay.innerHTML = lines.join('<br>');
           } else {
             if (s.whatsapp && s.site_phone) waDisplay.innerHTML = `${s.site_phone}<br>+${s.whatsapp}`;
             else if (s.whatsapp) waDisplay.textContent = `+${s.whatsapp}`;
             else if (s.site_phone) waDisplay.textContent = s.site_phone;
           }
        }
        
        const ctaPhone = document.getElementById('cta-phone');
        if (ctaPhone) ctaPhone.textContent = s.site_phone || `+${s.whatsapp}`;
      }

      // Site Name
      if (s.site_name) {
        // Removed title override to preserve SEO HTML tags
        // document.title = document.title.replace('PromoInk', s.site_name);
        
        // Force PromoInk display in case live DB still has PromoInc
        const displaySiteName = s.site_name.replace(/PromoInc/ig, 'PromoInk');
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright) copyright.innerHTML = `&copy; ${new Date().getFullYear()} ${displaySiteName}. Todos los derechos reservados.`;
      }

      // Contact Email
      if (s.site_email) {
        const emailEl = document.querySelector('.footer-contact-item svg polyline[points*="22,6"]')?.parentElement?.nextElementSibling;
        if (emailEl) emailEl.textContent = s.site_email;
        
        const ctaEmail = document.getElementById('cta-email');
        if (ctaEmail) ctaEmail.textContent = s.site_email;
      }

      // Address
      if (s.site_address) {
        const addrEl = document.querySelector('.footer-contact-item svg path[d*="M21 10c0 7"]')?.parentElement?.nextElementSibling;
        if (addrEl) addrEl.textContent = s.site_address;
        // Contacto page address
        const ctoAddr = document.getElementById('cto-address');
        if (ctoAddr) ctoAddr.innerHTML = s.site_address;
        const ctoAddrLink = document.getElementById('cto-addr-link');
        if (ctoAddrLink) ctoAddrLink.href = `https://maps.google.com/?q=${encodeURIComponent(s.site_address)}`;
      }

      // Contacto page — phone, whatsapp, email links
      if (s.site_phone || s.whatsapp) {
        const phone = s.site_phone || (s.whatsapp ? `+${s.whatsapp}` : '');
        const wa    = s.whatsapp ? s.whatsapp.replace(/\D/g,'') : '';
        const ctoPhone    = document.getElementById('cto-phone');
        const ctoWa       = document.getElementById('cto-whatsapp');
        const ctoPhoneLink= document.getElementById('cto-phone-link');
        const ctoWaLink   = document.getElementById('cto-wa-link');
        if (ctoPhone    && phone) ctoPhone.textContent = phone;
        if (ctoWa       && wa)    ctoWa.textContent = `+${wa}`;
        if (ctoPhoneLink && phone) ctoPhoneLink.href = `tel:${phone.replace(/\s/g,'')}`;
        if (ctoWaLink   && wa)    ctoWaLink.href = `https://wa.me/${wa}?text=Hola%20PromoInk%20estoy%20interesado%20en...`;
      }
      if (s.site_email) {
        const ctoEmail     = document.getElementById('cto-email');
        const ctoEmailLink = document.getElementById('cto-email-link');
        if (ctoEmail)     ctoEmail.textContent = s.site_email;
        if (ctoEmailLink) ctoEmailLink.href = `mailto:${s.site_email}`;
      }

      // Social Media: Redirect all buttons to the Instagram profile
      const socialBtns = document.querySelectorAll('a.social-btn');
      socialBtns.forEach(btn => {
        btn.href = 'https://www.instagram.com/promoink.uio/';
        btn.target = '_blank';
      });
    }
  } catch (err) { console.error('Error loading settings:', err); }
}

async function loadDynamicCategories() {
  const nav = document.querySelector('.nav-categories');
  const filterList = document.getElementById('filter-categories-list');
  if (!nav && !filterList) return;

  try {
    console.log('Fetching dynamic categories...');
    const [resCats, resSettings] = await Promise.all([
      fetch('api/categories.php'),
      fetch('api/settings.php')
    ]);
    const json = await resCats.json();
    const settingsJson = await resSettings.json();
    const showSidebarCategories = !settingsJson.success || !settingsJson.data || settingsJson.data.show_sidebar_categories !== '0';
    
    let dynNav = '';
    let dynMobile = '';
    let dynFooter = '';
    
    if (json.success && json.data && json.data.length > 0) {
      catalogCategories = json.data;
      
      // Categorías en Navbar
      dynNav = json.data.map(cat => `
        <div class="nav-item-dropdown">
          <a href="catalogo.html?category=${cat.id}">
            ${cat.name} ${cat.children ? '<svg viewBox="0 0 24 24" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>' : ''}
          </a>
          ${cat.children ? `
            <div class="dropdown-menu">
              ${cat.children.map(child => `<a href="catalogo.html?category=${child.id}">${child.name}</a>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');

      // Categorías en Menú Móvil
      json.data.forEach(cat => {
        dynMobile += `
          <a href="catalogo.html?category=${cat.id}" class="mobile-cat-link" style="font-weight: 600;">
            ${cat.name}
            ${cat.children ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(90deg); opacity: 0.7;"><polyline points="6 9 12 15 18 9"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'}
          </a>
        `;
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(child => {
            dynMobile += `
              <a href="catalogo.html?category=${child.id}" class="mobile-cat-link" style="padding-left: 2rem; font-size: 0.9rem; opacity: 0.85; border-top: none;">
                <span style="margin-right: 0.3rem; opacity: 0.5;">↳</span> ${child.name}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            `;
          });
        }
      });

      // Categorías en Footer
      dynFooter = json.data.map(cat => `
        <li><a href="catalogo.html?category=${cat.id}" class="footer-link">${cat.name}</a></li>
      `).join('');
    }

    // Static Links ALWAYS append
    if (nav) {
      nav.innerHTML = dynNav + 
        '<a href="catalogo.html?category=all_grouped" class="nav-item-dropdown" style="color: var(--accent); font-weight: 600; text-decoration: none;">Todos los productos</a>' +
        '<a href="catalogo.html?category=portfolio" class="nav-item-dropdown" style="color: var(--accent); font-weight: 600; text-decoration: none;">Portafolio</a>' +
        '<a href="#" class="nav-link-ofertas">Ofertas</a>' +
        '<a href="nosotros.html" class="nav-item-dropdown" style="font-weight: 600; text-decoration: none;">Nosotros</a>' +
        '<a href="contacto.html" class="nav-item-dropdown" style="font-weight: 600; text-decoration: none;">Contacto</a>';
    }

    const mobileNav = document.getElementById('mobile-categories-list');
    if (mobileNav) {
      mobileNav.innerHTML = dynMobile + `
        <a href="catalogo.html?category=all_grouped" class="mobile-cat-link" style="border-top:1px solid var(--border); margin-top:0.5rem; padding-top:0.75rem; color:var(--accent); font-weight: 600;">
          📦 Todos los productos
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="catalogo.html?category=portfolio" class="mobile-cat-link" style="color:var(--accent); font-weight: 600;">
          📂 Portafolio de Trabajos
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="#" class="mobile-cat-link nav-link-ofertas" style="font-weight: 600;">
          🔥 Ofertas
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="nosotros.html" class="mobile-cat-link" style="font-weight: 600;">
          🏢 Nosotros
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <a href="contacto.html" class="mobile-cat-link" style="font-weight: 600;">
          📞 Contacto
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      `;
    }

    const footerNav = document.getElementById('footer-categories');
    if (footerNav) {
      footerNav.innerHTML = dynFooter + 
        `<li><a href="catalogo.html?category=all_grouped" class="footer-link" style="color:var(--accent); font-weight:600;">Todos los productos</a></li>` +
        `<li><a href="catalogo.html?category=portfolio" class="footer-link" style="color:var(--accent); font-weight:600;">Portafolio de Trabajos</a></li>` +
        `<li><a href="catalogo.html" class="footer-link">Ver todo el catálogo</a></li>`;
    }

    // Categorías en Sidebar de Catálogo
    if (filterList) {
      let categoriesHtml = '<div class="filter-item active" data-cat="all">Todas las categorías</div>';
      
      if (showSidebarCategories && json.success && json.data && json.data.length > 0) {
        json.data.forEach(c => {
          if (c.children && c.children.length > 0) {
            // Categoría principal con subcategorías (Acordeón)
            categoriesHtml += `
              <div class="filter-group-container" data-group="${c.id}" style="display: flex; flex-direction: column; width: 100%;">
                <div class="filter-item filter-parent-item" data-cat="${c.id}" style="display: flex; align-items: center; justify-content: space-between; width: 100%; cursor: pointer;">
                  <span>${c.name}</span>
                  <svg class="chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.7;"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="subcategory-list">
                  ${c.children.map(child => `
                    <div class="filter-item sub-filter-item" data-cat="${child.id}" style="font-size: 0.82rem; padding: 0.35rem 0.5rem; opacity: 0.8; display: flex; align-items: center; gap: 0.3rem;">
                      <span style="opacity: 0.4;">↳</span> ${child.name}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          } else {
            // Categoría principal sin subcategorías
            categoriesHtml += `<div class="filter-item" data-cat="${c.id}">${c.name}</div>`;
          }
        });
      }
      
      categoriesHtml += '<div class="filter-item" data-cat="portfolio" style="border-top: 1px solid var(--border); margin-top: 0.8rem; padding-top: 0.8rem; font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 0.5rem;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Trabajos Realizados</div>';
      
      filterList.innerHTML = categoriesHtml;

      // Resaltar categoría si ya está en los filtros iniciales
      filterList.querySelectorAll('.filter-item').forEach(x => x.classList.remove('active'));
      if (currentFilters.category && currentFilters.category !== 'all_grouped') {
        filterList.querySelectorAll('.filter-item').forEach(i => {
          if (i.dataset.cat == currentFilters.category) {
            i.classList.add('active');
          }
        });
      } else {
        const allItem = filterList.querySelector('.filter-item[data-cat="all"]');
        if (allItem) allItem.classList.add('active');
      }

      // Registrar eventos click para todos los filtros
      filterList.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          
          filterList.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          
          const selectedCat = item.dataset.cat === 'all' ? '' : item.dataset.cat;
          currentFilters.category = selectedCat;
          
          reloadCatalog();
        });
      });
    }

    // Categorías en Filtros Destacados (Home)
    const featuredFilterBar = document.getElementById('featured-filter-bar');
    if (featuredFilterBar && json.success && json.data) {
      featuredFilterBar.innerHTML = '<button class="filter-btn active" data-cat="all">Todos</button>' +
        json.data.map(c => `<button class="filter-btn" data-cat="${c.id}">${c.name}</button>`).join('');

      featuredFilterBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          featuredFilterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const catId = btn.dataset.cat === 'all' ? '' : btn.dataset.cat;
          loadFeaturedProducts(catId);
        });
      });
    }
  } catch (err) { console.error('Error loading categories:', err); }
}

// ── CATALOG LOGIC ─────────────────────────────────────────────
let currentFilters = { category: '', search: '', stock: false, featured: false, sort: 'featured', offset: 0 };
const CATALOG_LIMIT = 12;

function initCatalog() {
  // Get category from URL if exists
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) currentFilters.category = params.get('category');
  if (params.get('search')) {
    currentFilters.search = params.get('search');
    const sInput = document.getElementById('navbar-search-input');
    if (sInput) sInput.value = params.get('search');
  }
  if (params.get('on_sale')) {
    currentFilters.on_sale = true;
    const saleToggle = document.getElementById('filter-onsale');
    if (saleToggle) saleToggle.checked = true;
  }

  // Events
  document.getElementById('btn-navbar-search')?.addEventListener('click', () => {
    currentFilters.search = document.getElementById('navbar-search-input').value;
    reloadCatalog();
  });
  document.getElementById('navbar-search-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentFilters.search = e.target.value;
      reloadCatalog();
    }
  });
  document.getElementById('filter-stock')?.addEventListener('change', (e) => {
    currentFilters.stock = e.target.checked;
    reloadCatalog();
  });
  document.getElementById('filter-featured')?.addEventListener('change', (e) => {
    currentFilters.featured = e.target.checked;
    reloadCatalog();
  });
  document.getElementById('filter-onsale')?.addEventListener('change', (e) => {
    currentFilters.on_sale = e.target.checked;
    reloadCatalog();
  });
  document.getElementById('sort-products')?.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    reloadCatalog();
  });
  document.getElementById('btn-load-more')?.addEventListener('click', () => {
    currentFilters.offset += CATALOG_LIMIT;
    fetchCatalog(true);
  });

  fetchCatalog();
}

function reloadCatalog() {
  currentFilters.offset = 0;
  const grid = document.getElementById('catalog-grid');
  if (grid) grid.innerHTML = '<div class="card skeleton" style="height:380px"></div><div class="card skeleton" style="height:380px"></div>';
  fetchCatalog();
}

async function fetchCatalog(append = false) {
  const grid = document.getElementById('catalog-grid');
  if (grid) grid.style.display = ''; // Restore grid style

  if (currentFilters.category === 'portfolio') {
    const countEl = document.getElementById('results-count');
    const loadMore = document.getElementById('btn-load-more');
    if (loadMore) loadMore.classList.add('hidden');
    
    try {
      const res = await fetch('api/portfolio.php');
      const json = await res.json();
      if (json.success && grid) {
        if (countEl) countEl.textContent = `Mostrando ${json.data.length} trabajos realizados`;
        renderPortfolioItems(grid, json.data, append);
      }
    } catch (err) { console.error('Error fetching portfolio:', err); }
    return;
  }

  // Check if we should render grouped catalog view
  const isGroupedView = currentFilters.category === 'all_grouped' || 
    (!currentFilters.category && !currentFilters.search && !currentFilters.stock && !currentFilters.featured && !currentFilters.on_sale);

  if (isGroupedView) {
    const countEl = document.getElementById('results-count');
    const loadMore = document.getElementById('btn-load-more');
    if (loadMore) loadMore.classList.add('hidden');
    
    if (grid && !append) {
      grid.innerHTML = '<div class="card skeleton" style="height:380px"></div><div class="card skeleton" style="height:380px"></div><div class="card skeleton" style="height:380px"></div>';
    }
    
    try {
      const res = await fetch('api/catalog_pdf.php');
      const json = await res.json();
      if (json.success && grid) {
        if (countEl) countEl.textContent = `Mostrando ${json.data.total} productos en total`;
        
        grid.style.display = 'block'; // Turn off grid wrapper so sections stack vertically
        grid.innerHTML = '';
        
        json.data.categories.forEach(cat => {
          if (!cat.products || cat.products.length === 0) return;
          
          const sectionEl = document.createElement('div');
          sectionEl.className = 'category-group-section';
          sectionEl.style.marginBottom = '50px';
          
          sectionEl.innerHTML = `
            <div class="flex items-center gap-3" style="margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-top: 10px;">
              <span style="font-size: 1.5rem;">📁</span>
              <h2 class="display-3" style="margin: 0; font-size: 1.5rem; letter-spacing: -0.01em; font-weight: 800; color: #fff;">${cat.name}</h2>
              <span class="badge badge-stock" style="margin-left: 10px; font-size: 0.72rem; padding: 0.2rem 0.5rem; background: var(--border); color: #fff;">${cat.products.length} productos</span>
            </div>
            <div class="products-grid category-products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
            </div>
          `;
          
          grid.appendChild(sectionEl);
          
          const catGrid = sectionEl.querySelector('.category-products-grid');
          renderProducts(catGrid, cat.products, false);
        });
      }
    } catch (err) {
      console.error('Error fetching grouped catalog:', err);
    }
    return;
  }

  let url = `api/products.php?limit=${CATALOG_LIMIT}&offset=${currentFilters.offset}`;
  if (currentFilters.category) url += `&category=${currentFilters.category}`;
  if (currentFilters.search) url += `&search=${encodeURIComponent(currentFilters.search)}`;
  if (currentFilters.stock) url += `&in_stock=1`;
  if (currentFilters.featured) url += `&featured=1`;
  if (currentFilters.on_sale) url += `&on_sale=1`;
  
  const sortMap = { 
    'featured': '&sort=featured&dir=DESC',
    'price_asc': '&sort=price_from&dir=ASC',
    'price_desc': '&sort=price_from&dir=DESC',
    'new': '&sort=created_at&dir=DESC'
  };
  url += sortMap[currentFilters.sort] || sortMap.featured;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      const grid = document.getElementById('catalog-grid');
      const countEl = document.getElementById('results-count');
      if (countEl) countEl.textContent = `Mostrando ${json.data.items.length} de ${json.data.total} productos`;
      
      renderProducts(grid, json.data.items, append);
      
      const loadMore = document.getElementById('btn-load-more');
      if (loadMore) {
        if (json.data.total > currentFilters.offset + CATALOG_LIMIT) {
          loadMore.classList.remove('hidden');
        } else {
          loadMore.classList.add('hidden');
        }
      }
    }
  } catch (err) { console.error('Error fetching catalog:', err); }
}

async function loadFeaturedProducts(categoryId = '') {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="card skeleton" style="height:380px"></div><div class="card skeleton" style="height:380px"></div>';

  try {
    let url = 'api/products.php?featured=1&limit=8';
    if (categoryId) url += `&category=${categoryId}`;
    
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && json.data.items.length) {
      renderProducts(grid, json.data.items);
    } else {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1">No hay productos destacados en esta categoría por ahora.</div>';
    }
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">No se pudieron cargar los productos</div>';
  }
}

async function loadSaleProducts() {
  const grid = document.getElementById('offers-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="card skeleton" style="height:380px"></div><div class="card skeleton" style="height:380px"></div>';

  try {
    const res = await fetch('api/products.php?on_sale=1&limit=4');
    const json = await res.json();
    if (json.success && json.data.items.length) {
      renderProducts(grid, json.data.items);
    } else {
      // Si no hay ofertas, ocultamos la sección completa
      document.getElementById('ofertas-section')?.classList.add('hidden');
    }
  } catch (err) {
    console.error('Error loading offers:', err);
  }
}

function renderProducts(grid, products, append = false) {
  if (!grid) return;
  if (!append && !products.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1">No se encontraron productos con estos filtros.</div>';
    return;
  }

  const svgProduct = `<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><rect x='2' y='7' width='20' height='14' rx='2' ry='2'/><path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/></svg>`;
  
  const isProductPage = window.location.pathname.includes('producto.html');
  
  const html = products.map(p => {
    const imgUrl = p.image_webp ? `assets/images/${p.image_webp}` : null;
    const cleanName = (p.name || '').replace(/"/g, '&quot;');
    
    let titleHtml = `<div class="card-body" style="padding-bottom: 0;">
        <h3 class="card-title" style="margin-bottom: 0.5rem; font-size: 1rem;">${p.name}</h3>
        <p class="card-sku" style="margin-bottom: 1rem; font-size: 0.75rem;">${p.sku}</p>
      </div>`;
      
    return `
    <article class="card reveal visible" onclick="window.location.href='producto.html?id=${p.id}&v=${VERSION}'" style="cursor: pointer;" data-gallery="${p.images_gallery || ''}" data-main-img="${imgUrl || ''}">
      ${isProductPage ? titleHtml : ''}
      <div class="card-img-wrapper" style="aspect-ratio: 1/1; background: #1a1d21; position: relative; overflow: hidden;">
        ${parseInt(p.on_sale) ? `<div class="discount-floating-badge">-${p.sale_discount}%</div>` : ''}
        ${imgUrl 
          ? `<img src="${imgUrl}" alt="${cleanName}" class="card-img" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="img-placeholder" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; flex-direction:column; gap:10px;">${svgProduct}<span style="font-size:0.85rem;">${cleanName}</span></div>`
          : `<div class="img-placeholder" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; flex-direction:column; gap:10px;">${svgProduct}<span style="font-size:0.85rem;">${cleanName}</span></div>`
        }
      </div>
      <div class="card-body">
        ${!isProductPage ? `<h3 class="card-title">${p.name}</h3><p class="card-sku">${p.sku}</p>` : ''}
        <div class="card-badges" style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px;">
          ${parseInt(p.on_sale) ? `<span class="badge badge-sale">Oferta -${p.sale_discount}%</span><div style="flex-basis: 100%; height: 0;"></div>` : ''}
          ${parseInt(p.total_stock) > 0 ? '<span class="badge badge-stock">Stock Disponible</span>' : '<span class="badge badge-nostock">Sin Stock</span>'}
          ${parseInt(p.featured) ? '<span class="badge badge-featured">Destacado</span>' : ''}
          ${parseInt(p.customizable) ? '<span class="badge badge-customizable">Personalizable</span>' : ''}
        </div>
        <div style="margin-bottom: 0.75rem;">
          <p class="card-price" style="font-size: 0.78rem; margin-bottom: 2px;">Desde</p>
          ${parseInt(p.on_sale) && p.sale_price 
            ? `<span class="price-original">$${parseFloat(p.price_from || 0).toFixed(2)}</span>
               <strong style="font-size: 1.35rem; color: var(--accent-pink); font-family: var(--font-display);">$${parseFloat(p.sale_price).toFixed(2)}</strong>`
            : `<strong style="font-size: 1.35rem; color: var(--accent-pink); font-family: var(--font-display);">$${parseFloat(p.price_from || 0).toFixed(2)}</strong>`
          }
          ${parseInt(p.show_min_quantity) === 1 ? `<p class="card-min" style="font-size: 0.7rem; margin-top: 2px;">Mín. ${p.min_quantity || 10} unidades</p>` : `<p class="card-min" style="font-size: 0.7rem; margin-top: 2px; visibility: hidden;">Mín. ${p.min_quantity || 10} unidades</p>`}
        </div>
        <div style="display:flex; gap:8px; align-items:center;" onclick="event.stopPropagation()">
          <button
            title="Agregar al carrito"
            onclick="quickAddToCart(event, ${p.id}, '${p.name.replace(/'/g,"\\'")}', '${p.sku}', ${(parseInt(p.on_sale) && p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price_from||0)).toFixed(2)}, '${p.image_webp||''}', ${p.min_quantity||10}, ${parseFloat(p.shipping_cost)||0})"
            style="
              width:38px; height:38px; border-radius:10px; border: none; cursor:pointer;
              background: linear-gradient(135deg, var(--accent-pink), var(--accent-pink-d));
              color: #fff; display:flex; align-items:center; justify-content:center;
              box-shadow: 0 4px 15px rgba(232,62,140,0.4);
              transition: transform 0.15s, box-shadow 0.15s;
              flex-shrink: 0;
            "
            onmouseenter="this.style.transform='scale(1.12)'; this.style.boxShadow='0 6px 20px rgba(232,62,140,0.6)'"
            onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(232,62,140,0.4)'"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
          <a
            href="javascript:void(0)"
            onclick="event.stopPropagation(); const wa = window.siteWhatsapp || '5930987827215'; const txt = 'Hola PromoInk, me interesa cotizar:%0AProducto: ${encodeURIComponent(p.name)}%0ASKU: ${p.sku}' + (${parseInt(p.show_min_quantity) === 1 ? `'%0ACantidad mínima: ${p.min_quantity || 10} unidades'` : `''`}); window.open('https://wa.me/' + wa + '?text=' + txt, '_blank');"
            style="
              flex: 1; display:flex; align-items:center; justify-content:center; gap:6px;
              padding: 0.5rem 0.75rem; border-radius:10px; font-size:0.8rem; font-weight:700;
              background: linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-d));
              color:#000; text-decoration:none; letter-spacing:0.03em;
              box-shadow: 0 4px 15px rgba(0,188,255,0.3);
              transition: transform 0.15s, box-shadow 0.15s;
            "
            onmouseenter="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 22px rgba(0,188,255,0.5)'"
            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,188,255,0.3)'"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Cotizar
          </a>
        </div>
      </div>
    </article>`;
  }).join('');

  if (append) grid.innerHTML += html;
  else grid.innerHTML = html;

  // Re-observe new elements
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── Quick Add to Cart (from product cards) ──────────────── */
window.quickAddToCart = async function(event, productId, name, sku, price, imageWebp, minQty, shippingCost) {
  event.stopPropagation();
  const btn = event.currentTarget;

  // Animate button
  btn.style.transform = 'scale(0.85)';
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
  }, 1200);

  if (typeof CartManager === 'undefined') {
    // Fallback: redirect to product page
    window.location.href = `producto.html?id=${productId}&v=2.8`;
    return;
  }

  await CartManager.addItem({
    product_id: productId,
    name: name,
    sku: sku,
    quantity: parseInt(minQty),
    unit_price: parseFloat(price),
    image_webp: imageWebp,
    min_quantity: parseInt(minQty),
    shipping_cost: parseFloat(shippingCost) || 0
  });

  // Trigger re-render if renderCart exists on this page
  if (typeof renderCart === 'function') {
    renderCart(CartManager.getItems());
  }
  // Open cart if openCart exists
  if (typeof openCart === 'function') {
    openCart();
  }
};

async function logout() {
  try {
    const res = await fetch('api/auth_b2b.php?action=logout', { credentials: 'include' });
    if (res.ok) {
      window.location.href = 'login.html';
    }
  } catch (err) {
    console.error('Logout failed', err);
    window.location.href = 'login.html';
  }
}

// ── UTILS ─────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

function renderPortfolioItems(container, items, append = false) {
  if (!append) container.innerHTML = '';
  
  if (!items.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No hay trabajos realizados registrados por el momento.</div>';
    return;
  }

  const cards = items.map(item => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <div class="product-image-container" style="aspect-ratio: 1/1; overflow: hidden; position: relative; border-radius: var(--radius-md) var(--radius-md) 0 0;">
        <img src="assets/images/${item.filename}" alt="${escHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
      </div>
      <div class="product-info" style="padding: 1.25rem;">
        <span style="font-size: 0.65rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 0.25rem;">Trabajo Realizado</span>
        <h3 class="product-title" style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--text-primary);">${escHtml(item.title)}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">${escHtml(item.description || '')}</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      openPortfolioLightbox(item.filename, item.title, item.description || '');
    });
    
    return card;
  });

  if (append) {
    cards.forEach(card => container.appendChild(card));
  } else {
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
  }

  // Re-observe new elements to make them fade in elegantly
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  container.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function openPortfolioLightbox(filename, title, description) {
  let lightbox = document.getElementById('portfolio-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'portfolio-lightbox';
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 10, 0.95);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    lightbox.innerHTML = `
      <div style="position: absolute; top: 1.5rem; right: 1.5rem; color: white; font-size: 2rem; cursor: pointer; font-weight: 300;" onclick="closePortfolioLightbox()">✕</div>
      <div class="lightbox-content" style="max-width: 900px; width: 100%; display: flex; flex-direction: column; background: #161618; border: 1px solid #2a2a2c; border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform 0.3s ease;">
        <div style="width: 100%; aspect-ratio: 16/10; background: #0c0c0d; display: flex; justify-content: center; align-items: center;">
          <img id="lightbox-img" src="" alt="Trabajo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div style="padding: 2rem; border-top: 1px solid #2a2a2c;">
          <span style="font-size: 0.7rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 0.5rem;">Detalle de Trabajo Realizado</span>
          <h2 id="lightbox-title" style="margin: 0 0 0.75rem 0; color: white; font-size: 1.5rem;"></h2>
          <p id="lightbox-desc" style="margin: 0; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;"></p>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }
  
  document.getElementById('lightbox-img').src = `assets/images/${filename}`;
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-desc').textContent = description;
  
  lightbox.style.display = 'flex';
  setTimeout(() => {
    lightbox.style.opacity = '1';
    lightbox.querySelector('.lightbox-content').style.transform = 'scale(1)';
  }, 10);
}

function closePortfolioLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  if (lightbox) {
    lightbox.style.opacity = '0';
    lightbox.querySelector('.lightbox-content').style.transform = 'scale(0.9)';
    setTimeout(() => {
      lightbox.style.display = 'none';
    }, 300);
  }
}

// ── Hover Image Rotation for Catalog Products with multiple gallery images ──
let hoverInterval = null;
let hoverImages = [];
let hoverIndex = 0;
let currentImgElement = null;
let originalSrc = '';

document.addEventListener('mouseover', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  
  const galleryStr = card.getAttribute('data-gallery');
  if (!galleryStr) return;
  
  const img = card.querySelector('.card-img');
  if (!img || currentImgElement === img) return;
  
  // Clear any existing rotation
  if (hoverInterval) {
    clearInterval(hoverInterval);
    if (currentImgElement && originalSrc) {
      currentImgElement.src = originalSrc;
    }
  }
  
  const mainImg = card.getAttribute('data-main-img') || img.src;
  const galleryImgs = galleryStr.split(',').filter(Boolean).map(filename => `assets/images/${filename}`);
  
  if (galleryImgs.length === 0) return;
  
  // Build queue of images to rotate: original image + gallery images
  hoverImages = [mainImg, ...galleryImgs];
  hoverIndex = 0;
  currentImgElement = img;
  originalSrc = mainImg;
  
  hoverInterval = setInterval(() => {
    hoverIndex = (hoverIndex + 1) % hoverImages.length;
    img.src = hoverImages[hoverIndex];
  }, 1000); // Fluid rotation every 1.0s
});

document.addEventListener('mouseout', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  
  // Verify if we are actually leaving the card container
  const related = e.relatedTarget;
  if (related && card.contains(related)) return;
  
  if (hoverInterval) {
    clearInterval(hoverInterval);
    hoverInterval = null;
  }
  if (currentImgElement && originalSrc) {
    currentImgElement.src = originalSrc;
  }
  currentImgElement = null;
  originalSrc = '';
});
