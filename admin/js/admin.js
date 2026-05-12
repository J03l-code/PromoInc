/* ============================================================
   PromoInc — Admin Dashboard JS (Parte 1: Core + Auth + Nav)
   ============================================================ */

'use strict';

const API = '../api';
const VERSION = '47.4';
let currentUser = null;
let productsPage = 0;
const LIMIT = 20;

// ── UTILIDADES ────────────────────────────────────────────────
async function api(endpoint, method = 'GET', body = null) {
  let finalMethod = method;
  let finalBody   = body;

  // Emulación de métodos vía POST para máxima compatibilidad con servidores compartidos
  if (method === 'PUT' || method === 'DELETE') {
    finalMethod = 'POST';
    finalBody = { ...body, _method: method };
  }

  const opts = {
    method: finalMethod,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };

  if (finalBody && finalMethod !== 'GET') {
    opts.body = JSON.stringify(finalBody);
  }

  try {
    const res = await fetch(`${API}/${endpoint}`, opts);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('API Response was not JSON:', text);
      return { success: false, error: 'Error en la respuesta del servidor' };
    }
  } catch (err) {
    console.error('API Connection Error:', err);
    return { success: false, error: 'No se pudo conectar con el servidor' };
  }
}

function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n) {
  if (!n) return '—';
  return '$' + parseFloat(n).toLocaleString('es-CO');
}

function statusBadge(s) {
  const map = {
    active: 'Activo', inactive: 'Inactivo',
    new: 'Nueva', read: 'Leída', responded: 'Respondida', closed: 'Cerrada',
    1: 'Activo', 0: 'Inactivo',
  };
  return `<span class="status-badge status-${s}">${map[s] ?? s}</span>`;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── MODALES ───────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) closeModal(closeBtn.dataset.close);
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);

  const navLink = e.target.closest('[data-section]');
  if (navLink) {
    e.preventDefault();
    const sec = navLink.dataset.section;
    if (sec) navigateTo(sec);
  }
});

// ── NAVEGACIÓN ────────────────────────────────────────────────
function navigateTo(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`section-${section}`);
  if (el) el.classList.remove('hidden');
  console.log('Navigated to:', section);

  document.querySelectorAll(`[data-section="${section}"]`).forEach(n => n.classList.add('active'));
  document.getElementById('page-title').textContent = {
    dashboard: 'Dashboard', products: 'Productos', categories: 'Categorías',
    quotes: 'Cotizaciones', users: 'Administradores', settings: 'Configuración',
    orders: 'Gestión de Pedidos', clients: 'Directorio de Clientes'
  }[section] || section;

  // Cerrar sidebar en mobile
  document.getElementById('sidebar').classList.remove('open');

  if (section === 'settings') {
    const vEl = document.getElementById('current-asset-version');
    if (vEl) vEl.textContent = `v${VERSION}`;
  }

  const loaders = { dashboard: loadDashboard, products: loadProducts,
    categories: loadCategories, brands: loadBrands, quotes: () => loadQuotes(), users: loadUsers, settings: loadSettings,
    orders: loadOrders, clients: loadClients };
  loaders[section]?.();
}

// ── AUTH ──────────────────────────────────────────────────────
async function checkAuth() {
  const res = await api('auth.php');
  if (!res.data?.loggedIn) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = res.data.user;
  document.getElementById('user-name').textContent  = currentUser.name;
  document.getElementById('user-role').textContent  = currentUser.role;
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  // Ocultar sección usuarios si no es superadmin
  if (currentUser.role !== 'superadmin') {
    document.getElementById('nav-users')?.classList.add('hidden');
  }
}

document.getElementById('btn-logout').addEventListener('click', async () => {
  await api('auth.php', 'POST', { action: 'logout' });
  window.location.href = 'login.html';
});

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── DASHBOARD ─────────────────────────────────────────────────
async function loadDashboard() {
  // Estadísticas en paralelo
  const [prodRes, catRes, quoteRes] = await Promise.all([
    api('admin_products.php?limit=1'),
    api('admin_categories.php'),
    api('admin_quotes.php?status=new&limit=1'),
  ]);

  if (prodRes.success)  document.getElementById('stat-products').textContent   = prodRes.data.total;
  if (catRes.success)   document.getElementById('stat-categories').textContent = catRes.data.length;
  if (quoteRes.success) {
    const newCount = quoteRes.data.total;
    document.getElementById('stat-quotes').textContent = newCount;
    const badge = document.getElementById('badge-quotes');
    badge.textContent = newCount > 0 ? newCount : '';
    document.getElementById('tab-badge-new').textContent = newCount > 0 ? newCount : '';
  }

  // Stock total
  const stockRes = await api('admin_products.php?limit=200');
  if (stockRes.success) {
    const total = stockRes.data.items.reduce((s, p) => s + parseInt(p.total_stock || 0), 0);
    document.getElementById('stat-stock').textContent = total.toLocaleString('es-CO');
  }

  // Recientes
  const recentQ = await api('admin_quotes.php?limit=5');
  const ql = document.getElementById('recent-quotes-list');
  if (recentQ.success && recentQ.data.items.length) {
    ql.innerHTML = recentQ.data.items.map(q => `
      <div class="recent-item">
        <div><div class="recent-name">${escHtml(q.company)}</div><div class="recent-sub">${escHtml(q.contact_name || q.contact)}</div></div>
        <div>${statusBadge(q.status)}</div>
      </div>`).join('');
  } else {
    ql.innerHTML = '<div class="empty-state">Sin cotizaciones aún</div>';
  }

  const recentP = await api('admin_products.php?limit=5');
  const pl = document.getElementById('recent-products-list');
  if (recentP.success && recentP.data.items.length) {
    pl.innerHTML = recentP.data.items.map(p => `
      <div class="recent-item">
        <div><div class="recent-name">${escHtml(p.name)}</div><div class="recent-sub">${escHtml(p.sku)}</div></div>
        <div style="font-size:0.8rem;color:var(--cyan)">${p.total_stock} uds</div>
      </div>`).join('');
  } else {
    pl.innerHTML = '<div class="empty-state">Sin productos aún</div>';
  }
}

