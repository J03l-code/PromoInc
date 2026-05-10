/* PromoInc — main.js */
document.addEventListener('DOMContentLoaded', () => {

  // Page loader
  const loader = document.getElementById('page-loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1400);

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger
  const toggle = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
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

  // Ticker duplicate
  const track = document.querySelector('.ticker-track');
  if (track) track.innerHTML += track.innerHTML;

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
      } else throw new Error(data.error);
    } catch(err) {
      window.showToast('Error al enviar. Intente de nuevo.', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Solicitar Cotización';
    }
  });

  // Load all dynamic data
  console.log('Main.js v1.8 initialized');
  loadSiteSettings();
  loadDynamicCategories();
  
  // Navbar search event
  const navSearchBtn = document.getElementById('btn-navbar-search');
  const navSearchInp = document.getElementById('navbar-search-input');
  if (navSearchBtn && navSearchInp) {
    const doSearch = () => {
      const q = navSearchInp.value.trim();
      if (q) window.location.href = `catalogo.html?search=${encodeURIComponent(q)}`;
    };
    navSearchBtn.addEventListener('click', doSearch);
    navSearchInp.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
  }
  
  if (document.getElementById('catalog-grid')) {
    initCatalog();
  } else {
    loadFeaturedProducts();
  }
});

// Cache for categories
let catalogCategories = [];

async function loadSiteSettings() {
  try {
    const res = await fetch('api/settings.php');
    const json = await res.json();
    if (json.success) {
      const s = json.data;
      if (s.hero_title) {
        const titleEl = document.querySelector('.hero-bento h1');
        if (titleEl) titleEl.innerHTML = s.hero_title.replace('merchandising', `<span class="text-pink glitch" data-text="merchandising">merchandising</span>`);
      }
      if (s.hero_subtitle) {
        const subEl = document.querySelector('.hero-bento .text-muted');
        if (subEl) subEl.textContent = s.hero_subtitle;
      }
      if (s.whatsapp) {
        window.siteWhatsapp = s.whatsapp;
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
          const text = a.href.split('text=')[1] || '';
          a.href = `https://wa.me/${s.whatsapp}?text=${text}`;
        });
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
    const sInput = document.getElementById('catalog-search');
    if (sInput) sInput.value = params.get('search');
  }

  // Events
  document.getElementById('btn-search-catalog')?.addEventListener('click', () => {
    currentFilters.search = document.getElementById('catalog-search').value;
    reloadCatalog();
  });
  document.getElementById('catalog-search')?.addEventListener('keypress', (e) => {
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
    <article class="card reveal" onclick="window.location.href='producto.html?id=${p.id}&v=2.7'" style="cursor: pointer;">
      ${isProductPage ? titleHtml : ''}
      <div class="card-img-wrapper" style="aspect-ratio: 1/1; background: #1a1d21; position: relative; overflow: hidden;">
        ${imgUrl 
          ? `<img src="${imgUrl}" alt="${cleanName}" class="card-img" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="img-placeholder" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; flex-direction:column; gap:10px;">${svgProduct}<span style="font-size:0.85rem;">${cleanName}</span></div>`
          : `<div class="img-placeholder" style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; flex-direction:column; gap:10px;">${svgProduct}<span style="font-size:0.85rem;">${cleanName}</span></div>`
        }
      </div>
      <div class="card-body" style="padding-top: 1rem;">
        ${!isProductPage ? `<h3 class="card-title">${p.name}</h3><p class="card-sku">${p.sku}</p>` : ''}
        <div class="card-badges" style="margin-bottom: 0.75rem;">
          ${parseInt(p.total_stock) > 0 ? '<span class="badge badge-stock">Stock Disponible</span>' : '<span class="badge badge-nostock">Sin Stock</span>'}
          ${parseInt(p.featured) ? '<span class="badge badge-featured">Destacado</span>' : ''}
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="card-price" style="font-size: 0.8rem;">Desde <strong style="font-size: 1.2rem; color: var(--accent-gold);">$${parseFloat(p.price_from || 0).toFixed(2)}</strong></p>
            <p class="card-min" style="font-size: 0.7rem;">Mín. ${p.min_quantity || 10} unidades</p>
          </div>
          <a href="producto.html?id=${p.id}&v=2.7" class="btn btn-secondary btn-sm" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Cotizar</a>
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
