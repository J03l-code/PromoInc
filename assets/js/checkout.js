/**
 * PromoInc — Checkout Modal
 * Solicita datos de entrega antes de redirigir al pedido por WhatsApp.
 * Guarda los datos del cliente en localStorage para futuros pedidos.
 * Incluir DESPUÉS de cart.js en todas las páginas.
 */

const CheckoutModal = (() => {
  const STORAGE_KEY = 'promoinc_checkout_data';
  const WA_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg>`;

  // ── Guardar / Cargar datos ────────────────────────────────
  function _save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) { return null; }
  }

  // ── Rellenar formulario ───────────────────────────────────
  function _fillForm(data) {
    if (!data) return;
    const fields = ['name', 'phone', 'email', 'address', 'city', 'company', 'notes'];
    fields.forEach(f => {
      const el = document.getElementById('co-' + f);
      if (el && data[f]) el.value = data[f];
    });
  }

  // ── Inyectar HTML del Modal ───────────────────────────────
  function _inject() {
    if (document.getElementById('checkout-modal')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div id="checkout-overlay" class="co-overlay" onclick="CheckoutModal.close()"></div>
      <div id="checkout-modal" class="co-modal" role="dialog" aria-modal="true" aria-labelledby="co-title">
        <div class="co-header">
          <div class="co-header-icon">📦</div>
          <div>
            <h2 id="co-title">Finalizar Pedido</h2>
            <p>Completa tus datos para continuar al pago por WhatsApp</p>
          </div>
          <button class="co-close" onclick="CheckoutModal.close()" aria-label="Cerrar">&times;</button>
        </div>

        <div class="co-body">
          <!-- Resumen del carrito -->
          <div class="co-cart-summary" id="co-cart-summary"></div>

          <!-- Aviso de datos guardados -->
          <div id="co-saved-notice" class="co-saved-notice" style="display:none;">
            ✅ <strong>Datos guardados de tu compra anterior.</strong> Puedes editarlos si algo cambió.
          </div>

          <!-- Formulario de datos -->
          <form id="co-form" onsubmit="CheckoutModal.submit(event)" novalidate>
            <div class="co-section-title">📋 Datos de Contacto</div>
            <div class="co-grid-2">
              <div class="co-field">
                <label for="co-name">Nombre completo *</label>
                <input id="co-name" type="text" placeholder="Ej: María Pérez" required autocomplete="name">
              </div>
              <div class="co-field">
                <label for="co-phone">Teléfono / WhatsApp *</label>
                <input id="co-phone" type="tel" placeholder="Ej: 0987654321" required autocomplete="tel">
              </div>
            </div>
            <div class="co-field">
              <label for="co-email">Correo electrónico</label>
              <input id="co-email" type="email" placeholder="Ej: maria@empresa.com" autocomplete="email">
            </div>

            <div class="co-section-title" style="margin-top:20px;">🚚 Datos de Entrega</div>
            <div class="co-field">
              <label for="co-address">Dirección de entrega *</label>
              <input id="co-address" type="text" placeholder="Calle, número, barrio" required autocomplete="street-address">
            </div>
            <div class="co-grid-2">
              <div class="co-field">
                <label for="co-city">Ciudad *</label>
                <input id="co-city" type="text" placeholder="Ej: Quito" required>
              </div>
              <div class="co-field">
                <label for="co-company">Empresa / RUC (opcional)</label>
                <input id="co-company" type="text" placeholder="Ej: Mi Empresa S.A.">
              </div>
            </div>
            <div class="co-field">
              <label for="co-notes">Indicaciones adicionales</label>
              <textarea id="co-notes" rows="3" placeholder="Referencia del lugar, instrucciones especiales, hora preferida de entrega…"></textarea>
            </div>

            <div id="co-error" class="co-error" style="display:none;"></div>

            <div class="co-footer">
              <div class="co-total-row">
                <span>Total del pedido</span>
                <span id="co-total" class="co-total-value">$0.00</span>
              </div>
              <button type="submit" class="co-submit-btn" id="co-submit-btn">
                ${WA_ICON}
                Enviar pedido por WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    `);
  }

  // ── Abrir Modal ───────────────────────────────────────────
  function open() {
    _inject();
    const items = CartManager.getItems();
    if (!items || items.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de continuar.');
      return;
    }

    // Resumen del carrito
    const summary = document.getElementById('co-cart-summary');
    summary.innerHTML = items.map(i => `
      <div class="co-item">
        <span class="co-item-name">${i.name}</span>
        <span class="co-item-detail">${i.quantity} × $${i.unit_price.toFixed(2)}</span>
        <span class="co-item-sub">$${(i.unit_price * i.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const total = CartManager.getTotal();
    document.getElementById('co-total').textContent = '$' + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 1️⃣ Cargar datos guardados en localStorage
    const saved = _load();
    if (saved) {
      _fillForm(saved);
      document.getElementById('co-saved-notice').style.display = 'block';
    }

    // 2️⃣ Si está logueado, complementar con datos de la cuenta (sin sobrescribir lo guardado)
    if (CartManager.isLoggedIn && CartManager.isLoggedIn()) {
      fetch('api/auth_b2b.php?action=me', { credentials: 'include', cache: 'no-cache' })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data.user) {
            const u = d.data.user;
            const nameEl  = document.getElementById('co-name');
            const emailEl = document.getElementById('co-email');
            // Solo rellenar si aún están vacíos (localStorage tiene prioridad)
            if (nameEl  && !nameEl.value  && u.name)  nameEl.value  = u.name;
            if (emailEl && !emailEl.value && u.email) emailEl.value = u.email;
          }
        }).catch(() => {});
    }

    document.getElementById('checkout-overlay').classList.add('open');
    document.getElementById('checkout-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // ── Cerrar Modal ──────────────────────────────────────────
  function close() {
    const overlay = document.getElementById('checkout-overlay');
    const modal   = document.getElementById('checkout-modal');
    if (overlay) overlay.classList.remove('open');
    if (modal)   modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Validar y Enviar ──────────────────────────────────────
  async function submit(e) {
    e.preventDefault();

    const errorEl = document.getElementById('co-error');
    errorEl.style.display = 'none';

    const name    = document.getElementById('co-name').value.trim();
    const phone   = document.getElementById('co-phone').value.trim();
    const email   = document.getElementById('co-email').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const city    = document.getElementById('co-city').value.trim();
    const company = document.getElementById('co-company').value.trim();
    const notes   = document.getElementById('co-notes').value.trim();

    if (!name || !phone || !address || !city) {
      errorEl.textContent = '⚠️ Por favor completa los campos obligatorios (marcados con *).';
      errorEl.style.display = 'block';
      return;
    }

    // 💾 Guardar los datos en localStorage para próximas compras
    _save({ name, phone, email, address, city, company, notes });

    const btn = document.getElementById('co-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Preparando mensaje…';

    // Construir mensaje WhatsApp
    const items = CartManager.getItems();
    const total = CartManager.getTotal();

    const itemsText = items.map(i =>
      `  • ${i.name} (x${i.quantity}) → $${(i.unit_price * i.quantity).toFixed(2)}`
    ).join('\n');

    const msg = [
      '🛒 *NUEVO PEDIDO — PromoInc*',
      '',
      '📋 *Datos del Cliente:*',
      `  👤 Nombre: ${name}`,
      `  📞 Teléfono: ${phone}`,
      email   ? `  📧 Email: ${email}`     : null,
      company ? `  🏢 Empresa: ${company}` : null,
      '',
      '🚚 *Datos de Entrega:*',
      `  📍 Dirección: ${address}`,
      `  🏙️ Ciudad: ${city}`,
      notes ? `  📝 Indicaciones: ${notes}` : null,
      '',
      '🛍️ *Productos:*',
      itemsText,
      '',
      `💰 *Total: $${total.toFixed(2)}*`,
    ].filter(l => l !== null).join('\n');

    // Obtener número desde la API (dinámico)
    let waNumber = '593987827215';
    try {
      const r = await fetch('api/public_settings.php?key=whatsapp_number');
      const d = await r.json();
      if (d.success && d.data.value) waNumber = d.data.value;
    } catch (_) {}

    // 💾 Guardar el pedido en la base de datos
    let orderNumber = '';
    try {
      const orderData = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_company: company,
        delivery_address: address,
        delivery_city: city,
        delivery_notes: notes,
        items: items,
        total: total
      };

      const res = await fetch('api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success && data.data && data.data.order_number) {
        orderNumber = data.data.order_number;
      }
    } catch (e) {
      console.error('Error al guardar el pedido en la BD:', e);
      // No bloqueamos el flujo de WhatsApp si falla la BD
    }

    // Insertar el número de pedido al inicio del mensaje si se generó
    let finalMsg = msg;
    if (orderNumber) {
      finalMsg = msg.replace('🛒 *NUEVO PEDIDO — PromoInc*', `🛒 *NUEVO PEDIDO — PromoInc*\n🔖 *Pedido #:* ${orderNumber}`);
    }

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(finalMsg)}`;

    btn.disabled = false;
    btn.innerHTML = `${WA_ICON} Enviar pedido por WhatsApp`;

    window.open(url, '_blank');
    close();
  }

  return { open, close, submit };
})();
