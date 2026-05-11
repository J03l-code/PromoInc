/**
 * PromoInc — Cart Manager
 * Gestiona el carrito: sincroniza con el backend si el usuario está autenticado,
 * o usa localStorage como fallback para visitantes.
 */

const CartManager = (() => {
  let _isLoggedIn = false;
  let _items = [];         // [{product_id, name, sku, quantity, unit_price, image_webp}]
  let _onChangeCallback = null;

  /* ── Inicialización ──────────────────────────────── */
  async function init(onChangeCallback) {
    _onChangeCallback = onChangeCallback;
    try {
      const res = await fetch('api/auth_b2b.php?action=me', { credentials: 'include', cache: 'no-cache' });
      if (res.ok) {
        _isLoggedIn = true;
        await _loadFromServer();
      } else {
        _isLoggedIn = false;
        _loadFromLocal();
      }
    } catch {
      _isLoggedIn = false;
      _loadFromLocal();
    }
    _notify();
  }

  /* ── Carga ───────────────────────────────────────── */
  async function _loadFromServer() {
    try {
      const res = await fetch('api/cart.php');
      if (res.ok) {
        const data = await res.json();
        _items = data.items.map(i => ({
          product_id: i.product_id,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unit_price: parseFloat(i.unit_price),
          image_webp: i.image_webp,
          min_quantity: i.min_quantity
        }));
      }
    } catch { _items = []; }
  }

  function _loadFromLocal() {
    try {
      _items = JSON.parse(localStorage.getItem('cart_items') || '[]');
    } catch { _items = []; }
  }

  function _saveLocal() {
    localStorage.setItem('cart_items', JSON.stringify(_items));
  }

  /* ── Acciones ────────────────────────────────────── */
  async function addItem(product) {
    // product: { product_id, name, sku, quantity, unit_price, image_webp, min_quantity }
    const existing = _items.find(i => i.product_id === product.product_id);
    if (existing) {
      existing.quantity = product.quantity;
      existing.unit_price = product.unit_price;
    } else {
      _items.push({ ...product });
    }

    if (_isLoggedIn) {
      await fetch('api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price
        })
      });
    } else {
      _saveLocal();
    }
    _notify();
  }

  async function removeItem(productId) {
    _items = _items.filter(i => i.product_id !== productId);
    if (_isLoggedIn) {
      await fetch('api/cart.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });
    } else {
      _saveLocal();
    }
    _notify();
  }

  async function clear() {
    _items = [];
    if (_isLoggedIn) {
      await fetch('api/cart.php', { method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } else {
      _saveLocal();
    }
    _notify();
  }

  function getItems() { return [..._items]; }
  function getCount() { return _items.reduce((s, i) => s + i.quantity, 0); }
  function getTotal() { return _items.reduce((s, i) => s + (i.unit_price * i.quantity), 0); }
  function isLoggedIn() { return _isLoggedIn; }

  function _notify() {
    if (_onChangeCallback) _onChangeCallback(_items);
  }

  return { init, addItem, removeItem, clear, getItems, getCount, getTotal, isLoggedIn };
})();