// ── PRODUCTOS ─────────────────────────────────────────────────
let allCategories = [];

async function loadProducts() {
  const search   = document.getElementById('search-products').value;
  const category = document.getElementById('filter-category').value;
  const active   = document.getElementById('filter-active').value;
  const offset   = productsPage * LIMIT;

  let url = `admin_products.php?limit=${LIMIT}&offset=${offset}`;
  if (search)   url += `&search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${category}`;
  if (active !== '') url += `&active=${active}`;

  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading-row">Cargando...</td></tr>';

  const res = await api(url);
  if (!res.success) { toast('Error al cargar productos', 'error'); return; }

  const { items, total } = res.data;
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay productos</td></tr>';
    document.getElementById('products-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr>
      <td>
        ${p.image_webp
          ? `<img src="../assets/images/${escHtml(p.image_webp)}" class="product-thumb" style="width:44px;height:44px;object-fit:cover;border-radius:6px;" alt="">`
          : `<div class="product-thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
      </td>
      <td>
        <div style="font-weight:600;font-size:0.88rem">${escHtml(p.name)}</div>
        <div style="font-size:0.75rem;color:var(--muted)">${escHtml(p.sku)}</div>
      </td>
      <td style="font-size:0.84rem">${escHtml(p.category_name || '—')}</td>
      <td style="font-size:0.84rem">${fmtCurrency(p.price_from)}</td>
      <td>
        <span style="font-size:0.84rem;color:${parseInt(p.total_stock)>0?'var(--green)':'var(--red)'}">
          ${parseInt(p.total_stock).toLocaleString('es-CO')}
        </span>
      </td>
      <td>${statusBadge(parseInt(p.active) ? 'active' : 'inactive')}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="editProduct(${p.id})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="deleteProduct(${p.id},'${escHtml(p.name)}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  // Paginación
  const pages = Math.ceil(total / LIMIT);
  const pag = document.getElementById('products-pagination');
  pag.innerHTML = '';
  if (pages > 1) {
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === productsPage ? ' active' : '');
      btn.textContent = i + 1;
      btn.onclick = () => { productsPage = i; loadProducts(); };
      pag.appendChild(btn);
    }
  }
}

async function populateCategorySelects(force = false) {
  try {
    if (force || !allCategories.length) {
      const res = await api('admin_categories.php');
      if (res.success) allCategories = res.data;
    }
    
    const filterSel   = document.getElementById('filter-category');
    const productSel  = document.getElementById('product-category');
    
    const options = allCategories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    
    if (filterSel) {
      const first = filterSel.options[0]?.outerHTML || '<option value="">Todas las categorías</option>';
      filterSel.innerHTML = first + options;
    }
    if (productSel) {
      const first = productSel.options[0]?.outerHTML || '<option value="">Seleccionar categoría...</option>';
      productSel.innerHTML = first + options;
    }
    console.log('Category selects populated');
  } catch (err) {
    console.error('Error populating categories:', err);
  }
}

// Búsqueda con debounce
let searchTimer;
document.getElementById('search-products').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { productsPage = 0; loadProducts(); }, 350);
});
document.getElementById('filter-category').addEventListener('change', () => { productsPage = 0; loadProducts(); });
document.getElementById('filter-active').addEventListener('change',   () => { productsPage = 0; loadProducts(); });

// ── NUEVO PRODUCTO ────────────────────────────────────────────
document.getElementById('btn-new-product').addEventListener('click', () => {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('modal-product-title').textContent = 'Nuevo Producto';
  document.getElementById('upload-placeholder').classList.remove('hidden');
  document.getElementById('upload-preview').classList.add('hidden');
  document.getElementById('product-image').value = '';
  document.getElementById('product-onsale').checked = false;
  document.getElementById('sale-price-group').style.display = 'none';
  document.getElementById('product-sale-price').value = '';
  document.getElementById('sale-discount-info').textContent = '';
  populateCategorySelects(true);
  document.getElementById('price-tiers-container').innerHTML = ''; // Limpiar tiers
  openModal('modal-product');
});

// Lógica de Ofertas
document.getElementById('product-onsale').addEventListener('change', e => {
  document.getElementById('sale-price-group').style.display = e.target.checked ? 'block' : 'none';
  calculateDiscount();
});

document.getElementById('product-price').addEventListener('input', calculateDiscount);
document.getElementById('product-sale-price').addEventListener('input', calculateDiscount);

function calculateDiscount() {
  const price = parseFloat(document.getElementById('product-price').value);
  const salePrice = parseFloat(document.getElementById('product-sale-price').value);
  const info = document.getElementById('sale-discount-info');
  
  if (price > 0 && salePrice > 0 && salePrice < price) {
    const disc = Math.round(((price - salePrice) / price) * 100);
    info.textContent = `Ahorro del ${disc}% configurado automáticamente`;
  } else {
    info.textContent = '';
  }
}

// Manejo de escalas de precios
const btnAddTier = document.getElementById('btn-add-tier');
if (btnAddTier) {
  btnAddTier.addEventListener('click', () => {
    console.log('Add tier clicked');
    addPriceTier();
  });
} else {
  console.error('Button btn-add-tier not found');
}

function addPriceTier(qty = '', price = '') {
  const container = document.getElementById('price-tiers-container');
  const div = document.createElement('div');
  div.className = 'price-tier-row';
  div.style = 'display: flex; gap: 10px; align-items: center;';
  div.innerHTML = `
    <input type="number" placeholder="Cant. Mínima" value="${qty}" class="tier-qty" style="flex: 1" min="1">
    <input type="number" placeholder="Precio Unit." value="${price}" class="tier-price" style="flex: 1" step="0.01" min="0">
    <button type="button" class="btn-icon danger remove-tier" style="padding: 5px">✕</button>
  `;
  div.querySelector('.remove-tier').addEventListener('click', () => div.remove());
  container.appendChild(div);
}

// Upload de imagen
const uploadZone = document.getElementById('upload-zone');
const imgUpload  = document.getElementById('img-upload');

uploadZone.addEventListener('click', () => imgUpload.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--cyan)'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  if (e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]);
});
imgUpload.addEventListener('change', e => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); });

document.getElementById('remove-img').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('upload-preview').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
  document.getElementById('product-image').value = '';
  imgUpload.value = '';
});

async function handleImageUpload(file) {
  const formData = new FormData();
  formData.append('image', file);
  try {
    toast('Subiendo imagen...', 'info');
    const res = await fetch(`${API}/upload.php`, { method: 'POST', body: formData, credentials: 'same-origin' });
    const json = await res.json();
    if (json.success) {
      document.getElementById('product-image').value = json.data.filename;
      document.getElementById('preview-img').src = `../${json.data.path}`;
      document.getElementById('upload-placeholder').classList.add('hidden');
      document.getElementById('upload-preview').classList.remove('hidden');
      toast('Imagen subida correctamente', 'success');
    } else {
      toast(json.error || 'Error al subir imagen', 'error');
    }
  } catch {
    toast('Error de conexión al subir imagen', 'error');
  }
}

// Guardar producto
document.getElementById('btn-save-product').addEventListener('click', async () => {
  const form = document.getElementById('product-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const id = document.getElementById('product-id').value;
  const payload = {
    category_id:   parseInt(document.getElementById('product-category').value),
    sku:           document.getElementById('product-sku').value.trim(),
    name:          document.getElementById('product-name').value.trim(),
    description:   document.getElementById('product-desc').value.trim(),
    price_from:    document.getElementById('product-price').value || null,
    image_webp:    document.getElementById('product-image').value || '',
    min_quantity:  parseInt(document.getElementById('product-minqty').value) || 10,
    stock_quantity:parseInt(document.getElementById('product-stock').value)  || 0,
    customizable:  document.getElementById('product-custom').checked ? 1 : 0,
    featured:      document.getElementById('product-featured').checked ? 1 : 0,
    on_sale:       document.getElementById('product-onsale').checked ? 1 : 0,
    sale_price:    document.getElementById('product-onsale').checked ? (parseFloat(document.getElementById('product-sale-price').value) || null) : null,
    active: 1,
    volume_prices: Array.from(document.querySelectorAll('.price-tier-row')).map(row => ({
      min_qty: parseInt(row.querySelector('.tier-qty').value),
      price:   parseFloat(row.querySelector('.tier-price').value)
    })).filter(p => !isNaN(p.min_qty) && !isNaN(p.price))
  };
  if (id) payload.id = parseInt(id);
  const method   = id ? 'PUT' : 'POST';
  const endpoint = 'admin_products.php';
  const res = await api(endpoint, method, payload);
  if (res.success) {
    toast(id ? 'Producto actualizado' : 'Producto creado', 'success');
    closeModal('modal-product');
    loadProducts();
  } else {
    toast(res.error || 'Error al guardar', 'error');
  }
});

async function editProduct(id) {
  await populateCategorySelects(true);
  const res = await api(`admin_products.php?id=${id}`);
  if (!res.success) { toast('Error al cargar producto', 'error'); return; }
  const p = res.data;
  document.getElementById('product-id').value       = p.id;
  document.getElementById('product-name').value     = p.name;
  document.getElementById('product-sku').value      = p.sku;
  document.getElementById('product-desc').value     = p.description || '';
  document.getElementById('product-price').value    = p.price_from || '';
  document.getElementById('product-minqty').value   = p.min_quantity;
  document.getElementById('product-stock').value    = p.stock?.[0]?.quantity || 0;
  document.getElementById('product-custom').checked  = !!parseInt(p.customizable);
  document.getElementById('product-featured').checked= !!parseInt(p.featured);
  
  // Ofertas
  const onSale = !!parseInt(p.on_sale);
  document.getElementById('product-onsale').checked = onSale;
  document.getElementById('sale-price-group').style.display = onSale ? 'block' : 'none';
  document.getElementById('product-sale-price').value = p.sale_price || '';
  calculateDiscount();

  document.getElementById('product-image').value    = p.image_webp || '';
  document.getElementById('product-category').value = p.category_id;
  
  // Renderizar tiers de precio
  const tiersContainer = document.getElementById('price-tiers-container');
  tiersContainer.innerHTML = '';
  if (p.volume_prices && p.volume_prices.length) {
    p.volume_prices.forEach(t => addPriceTier(t.min_qty, t.price));
  }
  if (p.image_webp) {
    document.getElementById('preview-img').src = `../assets/images/${p.image_webp}`;
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('upload-preview').classList.remove('hidden');
  } else {
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('upload-preview').classList.add('hidden');
  }
  document.getElementById('modal-product-title').textContent = 'Editar Producto';
  openModal('modal-product');
}

async function deleteProduct(id, name) {
  if (!confirm(`¿Eliminar "${name}"? Esta acción lo desactivará.`)) return;
  const res = await api('admin_products.php', 'DELETE', { id });
  if (res.success) { toast('Producto eliminado', 'success'); loadProducts(); }
  else toast(res.error || 'Error al eliminar', 'error');
}

// ── CATEGORÍAS ────────────────────────────────────────────────
async function loadCategories() {
  const res = await api('admin_categories.php');
  const tbody = document.getElementById('categories-tbody');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Error</td></tr>'; return; }
  if (!res.data.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Sin categorías</td></tr>'; return; }
  tbody.innerHTML = res.data.map(c => `
    <tr>
      <td style="font-weight:600">${escHtml(c.name)}</td>
      <td style="color:var(--muted);font-size:0.82rem">${escHtml(c.slug)}</td>
      <td style="font-size:0.82rem">${escHtml(c.icon || '—')}</td>
      <td style="font-size:0.84rem">${c.product_count}</td>
      <td style="font-size:0.84rem">${c.sort_order}</td>
      <td>${statusBadge(parseInt(c.active) ? 'active' : 'inactive')}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="editCategory(${c.id})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" onclick="deleteCategory(${c.id},'${escHtml(c.name)}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

document.getElementById('btn-new-category').addEventListener('click', () => {
  document.getElementById('category-form').reset();
  document.getElementById('category-id').value = '';
  document.getElementById('modal-category-title').textContent = 'Nueva Categoría';
  openModal('modal-category');
});

document.getElementById('btn-save-category').addEventListener('click', async () => {
  const id = document.getElementById('category-id').value;
  const payload = {
    name:       document.getElementById('category-name').value.trim(),
    icon:       document.getElementById('category-icon').value.trim(),
    sort_order: parseInt(document.getElementById('category-order').value) || 0,
    active:     document.getElementById('category-active').checked ? 1 : 0,
  };
  if (!payload.name) { toast('El nombre es requerido', 'error'); return; }
  if (id) payload.id = parseInt(id);
  const res = await api('admin_categories.php', id ? 'PUT' : 'POST', payload);
  if (res.success) {
    toast(id ? 'Categoría actualizada' : 'Categoría creada', 'success');
    closeModal('modal-category');
    allCategories = [];
    loadCategories();
  } else toast(res.error || 'Error al guardar', 'error');
});

function editCategory(id) {
  api('admin_categories.php').then(res => {
    if (!res.success) return;
    const c = res.data.find(x => x.id == id);
    if (!c) return;
    document.getElementById('category-id').value    = c.id;
    document.getElementById('category-name').value  = c.name;
    document.getElementById('category-icon').value  = c.icon || '';
    document.getElementById('category-order').value = c.sort_order;
    document.getElementById('category-active').checked = !!parseInt(c.active);
    document.getElementById('modal-category-title').textContent = 'Editar Categoría';
    openModal('modal-category');
  });
}

async function deleteCategory(id, name) {
  if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
  const res = await api('admin_categories.php', 'DELETE', { id });
  if (res.success) { toast('Categoría eliminada', 'success'); allCategories = []; loadCategories(); }
  else toast(res.error || 'Error al eliminar', 'error');
}

// ── COTIZACIONES ──────────────────────────────────────────────
let currentQuoteStatus = '';
let currentQuoteId     = null;

async function loadQuotes(status = currentQuoteStatus) {
  currentQuoteStatus = status;
  let url = 'admin_quotes.php?limit=50';
  if (status) url += `&status=${status}`;
  const res = await api(url);
  const tbody = document.getElementById('quotes-tbody');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Error</td></tr>'; return; }

  const { items, counters } = res.data;
  const newCount = parseInt(counters?.new || 0);
  document.getElementById('badge-quotes').textContent    = newCount > 0 ? newCount : '';
  document.getElementById('tab-badge-new').textContent   = newCount > 0 ? newCount : '';

  if (!items.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Sin cotizaciones</td></tr>'; return; }

  tbody.innerHTML = items.map(q => `
    <tr>
      <td style="font-weight:600;font-size:0.88rem">${escHtml(q.company)}</td>
      <td style="font-size:0.84rem">${escHtml(q.contact_name || q.contact)}</td>
      <td style="font-size:0.84rem"><a href="mailto:${escHtml(q.email)}" style="color:var(--cyan)">${escHtml(q.email)}</a></td>
      <td style="font-size:0.82rem;color:var(--muted)">${escHtml(q.product_ref || '—')}</td>
      <td style="font-size:0.8rem;color:var(--muted)">${fmtDate(q.created_at)}</td>
      <td>${statusBadge(q.status)}</td>
      <td style="display:flex; gap:0.5rem;">
        <button class="btn btn-ghost btn-sm" onclick="viewQuote(${q.id})">Ver</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--accent-pink)" onclick="deleteQuote(${q.id})">Eliminar</button>
      </td>
    </tr>`).join('');
}

document.getElementById('quotes-tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('#quotes-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadQuotes(btn.dataset.status);
});

async function viewQuote(id) {
  const res = await api('admin_quotes.php');
  if (!res.success) return;
  const q = res.data.items.find(x => x.id == id);
  if (!q) return;
  currentQuoteId = id;
  document.getElementById('quote-detail').innerHTML = `
    <div class="quote-field"><label>Empresa</label><p>${escHtml(q.company)}</p></div>
    <div class="quote-field"><label>Contacto</label><p>${escHtml(q.contact_name || q.contact)}</p></div>
    <div class="quote-field"><label>Email</label><p><a href="mailto:${escHtml(q.email)}" style="color:var(--cyan)">${escHtml(q.email)}</a></p></div>
    <div class="quote-field"><label>Teléfono</label><p>${escHtml(q.phone || '—')}</p></div>
    <div class="quote-field"><label>Producto de interés</label><p>${escHtml(q.product_ref || '—')}</p></div>
    <div class="quote-field"><label>Mensaje</label><p style="white-space:pre-wrap">${escHtml(q.message)}</p></div>
    <div class="quote-field"><label>Recibida</label><p>${fmtDate(q.created_at)}</p></div>`;
  document.getElementById('quote-status-select').value = q.status;
  openModal('modal-quote');
  if (q.status === 'new') {
    await api('admin_quotes.php', 'PUT', { id, status: 'read' });
    loadQuotes();
  }
}

document.getElementById('btn-save-quote-status').addEventListener('click', async () => {
  if (!currentQuoteId) return;
  const status = document.getElementById('quote-status-select').value;
  const res = await api('admin_quotes.php', 'PUT', { id: currentQuoteId, status });
  if (res.success) { toast('Estado actualizado', 'success'); closeModal('modal-quote'); loadQuotes(); }
  else toast('Error al actualizar', 'error');
});

// ── USUARIOS ──────────────────────────────────────────────────
async function loadUsers() {
  if (currentUser?.role !== 'superadmin') {
    document.getElementById('section-users').innerHTML = '<div class="empty-state" style="padding:4rem">Solo los superadministradores pueden gestionar usuarios.</div>';
    return;
  }
  const res = await api('admin_users.php');
  const tbody = document.getElementById('users-tbody');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Error</td></tr>'; return; }
  if (!res.data.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Sin usuarios</td></tr>'; return; }

  tbody.innerHTML = res.data.map(u => `
    <tr>
      <td style="font-weight:600">${escHtml(u.name)}</td>
      <td style="font-size:0.84rem;color:var(--muted)">${escHtml(u.email)}</td>
      <td><span style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--cyan)">${escHtml(u.role)}</span></td>
      <td style="font-size:0.8rem;color:var(--muted)">${fmtDate(u.last_login) || 'Nunca'}</td>
      <td>${statusBadge(parseInt(u.active) ? 'active' : 'inactive')}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="editUser(${u.id})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          ${u.id != currentUser?.id ? `
          <button class="btn-icon danger" onclick="deleteUser(${u.id},'${escHtml(u.name)}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

document.getElementById('btn-new-user').addEventListener('click', () => {
  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('modal-user-title').textContent = 'Nuevo Usuario';
  document.getElementById('pass-hint').textContent = '(requerida)';
  document.getElementById('user-password').required = true;
  openModal('modal-user');
});

function editUser(id) {
  api('admin_users.php').then(res => {
    if (!res.success) return;
    const u = res.data.find(x => x.id == id);
    if (!u) return;
    document.getElementById('user-id').value          = u.id;
    document.getElementById('user-name-input').value  = u.name;
    document.getElementById('user-email').value       = u.email;
    document.getElementById('user-password').value    = '';
    document.getElementById('user-role-select').value = u.role;
    document.getElementById('user-active').checked    = !!parseInt(u.active);
    document.getElementById('modal-user-title').textContent = 'Editar Usuario';
    document.getElementById('pass-hint').textContent  = '(dejar vacío para no cambiar)';
    document.getElementById('user-password').required = false;
    openModal('modal-user');
  });
}

document.getElementById('btn-save-user').addEventListener('click', async () => {
  const id = document.getElementById('user-id').value;
  const payload = {
    name:   document.getElementById('user-name-input').value.trim(),
    email:  document.getElementById('user-email').value.trim(),
    role:   document.getElementById('user-role-select').value,
    active: document.getElementById('user-active').checked ? 1 : 0,
  };
  const pass = document.getElementById('user-password').value;
  if (pass) payload.password = pass;
  if (!payload.name || !payload.email) { toast('Nombre y email requeridos', 'error'); return; }
  if (id) payload.id = parseInt(id);
  const res = await api('admin_users.php', id ? 'PUT' : 'POST', payload);
  if (res.success) { toast(id ? 'Usuario actualizado' : 'Usuario creado', 'success'); closeModal('modal-user'); loadUsers(); }
  else toast(res.error || 'Error al guardar', 'error');
});

async function deleteUser(id, name) {
  if (!confirm(`¿Eliminar al usuario "${name}"?`)) return;
  const res = await api('admin_users.php', 'DELETE', { id });
  if (res.success) { toast('Usuario eliminado', 'success'); loadUsers(); }
  else toast(res.error || 'Error al eliminar', 'error');
}

// ── ORDERS ────────────────────────────────────────────────────
let ordersPage = 1;
async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  try {
    const search = document.getElementById('search-orders').value;
    const status = document.getElementById('filter-order-status').value;
    
    const res = await api(`admin_orders.php?page=${ordersPage}&search=${encodeURIComponent(search)}&status=${status}`);
    if (!res.success) throw new Error(res.error || 'Error desconocido');
    
    if (res.data.orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron pedidos</td></tr>';
    document.getElementById('orders-pagination').innerHTML = '';
    return;
  }
  
  tbody.innerHTML = res.data.orders.map(o => `
    <tr>
      <td style="font-weight:600;">${escHtml(o.order_number)}</td>
      <td>${fmtDate(o.created_at)}</td>
      <td>${escHtml(o.customer_name)}</td>
      <td>${escHtml(o.customer_phone)}<br><small style="color:var(--text-muted)">${escHtml(o.customer_email || '')}</small></td>
      <td style="font-weight:600;color:var(--accent-cyan);">${fmtCurrency(o.total)}</td>
      <td><span class="status-badge" style="background:var(--bg-elevated); border:1px solid var(--border);">${escHtml(o.status)}</span></td>
      <td style="display:flex; gap:0.5rem;">
        <button class="btn-icon" onclick="viewOrder(${o.id})" title="Ver Detalles">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-icon" style="color:var(--accent-pink)" onclick="deleteOrder(${o.id})" title="Eliminar Pedido">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join('');

  // Paginación básica
  const totalPages = Math.ceil(res.data.total / 50);
  let pageHTML = '';
  if (totalPages > 1) {
    if (ordersPage > 1) pageHTML += `<button class="btn btn-outline btn-sm" onclick="ordersPage--; loadOrders()">Ant</button>`;
    pageHTML += `<span>Página ${ordersPage} de ${totalPages}</span>`;
    if (ordersPage < totalPages) pageHTML += `<button class="btn btn-outline btn-sm" onclick="ordersPage++; loadOrders()">Sig</button>`;
  }
  document.getElementById('orders-pagination').innerHTML = pageHTML;
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--accent-pink)">Error: ${err.message}. Asegúrate de haber corrido db_upgrade.php</td></tr>`;
  }
}

document.getElementById('search-orders').addEventListener('input', () => { ordersPage = 1; loadOrders(); });
document.getElementById('filter-order-status').addEventListener('change', () => { ordersPage = 1; loadOrders(); });

async function viewOrder(id) {
  const res = await api(`admin_orders.php?id=${id}`);
  if (!res.success) { toast('Error al cargar pedido', 'error'); return; }
  
  const o = res.data.order;
  document.getElementById('mo-order-id').value = o.id;
  document.getElementById('modal-order-title').textContent = `Pedido: ${o.order_number}`;
  
  document.getElementById('mo-customer-name').textContent = o.customer_name;
  document.getElementById('mo-customer-phone').textContent = o.customer_phone;
  document.getElementById('mo-customer-email').textContent = o.customer_email || 'Sin correo';
  document.getElementById('mo-customer-company').textContent = o.customer_company || 'Sin empresa';
  
  document.getElementById('mo-delivery-address').textContent = o.delivery_address;
  document.getElementById('mo-delivery-city').textContent = o.delivery_city;
  document.getElementById('mo-delivery-notes').textContent = o.delivery_notes || 'Sin indicaciones especiales';
  
  const tbody = document.getElementById('mo-items-tbody');
  tbody.innerHTML = (o.items || []).map(i => `
    <tr>
      <td>${escHtml(i.name)}</td>
      <td>${i.quantity}</td>
      <td>${fmtCurrency(i.unit_price)}</td>
      <td style="font-weight:600;">${fmtCurrency(i.unit_price * i.quantity)}</td>
    </tr>
  `).join('');
  document.getElementById('mo-total').textContent = fmtCurrency(o.total);
  
  document.getElementById('mo-order-status').value = o.status;
  document.getElementById('mo-order-note').value = o.status_note || '';
  
  openModal('modal-order');
}

document.getElementById('order-status-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('mo-order-id').value;
  const status = document.getElementById('mo-order-status').value;
  const note = document.getElementById('mo-order-note').value.trim();
  
  const res = await api('admin_orders.php', 'PUT', { id, status, status_note: note });
  if (res.success) {
    toast('Estado actualizado', 'success');
    closeModal('modal-order');
    loadOrders();
  } else {
    toast(res.error || 'Error al actualizar', 'error');
  }
});

// ── CLIENTS ───────────────────────────────────────────────────
async function loadClients() {
  const tbody = document.getElementById('clients-tbody');
  try {
    const res = await api('admin_clients.php');
    if (!res.success) throw new Error(res.error || 'Error desconocido');
  if (res.data.clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No se encontraron clientes</td></tr>';
    return;
  }
  
  tbody.innerHTML = res.data.clients.map(c => `
    <tr>
      <td style="font-weight:600;">${escHtml(c.name)}</td>
      <td>${escHtml(c.email)}</td>
      <td>${escHtml(c.phone || '—')}</td>
      <td><span class="badge" style="background:var(--accent-cyan); color:#000;">${c.total_orders || 0}</span></td>
      <td>${fmtDate(c.last_order_date || c.created_at)}</td>
      <td>
        <button class="btn-icon" onclick="viewClient(${c.id})" title="Ver Perfil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="color:var(--accent-pink)">Error: ${err.message}</td></tr>`;
  }
}

async function viewClient(id) {
  const res = await api(`admin_clients.php?id=${id}`);
  if (!res.success) { toast('Error al cargar cliente', 'error'); return; }
  
  const c = res.data.client;
  document.getElementById('mc-initial').textContent = (c.name || '?').charAt(0).toUpperCase();
  document.getElementById('mc-name').textContent = c.name;
  document.getElementById('mc-contact').textContent = `${c.email} • ${c.phone || 'Sin teléfono'}`;
  document.getElementById('mc-joined').textContent = `Cliente desde: ${fmtDate(c.created_at)}`;
  
  const tbody = document.getElementById('mc-orders-tbody');
  if (!c.orders || c.orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No tiene pedidos registrados</td></tr>';
  } else {
    tbody.innerHTML = c.orders.map(o => `
      <tr>
        <td style="font-weight:600;">${escHtml(o.order_number)}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${fmtCurrency(o.total)}</td>
        <td>${escHtml(o.status)}</td>
      </tr>
    `).join('');
  }
  
  openModal('modal-client');
}

// ── CONFIGURACIÓN ─────────────────────────────────────────────
async function loadSettings() {
  const res = await api('admin_settings.php');
  if (!res.success) { toast('Error al cargar configuración', 'error'); return; }
  const form = document.getElementById('settings-form');
  Object.entries(res.data).forEach(([key, val]) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) input.value = val || '';
  });
}

document.getElementById('settings-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form    = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  const res = await api('admin_settings.php', 'PUT', payload);
  if (res.success) toast('Configuración guardada', 'success');
  else toast(res.error || 'Error al guardar', 'error');
});

document.getElementById('password-form').addEventListener('submit', async e => {
  e.preventDefault();
  const newPass  = e.target.new_password.value;
  const confirm  = e.target.confirm_password.value;
  if (newPass !== confirm) { toast('Las contraseñas no coinciden', 'error'); return; }
  const res = await api('admin_users.php', 'PUT', {
    id: currentUser.id,
    password: newPass,
  });
  if (res.success) { toast('Contraseña actualizada', 'success'); e.target.reset(); }
  else toast(res.error || 'Error al actualizar', 'error');
});

// ── INIT ──────────────────────────────────────────────────────
(async () => {
  await checkAuth();
  populateCategorySelects();
  navigateTo('dashboard');
})();

// ── MARCAS ───────────────────────────────────────────────────
async function loadBrands() {
  const res = await api('admin_brand_logos.php');
  const tbody = document.getElementById('brands-tbody');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Error al cargar marcas</td></tr>'; return; }
  
  const items = res.data;
  if (!items.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay marcas registradas</td></tr>'; return; }

  tbody.innerHTML = items.map(b => `
    <tr>
      <td><img src="../assets/images/${b.filename}" style="height:32px; filter:brightness(0) invert(1); opacity:0.7"></td>
      <td style="font-weight:600">${escHtml(b.name)}</td>
      <td>${b.sort_order}</td>
      <td style="color:var(--muted); font-size:0.8rem">${fmtDate(b.created_at)}</td>
      <td>
        <div class="table-actions" style="justify-content: flex-start; gap: 0.5rem;">
          <button class="btn btn-ghost btn-sm" onclick="editBrand(${b.id})">Editar</button>
          <button class="btn btn-ghost btn-sm" style="color: var(--accent-pink)" onclick="deleteBrand(${b.id}, '${escHtml(b.name)}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openBrandModal() {
  document.getElementById('brand-form').reset();
  document.getElementById('brand-id').value = '';
  document.getElementById('brand-image').value = '';
  document.getElementById('brand-preview-img').src = '';
  document.getElementById('brand-upload-preview').classList.add('hidden');
  document.getElementById('brand-upload-placeholder').classList.remove('hidden');
  document.getElementById('modal-brand-title').textContent = 'Nueva Marca';
  openModal('modal-brand');
}

async function deleteBrand(id, name) {
  if (!confirm(`¿Eliminar la marca "${name}"?`)) return;
  const res = await api('admin_brand_logos.php', 'DELETE', { id });
  if (res.success) { toast('Marca eliminada', 'success'); loadBrands(); }
  else toast(res.error || 'Error al eliminar', 'error');
}

async function editBrand(id) {
  const res = await api(`admin_brand_logos.php?id=${id}`);
  if (!res.success) { toast('Error al cargar marca', 'error'); return; }
  const b = res.data;
  document.getElementById('brand-id').value = b.id;
  document.getElementById('brand-name').value = b.name;
  document.getElementById('brand-order').value = b.sort_order;
  document.getElementById('brand-image').value = b.filename;
  if (b.filename) {
    document.getElementById('brand-preview-img').src = `../assets/images/${b.filename}`;
    document.getElementById('brand-upload-placeholder').classList.add('hidden');
    document.getElementById('brand-upload-preview').classList.remove('hidden');
  }
  document.getElementById('modal-brand-title').textContent = 'Editar Marca';
  openModal('modal-brand');
}

document.getElementById('btn-save-brand')?.addEventListener('click', async () => {
  const id = document.getElementById('brand-id').value;
  const payload = {
    name:       document.getElementById('brand-name').value.trim(),
    sort_order: parseInt(document.getElementById('brand-order').value) || 0,
    filename:   document.getElementById('brand-image').value,
  };
  if (id) payload.id = parseInt(id);

  if (!payload.name) { toast('El nombre es requerido', 'error'); return; }
  if (!payload.filename) { toast('El logo es requerido', 'error'); return; }

  const method = id ? 'PUT' : 'POST';
  const res = await api('admin_brand_logos.php', method, payload);
  if (res.success) {
    toast(id ? 'Marca actualizada' : 'Marca guardada', 'success');
    closeModal('modal-brand');
    loadBrands();
  } else toast(res.error || 'Error al guardar', 'error');
});

// Upload logic for brands
const brandUploadZone = document.getElementById('brand-upload-zone');
const brandImgInput   = document.getElementById('brand-img-upload');

brandUploadZone?.addEventListener('click', () => brandImgInput.click());
brandImgInput?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleBrandUpload(file);
});

async function handleBrandUpload(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(`${API}/upload.php`, { 
      method: 'POST', 
      body: formData,
      credentials: 'same-origin'
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('brand-image').value = data.data.filename;
      document.getElementById('brand-preview-img').src = `../assets/images/${data.data.filename}`;
      document.getElementById('brand-upload-preview').classList.remove('hidden');
      document.getElementById('brand-upload-placeholder').classList.add('hidden');
    } else toast(data.error || 'Error al subir', 'error');
  } catch (err) { 
    console.error('Upload Error:', err);
    toast('Error al procesar la imagen', 'error'); 
  }
}

document.getElementById('brand-remove-img')?.addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('brand-image').value = '';
  document.getElementById('brand-preview-img').src = '';
  document.getElementById('brand-upload-preview').classList.add('hidden');
  document.getElementById('brand-upload-placeholder').classList.remove('hidden');
});

// ── ELIMINACIÓN (Quotes & Orders) ───────────────────────────
async function deleteQuote(id) {
  if (!confirm('¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) return;
  const res = await api('admin_quotes.php', 'DELETE', { id });
  if (res.success) {
    toast('Cotización eliminada');
    loadQuotes();
  } else toast(res.error || 'Error al eliminar', 'error');
}

async function deleteOrder(id) {
  if (!confirm('¿Estás seguro de eliminar este pedido? Se eliminará permanentemente del sistema y del portal del cliente.')) return;
  const res = await api('admin_orders.php', 'DELETE', { id });
  if (res.success) {
    toast('Pedido eliminado correctamente');
    loadOrders();
  } else toast(res.error || 'Error al eliminar', 'error');
}
