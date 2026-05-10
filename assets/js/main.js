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
  loadSiteSettings();
  loadDynamicCategories();
  loadFeaturedProducts();
});

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
      // Actualizar links de contacto si existen
      if (s.whatsapp) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => a.href = `https://wa.me/${s.whatsapp}`);
      }
    }
  } catch (err) { console.error('Error loading settings:', err); }
}

async function loadDynamicCategories() {
  const nav = document.querySelector('.nav-categories');
  if (!nav) return;

  try {
    const res = await fetch('api/categories.php');
    const json = await res.json();
    if (json.success && json.data.length) {
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
    }
  } catch (err) { console.error('Error loading categories:', err); }
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  try {
    const res = await fetch('api/products.php?featured=1&limit=8');
    const json = await res.json();
    if (json.success && json.data.items.length) {
      renderProducts(grid, json.data.items);
    } else {
      grid.innerHTML = '<div class="empty-state">No hay productos destacados por ahora.</div>';
    }
  } catch (err) {
    console.error('Error loading products:', err);
    grid.innerHTML = '<div class="empty-state">No se pudieron cargar los productos</div>';
  }
}

function renderProducts(grid, products) {
  const svgProduct = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`;
  
  grid.innerHTML = products.map(p => {
    const imgUrl = p.image_webp ? `assets/images/${p.image_webp}` : null;
    return `
    <article class="card reveal" data-id="${p.id}">
      <div class="card-img-wrapper">
        ${imgUrl 
          ? `<img src="${imgUrl}" alt="${p.name}" class="card-img" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<div class=\'img-placeholder\'>${svgProduct}</div>'">`
          : `<div class="img-placeholder">${svgProduct}<span>${p.category_name || 'Producto'}</span></div>`
        }
        <div class="card-img-overlay">
          <a href="producto.html?id=${p.id}" class="btn btn-primary btn-sm w-full" style="justify-content:center">Ver Detalle</a>
        </div>
      </div>
      <div class="card-body">
        <div class="card-badges">
          ${parseInt(p.total_stock) > 0 ? '<span class="badge badge-stock">Stock Disponible</span>' : '<span class="badge" style="background:rgba(220,53,69,0.1);color:#dc3545;border-color:rgba(220,53,69,0.3)">Sin Stock</span>'}
          ${parseInt(p.featured) ? '<span class="badge badge-featured">Destacado</span>' : ''}
        </div>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-sku">${p.sku}</p>
        <div class="flex items-center justify-between">
          <div>
            <p class="card-price">Desde <strong>$${parseFloat(p.price_from || 0).toFixed(2)}</strong></p>
            <p class="card-min">Mín. ${p.min_quantity || 10} unidades</p>
          </div>
          <a href="producto.html?id=${p.id}" class="btn btn-secondary btn-sm">Cotizar</a>
        </div>
      </div>
    </article>`;
  }).join('');

  // Re-observe new elements
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
