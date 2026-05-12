<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromoInc | Artículos Promocionales Corporativos de Alto Impacto</title>
  <meta name="description"
    content="Plataforma líder en artículos promocionales y corporativos. Regalos empresariales de alta gama, merchandising y productos personalizables.">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />

  <!-- CSS -->
  <link rel="stylesheet" href="assets/css/main.css?v=49.5">
  <link rel="stylesheet" href="assets/css/components.css?v=49.5">
  <link rel="stylesheet" href="assets/css/animations.css?v=49.5">
  
  <style>
    /* ── FRONTEND-DESIGN: REFINED EDITORIAL LUXURY ── */
    :root {
      --hero-gradient: radial-gradient(circle at 0% 0%, rgba(232, 62, 140, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 100% 100%, rgba(0, 188, 255, 0.1) 0%, transparent 50%);
    }

    /* Mejora de Textura Global */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      background-image: url("https://grainy-gradients.vercel.app/noise.svg");
      opacity: 0.03;
      pointer-events: none;
      z-index: 9999;
    }

    .hero-main {
      padding: 180px 0 100px;
      min-height: 95vh;
      display: flex;
      align-items: center;
      background: var(--bg-body);
      position: relative;
      overflow: hidden;
    }

    .hero-main::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--hero-gradient);
      pointer-events: none;
    }

    .hero-headline {
      font-size: clamp(3.5rem, 8vw, 5.5rem);
      line-height: 0.95;
      letter-spacing: -0.04em;
      margin-bottom: 2rem;
    }

    .hero-sub {
      font-size: 1.25rem;
      max-width: 500px;
      color: var(--text-secondary);
      border-left: 2px solid var(--accent-pink);
      padding-left: 1.5rem;
      margin-bottom: 3rem;
    }

    /* Tarjetas de Producto Evolucionadas */
    .card {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 24px;
      transition: all 0.5s var(--ease-smooth);
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--accent-cyan);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0, 188, 255, 0.1);
    }

    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
      opacity: 0;
      transition: opacity 0.5s;
    }

    .card:hover::before {
      opacity: 1;
    }

    .hero-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 1.2rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: 16px;
      color: #fff !important;
      background: linear-gradient(135deg, var(--accent-pink), var(--accent-pink-d));
      box-shadow: 0 10px 30px rgba(232, 62, 140, 0.4);
      transition: all 0.4s var(--ease-spring);
      text-decoration: none;
    }
    .hero-btn-primary:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 40px rgba(232, 62, 140, 0.6);
    }
    .hero-btn-outline {
      display: inline-block;
      padding: 1.1rem 2.2rem;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(10px);
      font-weight: 700;
      color: #fff;
      transition: all 0.3s ease;
    }
    .hero-btn-outline:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.3);
    }

    /* Glassmorphism Sidebar/Action */
    .nav-action-btn {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.6rem 1.2rem;
      border-radius: 100px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
    }

    /* Headline Dynamic Gradient */
    .hero-headline {
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
    }
    .hero-word {
      display: block;
      background: linear-gradient(135deg, var(--accent-pink), var(--accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 15px rgba(232, 62, 140, 0.2));
    }

    /* Social Proof Refined */
    .hero-social-proof {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2.5rem;
    }
    .hero-avatars {
      display: flex;
      align-items: center;
    }
    .hero-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--bg-body);
      margin-left: -10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .hero-avatar:first-child { margin-left: 0; }

    /* Floating Cards Evolution */
    .hero-imgs {
      display: grid;
      grid-template-columns: 1fr;
      gap: 25px;
      position: relative;
    }
    .hero-img-main, .hero-img-secondary {
      border-radius: 24px;
      background: var(--bg-primary);
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0,0,0,0.5);
      transition: all 0.6s cubic-bezier(0.2, 1, 0.3, 1);
    }
    .hero-img-main:hover, .hero-img-secondary:hover {
      transform: translateY(-12px) scale(1.02);
      border-color: rgba(255,255,255,0.2);
    }
    .hero-img-tag {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(12px);
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Hero Layout Adjustments */
    .hero-main {
      padding-top: 140px;
      background: radial-gradient(circle at 10% 30%, rgba(232, 62, 140, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 90% 70%, rgba(0, 188, 255, 0.08) 0%, transparent 40%);
    }
    
    /* ── CART SIDEBAR ──────────────────────────────────────────────── */
    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    .cart-overlay.open {
      opacity: 1;
      pointer-events: all;
    }

    .cart-panel {
      position: fixed;
      top: 0;
      right: -420px;
      width: 420px;
      max-width: 100vw;
      height: 100%;
      background: var(--bg-surface);
      border-left: 1px solid var(--border);
      z-index: 2001;
      display: flex;
      flex-direction: column;
      transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
    }

    .cart-panel.open {
      right: 0;
    }

    .cart-panel-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cart-panel-header h3 {
      font-family: var(--font-display);
      font-size: 1.3rem;
    }

    .cart-close-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .cart-close-btn:hover {
      background: var(--bg-body);
      color: var(--text-primary);
    }

    .cart-items-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .cart-item {
      display: flex;
      gap: 15px;
      align-items: flex-start;
      padding: 15px 0;
      border-bottom: 1px solid var(--border);
    }

    .cart-item-img {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      background: var(--bg-body);
      border: 1px solid var(--border);
      object-fit: contain;
      flex-shrink: 0;
      padding: 5px;
    }

    .cart-item-info {
      flex: 1;
    }

    .cart-item-name {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }

    .cart-item-price {
      color: var(--accent-cyan);
      font-weight: 700;
    }

    .cart-item-qty {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .cart-item-remove {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: var(--transition);
    }

    .cart-item-remove:hover {
      color: var(--accent-pink);
      background: rgba(232, 62, 140, 0.1);
    }

    .cart-panel-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      background: var(--bg-body);
    }

    .cart-total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .cart-total-label {
      color: var(--text-muted);
    }

    .cart-total-value {
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--accent-cyan);
    }

    .cart-count-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: var(--accent-cyan);
      color: #000;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-action-btn {
      position: relative;
    }

    .cart-empty-msg {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
  </style>

  <!-- Lenis Smooth Scroll -->
  <script src="https://unpkg.com/@studio-freight/lenis@1.0.34/dist/lenis.min.js"></script>

</head>

<body>



  <!-- Page Loader -->
  <div id="page-loader" class="page-loader">
    <div class="loader-bg-decor"></div>

    <!-- Planetary Orbiting Icons -->
    <div class="loader-icons-orbit">
      <div class="orbit-ring orbit-1">
        <div class="orbit-icon orbit-icon-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          </svg></div>
        <div class="orbit-icon orbit-icon-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
            <line x1="3" y1="6" x2="21" y2="6" />
          </svg></div>
      </div>
      <div class="orbit-ring orbit-2">
        <div class="orbit-icon orbit-icon-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          </svg></div>
        <div class="orbit-icon orbit-icon-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5v10a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
            <path d="M12 6V2" />
          </svg></div>
      </div>
    </div>

    <div class="loader-logo-container">
      <div class="loader-logo">
        <img src="assets/images/logo blanco (2).png" alt="PromoInc" class="loader-img-main">
        <div class="loader-bar">
          <div class="loader-bar-fill"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navbar E-commerce -->
  <header id="navbar" class="navbar-ecommerce">
    <div class="navbar-top">
      <div class="container navbar-top-inner">

        <a href="index.php" class="navbar-logo">
          <img src="assets/images/logo blanco (2).png" alt="PromoInc Logo">
        </a>

        <div class="navbar-search">
          <input type="text" id="navbar-search-input" placeholder="Buscar productos, categorías, SKU..." aria-label="Buscar">
          <button type="button" id="btn-navbar-search" aria-label="Botón buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div class="navbar-actions-top">
          <a href="javascript:void(0)" onclick="openCart()" class="nav-action-btn" id="cart-btn-nav">
            <div class="cart-icon" style="position:relative;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span id="cart-badge" class="cart-count-badge" style="display:none;"></span>
            </div>
            <span>Mi carrito</span>
          </a>
          <a href="login.html" class="btn btn-outline btn-sm"
            style="background:var(--bg-surface); color:var(--text-primary); border-color:var(--border);"
            id="auth-btn">Mi Portal</a>
          <button id="navbar-toggle" class="navbar-toggle" aria-label="Menu" style="margin-left:0.5rem">
            <span style="background:var(--text-primary)"></span><span
              style="background:var(--text-primary)"></span><span style="background:var(--text-primary)"></span>
          </button>
        </div>

      </div>
    </div>

    <div class="navbar-bottom">
      <div class="container">
        <nav class="nav-categories">
          <!-- Se llena dinámicamente -->
        </nav>
      </div>
    </div>
  </header>

  <!-- Menú Móvil Overlay -->
  <div id="mobile-menu" class="mobile-menu">
    <div class="mobile-menu-header">
      <a href="index.php" class="navbar-logo">
        <img src="assets/images/logo blanco (2).png" alt="PromoInc Logo" style="height: 80px; width: auto; margin:0;">
      </a>
      <button id="mobile-menu-close" class="btn-close-menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="mobile-menu-body">
      <nav class="mobile-nav-list">
        <a href="index.php" class="mobile-nav-link">Inicio</a>
        <a href="catalogo.html" class="mobile-nav-link">Catálogo Completo</a>
        <a href="catalogo.html?on_sale=1" class="mobile-nav-link nav-link-ofertas">Ofertas Especiales</a>
        <div class="mobile-nav-divider">Categorías</div>
        <div id="mobile-categories-list">
          <!-- Se llena dinámicamente -->
        </div>
      </nav>
      <div class="mobile-menu-footer">
        <a href="login.html" class="btn btn-primary w-full justify-center" id="mobile-portal-btn">Mi Portal Corporativo</a>
      </div>
    </div>
  </div>

  <!-- CART SIDEBAR -->
  <div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>
  <div class="cart-panel" id="cart-panel">
    <div class="cart-panel-header">
      <h3>🛒 Mi Carrito</h3>
      <button class="cart-close-btn" onclick="closeCart()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div class="cart-items-list" id="cart-items-list">
      <div class="cart-empty-msg">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"
          style="margin-bottom:15px;opacity:0.3">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p>Tu carrito está vacío</p>
      </div>
    </div>
    <div class="cart-panel-footer" id="cart-footer" style="display:none">
      <div id="cart-login-notice" class="cart-login-notice" style="display:none">
        <a href="login.html" style="color:var(--accent-cyan);font-weight:600;">Inicia sesión</a> para guardar
        permanentemente.
      </div>
      <div class="cart-total-row">
        <span class="cart-total-label">Total estimado</span>
        <span class="cart-total-value" id="cart-total-value">$0.00</span>
      </div>
      <button onclick="CheckoutModal.open()" class="btn btn-primary"
        style="width:100%;justify-content:center;margin-bottom:10px;">Continuar al pago por WhatsApp</button>
      <button onclick="CartManager.clear().then(renderCart)" class="btn btn-outline"
        style="width:100%;justify-content:center;font-size:0.85rem;">Vaciar carrito</button>
    </div>
  </div>

  <!-- ═══ HERO SECTION ═══════════════════════════════════════ -->
  <section class="hero-main">
    <div class="hero-bg">
      <div class="hero-bg-glow"></div>
      <div class="hero-bg-lines"></div>
      <div class="hero-bg-noise"></div>
    </div>

    <div class="container hero-content">
      <!-- Left column: Rotating headline -->
      <div class="hero-left reveal">
        <div class="hero-social-proof">
          <div class="hero-avatars">
            <div class="hero-avatar" style="background: linear-gradient(135deg,#e83e8c,#ff8eb3)"></div>
            <div class="hero-avatar" style="background: linear-gradient(135deg,#00bcff,#80e1ff)"></div>
            <div class="hero-avatar" style="background: linear-gradient(135deg,#a78bfa,#c4b5fd)"></div>
            <div class="hero-avatar" style="background: linear-gradient(135deg,#fbbf24,#fde68a)"></div>
          </div>
          <div class="hero-proof-text" style="display:flex; align-items:center; gap:8px;">
            <div class="hero-stars" style="display:flex; gap:2px;">
              <svg viewBox="0 0 20 20" fill="#fbbf24" width="14"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg viewBox="0 0 20 20" fill="#fbbf24" width="14"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg viewBox="0 0 20 20" fill="#fbbf24" width="14"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg viewBox="0 0 20 20" fill="#fbbf24" width="14"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg viewBox="0 0 20 20" fill="#fbbf24" width="14"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">+100 empresas ya confiaron en nosotros</span>
          </div>
        </div>

        <h1 class="hero-headline">
          Creamos<br>
          <span class="hero-word">Diseño</span>
        </h1>

        <div style="margin: 2rem 0; max-width: 420px; border-left: 3px solid var(--accent-pink); padding-left: 20px;">
          <p style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.6;">
            Soluciones de merchandising corporativo que definen el estándar de tu industria. Innovación en cada detalle, desde 20 unidades.
          </p>
        </div>

        <div class="hero-actions" style="display: flex; flex-direction: column; align-items: flex-start; gap: 20px;">
          <a href="catalogo.html" class="hero-btn-primary">
            Explorar Colección
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#cotizar" class="hero-btn-outline">
            Planificar Proyecto
          </a>
        </div>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">5+</span>
            <span class="hero-stat-label">Años en el mercado</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">500+</span>
            <span class="hero-stat-label">Productos disponibles</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">100+</span>
            <span class="hero-stat-label">Empresas atendidas</span>
          </div>
        </div>
      </div>

      <!-- Right column: Product images showcase -->
      <div class="hero-imgs reveal reveal-delay-2">
        <div class="hero-img-main">
          <img src="assets/images/hero-products-1.png" alt="Personalización con tu logo" style="width:100%; height:auto;">
          <div class="hero-img-tag">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--accent-pink)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Personalización con tu logo
          </div>
        </div>
        <div class="hero-img-secondary">
          <img src="assets/images/hero-products-2.png" alt="Kits corporativos" style="width:100%; height:auto;">
          <div class="hero-img-tag">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--accent-cyan)"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/></svg>
            Kits corporativos
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Servicios -->

  <section id="especialidades" class="section">
    <div class="container">
      <div class="section-header text-center reveal">
        <span class="section-label">Lo que hacemos</span>
        <h2 class="display-2">Nuestros <span class="text-pink">Servicios</span></h2>
        <p class="section-subtitle" style="margin: 1rem auto 0; max-width: 540px;">Todo lo que necesitas para llevar tu
          marca al siguiente nivel, bajo un mismo techo.</p>
      </div>

      <div class="svc-layout reveal">
        <!-- Columna izquierda: Servicio principal destacado -->
        <div class="svc-featured">
          <div class="svc-featured-inner">
            <span class="svc-eyebrow">Servicio estrella</span>
            <h3>Personalización completa de artículos promocionales</h3>
            <p>Vasos, termos, bolígrafos, textiles y más de 500 productos listos para llevar el logo de tu empresa.
              Trabajamos desde 25 unidades.</p>
            <div class="svc-tags">
              <span>Vasos</span><span>Merch</span><span>Regalos</span><span>Material POP</span><span>Kits</span>
            </div>
            <a href="catalogo.html" class="svc-cta">Explorar catálogo
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Columna derecha: Lista de servicios -->
        <div class="svc-list">
          <div class="svc-item">
            <div class="svc-num">01</div>
            <div class="svc-item-body">
              <h4>Impresión y estampado</h4>
              <p>Sublimación, DTF, vinil textil, impresión UV y estampado sobre productos del cliente.</p>
            </div>
          </div>
          <div class="svc-item">
            <div class="svc-num" style="color: var(--accent-cyan);">02</div>
            <div class="svc-item-body">
              <h4>Etiquetado y branding</h4>
              <p>Stickers, etiquetado de packaging, branding de empaques y aplicación manual.</p>
            </div>
          </div>
          <div class="svc-item">
            <div class="svc-num" style="color: var(--accent-gold);">03</div>
            <div class="svc-item-body">
              <h4>Producción corporativa</h4>
              <p>Volumen, personalización masiva, kits empresariales y material POP a medida.</p>
            </div>
          </div>
          <div class="svc-item">
            <div class="svc-num" style="color: #a78bfa;">04</div>
            <div class="svc-item-body">
              <h4>Apoyo a emprendedores</h4>
              <p>Producción pequeña y mediana, personalización bajo pedido y asesoría para marcas nuevas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Social Proof (Logo Carousel) -->
  <section class="clients-section">
    <div class="container">
      <p class="text-center text-muted"
        style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 1rem; font-weight: 600;">
        Confían en nuestra calidad</p>

      <div class="logos-marquee">
        <div class="logos-track">
          <!-- Dinámico vía main.js -->
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ OFERTAS ESPECIALES ══════════════════════════════════════ -->
  <section class="section" id="ofertas-section" style="background: var(--bg-surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
    <div class="container">
      <div class="flex items-center justify-between" style="margin-bottom: 2.5rem;">
        <div class="reveal">
          <h2 class="display-2">Ofertas <span class="text-pink glitch" data-text="Relámpago">Relámpago</span></h2>
          <p class="section-subtitle">Aprovecha descuentos exclusivos por tiempo limitado.</p>
        </div>
        <a href="catalogo.html?on_sale=1" class="btn btn-outline reveal">Ver todas las ofertas</a>
      </div>
      
      <div id="offers-grid" class="products-grid">
        <!-- Se llena con loadSaleProducts() -->
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
      </div>
    </div>
  </section>

  <!-- Productos Destacados -->
  <section class="products-section section" id="productos">
    <div class="container">
      <div class="flex items-center justify-between" style="margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div class="reveal">
          <h2 class="display-2">Catálogo <span class="text-cyan">Destacado</span></h2>
          <p class="section-subtitle">Selección premium con disponibilidad inmediata.</p>
        </div>
        <a href="catalogo.html" class="btn btn-secondary reveal">Ver Todo el Catálogo</a>
      </div>

      <div id="featured-filter-bar" class="products-filter-bar reveal">
        <button class="filter-btn active" data-cat="all">Todos</button>
      </div>

      <!-- El contenedor se llenará vía main.js -->
      <div id="featured-grid" class="products-grid">
        <!-- Esqueletos mientras carga -->
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
        <div class="card skeleton" style="height: 380px;"></div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section id="contacto" class="cta-band">
    <div class="container cta-band-inner">
      <div class="cta-info reveal">
        <span class="section-label">Cotización Rápida</span>
        <h2 class="display-2" style="margin-bottom: 1rem;">¿Listo para destacar tu <span class="text-pink glitch"
            data-text="marca">marca</span>?</h2>
        <p class="text-muted" style="margin-bottom: 2rem; font-size: 1.1rem; max-width: 450px;">Solicita una cotización
          sin compromiso. Nuestro equipo de asesores corporativos te responderá con opciones personalizadas y mockups
          visuales en menos de 24 horas.</p>

        <div style="display:flex; flex-direction:column; gap:1.2rem; margin-bottom: 2rem;">
          <div class="flex items-center gap-1">
            <div
              style="width:40px; height:40px; border-radius:50%; background:var(--bg-elevated); display:flex; align-items:center; justify-content:center; color:var(--accent-pink);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <p style="font-size:0.8rem; color:var(--text-subtle);">Atención al Cliente</p>
              <p style="font-weight:600;">(02) 2471-233</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <div
              style="width:40px; height:40px; border-radius:50%; background:var(--bg-elevated); display:flex; align-items:center; justify-content:center; color:var(--accent-cyan);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p style="font-size:0.8rem; color:var(--text-subtle);">Email Corporativo</p>
              <p style="font-weight:600;">ventas@promoinc.ec</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card reveal reveal-delay-2"
        style="padding: 1.15rem; background: var(--bg-primary); box-shadow: var(--shadow-glow);">
        <form id="quote-form" class="cta-form">
          <div class="cta-form-row">
            <div class="form-group">
              <label class="form-label">Nombre Empresa *</label>
              <input type="text" name="company" class="form-control" required placeholder="Ej. ACME Corp">
            </div>
            <div class="form-group">
              <label class="form-label">Nombre Contacto *</label>
              <input type="text" name="contact_name" class="form-control" required placeholder="Tu nombre">
            </div>
          </div>
          <div class="cta-form-row">
            <div class="form-group">
              <label class="form-label">Correo Electrónico *</label>
              <input type="email" name="email" class="form-control" required placeholder="correo@empresa.com">
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono / WhatsApp</label>
              <input type="tel" name="phone" class="form-control" placeholder="099 123 4567">
            </div>
          </div>
          <div class="form-group" style="margin-top: 0.5rem;">
            <label class="form-label">Detalles de lo que buscas</label>
            <textarea name="message" class="form-control"
              placeholder="Describe los artículos que necesitas, cantidades estimadas, colores corporativos..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg"
            style="margin-top: 1rem; width: 100%; justify-content: center;">
            Solicitar Cotización <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: #fff;">Promo<span
              style="color: var(--accent-pink)">Inc</span>.</div>
          <p>Potenciamos la presencia de tu marca a través de artículos promocionales corporativos de la más alta
            calidad. Importación directa y producción a medida.</p>
          <div class="footer-social">
            <a href="#" class="social-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg></a>
            <a href="#" class="social-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg></a>
            <a href="#" class="social-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg></a>
          </div>
        </div>

        <div>
          <h4 class="footer-heading">Categorías</h4>
          <ul class="footer-links" id="footer-categories">
            <!-- Dinámico -->
            <li><a href="catalogo.html" class="footer-link">Ver todo el catálogo</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Servicios</h4>
          <div
            style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
            <div class="footer-service-group">
              <strong style="color: #fff; display: block; margin-bottom: 2px;">Personalización</strong>
              <span>Vasos, Merch, Regalos, Logo</span>
            </div>
            <div class="footer-service-group">
              <strong style="color: #fff; display: block; margin-bottom: 2px;">Impresión y Estampado</strong>
              <span>Sublimación, DTF, Vinil, UV</span>
            </div>
            <div class="footer-service-group">
              <strong style="color: #fff; display: block; margin-bottom: 2px;">Branding y Packaging</strong>
              <span>Etiquetas, Packaging, Stickers</span>
            </div>
            <div class="footer-service-group">
              <strong style="color: #fff; display: block; margin-bottom: 2px;">Corporativo y Volumen</strong>
              <span>Material POP, Kits, Producción</span>
            </div>
            <div class="footer-service-group">
              <strong style="color: #fff; display: block; margin-bottom: 2px;">Emprendedores</strong>
              <span>Pequeña/Mediana producción</span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="footer-heading">Contacto</h4>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <circle cx="12" cy="10" r="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>De los Eucaliptos E1-37 y 10 de Agosto<br>Quito, Ecuador</span>
          </div>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>(02) 2471-233<br>+593 98 939 8005</span>
          </div>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="22,6 12,13 2,6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>ventas@promoinc.ec</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 PromoInc. Todos los derechos reservados.</p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-bottom-link">Términos y Condiciones</a>
          <a href="#" class="footer-bottom-link">Políticas de Privacidad</a>
          <a href="admin/login.html" class="footer-bottom-link" style="opacity: 0.5;">Acceso Admin</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- WhatsApp FAB -->
  <a href="https://wa.me/593987827215" target="_blank" class="fab-whatsapp" aria-label="Chat en WhatsApp">
    <svg viewBox="0 0 24 24">
      <path
        d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
    </svg>
  </a>

  <!-- Scripts -->
  <script src="assets/js/cart.js?v=49.2"></script>
  <script src="assets/js/checkout.js?v=49.2"></script>
  <script src="assets/js/main.js?v=49.2"></script>
  <script>
    function openCart() {
      document.getElementById('cart-panel').classList.add('open');
      document.getElementById('cart-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeCart() {
      document.getElementById('cart-panel').classList.remove('open');
      document.getElementById('cart-overlay').classList.remove('open');
      document.body.style.overflow = '';
    }
    function renderCart(items) {
      const list = document.getElementById('cart-items-list');
      const footer = document.getElementById('cart-footer');
      const badge = document.getElementById('cart-badge');
      const count = CartManager.getCount();
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
      if (!items || items.length === 0) {
        list.innerHTML = '<div class="cart-empty-msg"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:15px;opacity:0.3"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Tu carrito está vacío</p></div>';
        footer.style.display = 'none'; return;
      }
      list.innerHTML = items.map(item => {
        const imgSrc = item.image_webp ? `assets/images/${item.image_webp}` : '';
        return `
          <div class="cart-item">
            <img src="${imgSrc}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">$${item.unit_price.toFixed(2)}</div>
              <div class="cart-item-qty">Cant: ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="CartManager.removeItem(${item.product_id}).then(renderCart)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;
      }).join('');
      document.getElementById('cart-total-value').textContent = '$' + CartManager.getTotal().toFixed(2);
      footer.style.display = 'block';
    }
    document.addEventListener('DOMContentLoaded', () => {
      CartManager.init(renderCart);
    });
  </script>
</body>

</html>