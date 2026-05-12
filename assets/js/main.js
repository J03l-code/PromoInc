/* PromoInc — main.js */
const VERSION = '52.0';

document.addEventListener('DOMContentLoaded', () => {
  
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
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
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
                  <img src="assets/images/${b.filename}" alt="${b.name}" style="filter: brightness(0) invert(1); opacity: 0.9; max-height: 100px; max-width: 250px; transition: all 0.3s ease; object-fit: contain;">
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

      
      // WhatsApp
      if (s.whatsapp) {
        window.siteWhatsapp = s.whatsapp;
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
          try {
            const url = new URL(a.href);
            const text = url.searchParams.get('text') || '';
            a.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(text)}`;
          } catch(e) {
            a.href = `https://wa.me/${s.whatsapp}`;
          }
        });
        const waDisplay = document.querySelector('.footer-contact-item svg path[d*="M22 16.92"]')?.parentElement?.nextElementSibling;
        if (waDisplay) {
           const lines = waDisplay.innerHTML.split('<br>');
           if (lines.length > 1) {
             lines[1] = `+${s.whatsapp}`;
             waDisplay.innerHTML = lines.join('<br>');
           } else {
             waDisplay.textContent = `+${s.whatsapp}`;
           }
        }
      }

      // Site Name
      if (s.site_name) {
        document.title = document.title.replace('PromoInc', s.site_name);
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright) copyright.innerHTML = `&copy; ${new Date().getFullYear()} ${s.site_name}. Todos los derechos reservados.`;
      }

      // Contact Email
      if (s.site_email) {
        const emailEl = document.querySelector('.footer-contact-item svg polyline[points*="22,6"]')?.parentElement?.nextElementSibling;
        if (emailEl) emailEl.textContent = s.site_email;
      }

      // Address
      if (s.site_address) {
        const addrEl = document.querySelector('.footer-contact-item svg path[d*="M21 10c0 7"]')?.parentElement?.nextElementSibling;
        if (addrEl) addrEl.textContent = s.site_address;
      }

      // Social Media
      if (s.instagram) {
        const insta = document.querySelector('a.social-btn svg rect')?.parentElement;
        if (insta) insta.href = `https://instagram.com/${s.instagram}`;
      }
      if (s.facebook) {
        const fb = document.querySelector('a.social-btn svg path[d*="M18 2h-3"]')?.parentElement;
        if (fb) fb.href = `https://facebook.com/${s.facebook}`;
      }
    }
  } catch (err) { console.error('Error loading settings:', err); }
}

async function loadDynamicCategories() {
  const nav = document.querySelector('.nav-categories');
  if (!nav) return;

  try {
    console.log('Fetching dynamic categories...');
    const res = await fetch('api/categories.php');
    const json = await res.json();
    if (json.success && json.data.length) {
      catalogCategories = json.data;
      
      // Categorías en Navbar
      nav.innerHTML = json.data.map(cat => `
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
      `).join('') + '<a href="#" class="nav-link-ofertas">Ofertas</a>';

      // Categorías en Menú Móvil
      const mobileNav = document.getElementById('mobile-categories-list');
      if (mobileNav) {
        mobileNav.innerHTML = json.data.map(cat => `
          <a href="catalogo.html?category=${cat.id}" class="mobile-cat-link">
            ${cat.name}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        `).join('');
      }

      // Categorías en Footer
      const footerNav = document.getElementById('footer-categories');
      if (footerNav) {
        footerNav.innerHTML = json.data.map(cat => `
          <li><a href="catalogo.html?category=${cat.id}" class="footer-link">${cat.name}</a></li>
        `).join('') + `<li><a href="catalogo.html" class="footer-link">Ver todo el catálogo</a></li>`;
      }

      // Categorías en Sidebar de Catálogo
      const filterList = document.getElementById('filter-categories-list');
      if (filterList) {
        filterList.innerHTML = '<div class="filter-item active" data-cat="all">Todas las categorías</div>' + 
          json.data.map(c => `<div class="filter-item" data-cat="${c.id}">${c.name}</div>`).join('');
        
        // Add events to sidebar filters
        filterList.querySelectorAll('.filter-item').forEach(item => {
          item.addEventListener('click', () => {
            filterList.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentFilters.category = item.dataset.cat === 'all' ? '' : item.dataset.cat;
            reloadCatalog();
          });
        });
      }
      // Categorías en Filtros Destacados (Home)
      const featuredFilterBar = document.getElementById('featured-filter-bar');
      if (featuredFilterBar) {
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
    <article class="card reveal" onclick="window.location.href='producto.html?id=${p.id}&v=${VERSION}'" style="cursor: pointer;">
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
          ${parseInt(p.on_sale) ? `<span class="badge badge-sale">Oferta -${p.sale_discount}%</span>` : ''}
          ${parseInt(p.total_stock) > 0 ? '<span class="badge badge-stock">Stock Disponible</span>' : '<span class="badge badge-nostock">Sin Stock</span>'}
          ${parseInt(p.featured) ? '<span class="badge badge-featured">Destacado</span>' : ''}
          ${parseInt(p.customizable) ? '<span class="badge badge-customizable">Personalizable</span>' : ''}
        </div>
        <div style="margin-bottom: 0.75rem;">
          <p class="card-price" style="font-size: 0.78rem; margin-bottom: 2px;">Desde</p>
          ${parseInt(p.on_sale) && p.sale_price 
            ? `<span class="price-original">$${parseFloat(p.price_from || 0).toFixed(2)}</span>
               <strong style="font-size: 1.35rem; color: var(--accent-pink); font-family: var(--font-display);">$${parseFloat(p.sale_price).toFixed(2)}</strong>`
            : `<strong style="font-size: 1.35rem; color: var(--accent-gold); font-family: var(--font-display);">$${parseFloat(p.price_from || 0).toFixed(2)}</strong>`
          }
          <p class="card-min" style="font-size: 0.7rem; margin-top: 2px;">Mín. ${p.min_quantity || 10} unidades</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center;" onclick="event.stopPropagation()">
          <button
            title="Agregar al carrito"
            onclick="quickAddToCart(event, ${p.id}, '${p.name.replace(/'/g,"\\'")}', '${p.sku}', ${parseFloat(p.price_from||0).toFixed(2)}, '${p.image_webp||''}', ${p.min_quantity||10})"
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
          <a href="producto.html?id=${p.id}&v=${VERSION}"
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
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
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
window.quickAddToCart = async function(event, productId, name, sku, price, imageWebp, minQty) {
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
    min_quantity: parseInt(minQty)
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
