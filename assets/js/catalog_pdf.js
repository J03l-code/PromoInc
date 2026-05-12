/**
 * PromoInc — Generador de Catálogo PDF v2
 * Catálogo visual con imágenes de producto, layout 2 columnas por página
 * Estilo: catálogo impreso profesional (fondo blanco, tipografía limpia)
 */

(function () {
  'use strict';

  const API_BASE = '../api';

  // Paleta — aspecto catálogo impreso profesional
  const C = {
    white:       [255, 255, 255],
    offWhite:    [248, 249, 250],
    lightGray:   [235, 237, 240],
    midGray:     [180, 185, 195],
    darkGray:    [80,  85,  95],
    nearBlack:   [25,  27,  32],
    accentCyan:  [0,   188, 255],
    accentPink:  [232, 62,  140],
    accentGold:  [255, 193, 7],
    greenOk:     [16,  185, 129],
  };

  /* ── Helpers ──────────────────────────────────────────────── */

  function fmt(price) {
    if (!price || parseFloat(price) <= 0) return 'Consultar';
    return '$' + parseFloat(price).toLocaleString('es-MX', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' MXN';
  }

  function trunc(text, n) {
    if (!text) return '';
    return text.length > n ? text.slice(0, n - 1) + '…' : text;
  }

  function wrapText(doc, text, x, y, maxW, lineH) {
    const lines = doc.splitTextToSize(text || '', maxW);
    doc.text(lines, x, y);
    return y + lines.length * lineH;
  }

  /**
   * Carga una imagen desde URL y la convierte a base64
   * Maneja CORS silenciosamente
   */
  async function imgToB64(url) {
    if (!url) return null;
    try {
      // Intentar con fetch directo
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => resolve(null);
        r.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  /**
   * Precargar todas las imágenes en paralelo con límite de concurrencia
   */
  async function preloadImages(products, baseUrl) {
    const CONCURRENCY = 6;
    const map = {};
    const queue = [...products];

    async function worker() {
      while (queue.length > 0) {
        const p = queue.shift();
        if (!p.image_webp) continue;
        const url = `${baseUrl}/assets/images/${p.image_webp}`;
        map[p.id] = await imgToB64(url);
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
    return map;
  }

  /* ── Dibujar un footer estándar en la página actual ───────── */
  function drawFooter(doc, pageNum, totalPages, pageW, pageH) {
    const M = 12;
    // Línea separadora
    doc.setDrawColor(...C.lightGray);
    doc.setLineWidth(0.3);
    doc.line(M, pageH - 13, pageW - M, pageH - 13);
    // Texto izquierda
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...C.midGray);
    doc.text('PromoInc — Artículos Promocionales de Alta Calidad  •  Precios sujetos a cambio sin previo aviso', M, pageH - 7.5);
    // Página derecha
    doc.setFont('helvetica', 'normal');
    doc.text(`${pageNum} / ${totalPages}`, pageW - M, pageH - 7.5, { align: 'right' });
  }

  /* ── Dibujar header de sección ────────────────────────────── */
  function drawSectionHeader(doc, name, count, y, pageW, M) {
    // Banda de color
    doc.setFillColor(...C.nearBlack);
    doc.rect(M, y, pageW - M * 2, 9, 'F');
    // Acento izquierdo
    doc.setFillColor(...C.accentCyan);
    doc.rect(M, y, 3, 9, 'F');
    // Texto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(name.toUpperCase(), M + 7, y + 6.3);
    // Conteo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.midGray);
    doc.text(`${count} producto${count !== 1 ? 's' : ''}`, pageW - M - 2, y + 6.3, { align: 'right' });

    return y + 9 + 5; // siguiente y
  }

  /* ── Dibujar una tarjeta de producto ─────────────────────── */
  function drawProductCard(doc, product, imgB64, x, y, cardW, cardH) {
    const PAD = 4;
    const IMG_W = cardW * 0.44;   // imagen ocupa ~44% del ancho
    const IMG_H = cardH - PAD * 2;
    const INFO_X = x + IMG_W + PAD * 1.5;
    const INFO_W = cardW - IMG_W - PAD * 2.5;

    // Fondo de la tarjeta
    doc.setFillColor(...C.white);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');

    // Borde sutil
    doc.setDrawColor(...C.lightGray);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'D');

    // ── Imagen ──────────────────────────────────────────────
    const imgX = x + PAD;
    const imgY = y + PAD;

    if (imgB64) {
      try {
        // Fondo claro para la imagen
        doc.setFillColor(...C.offWhite);
        doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 1.5, 1.5, 'F');
        // Imagen con object-fit contain (jsPDF centra automáticamente)
        doc.addImage(imgB64, 'JPEG', imgX, imgY, IMG_W, IMG_H, undefined, 'FAST', 0);
      } catch {
        // fallback: placeholder gris
        doc.setFillColor(...C.lightGray);
        doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 1.5, 1.5, 'F');
        doc.setTextColor(...C.midGray);
        doc.setFontSize(7);
        doc.text('Sin imagen', imgX + IMG_W / 2, imgY + IMG_H / 2, { align: 'center' });
      }
    } else {
      // placeholder
      doc.setFillColor(...C.lightGray);
      doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 1.5, 1.5, 'F');
      doc.setTextColor(...C.midGray);
      doc.setFontSize(7);
      doc.text('Sin imagen', imgX + IMG_W / 2, imgY + IMG_H / 2, { align: 'center' });
    }

    // ── Información del producto ─────────────────────────────
    let iy = y + PAD + 1;

    // SKU tag pequeño
    if (product.sku) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.midGray);
      doc.text(`Ref: ${product.sku}`, INFO_X, iy + 3.5);
      iy += 6;
    }

    // Nombre del producto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.nearBlack);
    const nameLines = doc.splitTextToSize(product.name || '', INFO_W);
    const nameToDraw = nameLines.slice(0, 2); // máximo 2 líneas
    doc.text(nameToDraw, INFO_X, iy + 3.5);
    iy += nameToDraw.length * 4.5 + 2;

    // Línea divisoria
    doc.setDrawColor(...C.lightGray);
    doc.setLineWidth(0.2);
    doc.line(INFO_X, iy, INFO_X + INFO_W, iy);
    iy += 4;

    // Descripción corta
    if (product.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.darkGray);
      const descText = product.description.replace(/<[^>]*>/g, '').trim();
      const descLines = doc.splitTextToSize(trunc(descText, 130), INFO_W);
      const descDraw = descLines.slice(0, 4);
      doc.text(descDraw, INFO_X, iy);
      iy += descDraw.length * 3.5 + 3;
    }

    // Precio base destacado
    const priceStr = fmt(product.price_from);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.accentCyan);
    doc.text(priceStr, INFO_X, iy + 3);
    iy += 7;

    // Precios por volumen
    if (product.volume_prices && product.volume_prices.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.darkGray);
      const vols = product.volume_prices.slice(0, 3)
        .map(vp => `${vp.min_qty}+ pzs: $${parseFloat(vp.price).toFixed(2)}`);
      doc.text(vols, INFO_X, iy);
      iy += vols.length * 3.2 + 3;
    }

    // Personalizable badge
    if (product.customizable) {
      doc.setFillColor(...C.greenOk);
      doc.roundedRect(INFO_X, iy, INFO_W * 0.7, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(...C.white);
      doc.text('✓ PERSONALIZABLE', INFO_X + INFO_W * 0.35, iy + 3.5, { align: 'center' });
      iy += 7;
    }

    // Cantidad mínima
    if (product.min_quantity && product.min_quantity > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.midGray);
      doc.text(`Mínimo: ${product.min_quantity} piezas`, INFO_X, iy + 2);
    }
  }

  /* ── Generar portada ──────────────────────────────────────── */
  function drawCover(doc, categories, total, generated, pageW, pageH) {
    const M = 12;

    // Fondo blanco
    doc.setFillColor(...C.white);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Banda superior de color (30mm)
    doc.setFillColor(...C.nearBlack);
    doc.rect(0, 0, pageW, 52, 'F');

    // Acento cyan lateral
    doc.setFillColor(...C.accentCyan);
    doc.rect(0, 0, 5, 52, 'F');

    // Logo / empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(...C.white);
    doc.text('PromoInc', M + 8, 24);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.accentCyan);
    doc.text('ARTÍCULOS PROMOCIONALES DE ALTA CALIDAD', M + 8, 34);

    // Subtítulo bajo la banda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C.nearBlack);
    doc.text('CATÁLOGO DE PRODUCTOS', M + 8, 66);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.darkGray);
    doc.text(`Actualizado: ${generated.split(' ')[0]}`, M + 8, 74);

    // Separador
    doc.setDrawColor(...C.lightGray);
    doc.setLineWidth(0.4);
    doc.line(M, 80, pageW - M, 80);

    // Badge total productos
    doc.setFillColor(...C.accentCyan);
    doc.roundedRect(M + 8, 86, 52, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text(`${total}`, M + 34, 98, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text('PRODUCTOS', M + 34, 103.5, { align: 'center' });

    // Índice de secciones
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.nearBlack);
    doc.text('ÍNDICE DE SECCIONES', M + 8, 120);

    doc.setDrawColor(...C.lightGray);
    doc.line(M + 8, 123, pageW - M - 8, 123);

    let iy = 130;
    categories.forEach((cat, i) => {
      // Número
      doc.setFillColor(...C.accentCyan);
      doc.circle(M + 12, iy - 1.5, 3.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C.white);
      doc.text(`${i + 1}`, M + 12, iy, { align: 'center' });

      // Nombre
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.nearBlack);
      doc.text(cat.name, M + 19, iy);

      // Puntos lider
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.midGray);
      const countTxt = `${cat.products.length} producto${cat.products.length !== 1 ? 's' : ''}`;
      doc.text(countTxt, pageW - M - 8, iy, { align: 'right' });

      iy += 9.5;
      if (iy > pageH - 30) iy = 130; // truncate si hay demasiadas secciones
    });

    // Footer portada
    doc.setFillColor(...C.nearBlack);
    doc.rect(0, pageH - 18, pageW, 18, 'F');
    doc.setFillColor(...C.accentCyan);
    doc.rect(0, pageH - 18, 5, 18, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.midGray);
    doc.text('www.promoinc.mx  |  Los precios son sin IVA y están sujetos a cambio sin previo aviso', M + 8, pageH - 7);
  }

  /* ── Función principal ────────────────────────────────────── */
  async function generateCatalog() {
    const btn = document.getElementById('btn-download-catalog');
    if (!btn) return;

    // Estado loading
    btn.classList.add('loading');
    const btnText = btn.querySelector('.btn-text');
    const btnSvg  = btn.querySelector('svg');
    btnText.textContent = 'Preparando…';
    btnSvg.innerHTML = '<circle cx="12" cy="12" r="9" stroke-width="2.5" stroke-dasharray="22 44" stroke-linecap="round"/>';

    try {
      // 1. Cargar datos del API
      btnText.textContent = 'Cargando productos…';
      const response = await fetch(`${API_BASE}/catalog_pdf.php`);
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Error al cargar catálogo');

      const { categories, total, generated } = json.data;
      const { jsPDF } = window.jspdf;

      // 2. Precargar imágenes en paralelo
      btnText.textContent = 'Cargando imágenes…';
      const allProducts = categories.flatMap(c => c.products);

      // Detectar el origen base dinámicamente
      const origin = window.location.origin + window.location.pathname
        .split('/').slice(0, -1).join('/').replace('/catalogo', '');

      const imgMap = await preloadImages(allProducts, origin);

      // 3. Inicializar jsPDF (carta, portrait)
      btnText.textContent = 'Generando PDF…';
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const PAGE_W = doc.internal.pageSize.getWidth();   // 215.9
      const PAGE_H = doc.internal.pageSize.getHeight();  // 279.4
      const M      = 12;   // margen
      const GAP    = 5;    // espacio entre tarjetas
      const CARD_W = (PAGE_W - M * 2 - GAP) / 2;  // 2 columnas
      const CARD_H = 68;   // alto de tarjeta en mm
      const TOP_START = 14; // Y inicial del contenido en páginas interiores

      // 4. Portada
      drawCover(doc, categories, total, generated, PAGE_W, PAGE_H);

      // 5. Páginas de contenido — una sección por categoría
      let pageNum = 2;

      for (const cat of categories) {
        const products = cat.products;
        if (!products.length) continue;

        let curY = null; // null = primera página de esta sección aún no comenzada

        for (let pi = 0; pi < products.length; pi += 2) {
          const pair = products.slice(pi, pi + 2);
          const isFirstInSection = (pi === 0);

          // ── Nueva página ─────────────────────────────────
          doc.addPage();

          // Fondo blanco
          doc.setFillColor(...C.offWhite);
          doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

          curY = TOP_START;

          // Header de sección (sólo primera página de la sección)
          if (isFirstInSection) {
            curY = drawSectionHeader(doc, cat.name, products.length, curY, PAGE_W, M);
          } else {
            // continuación de sección
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(...C.midGray);
            doc.text(`${cat.name} (continuación)`, M, curY + 4);
            curY += 8;
          }

          // ── Fila de 2 tarjetas ───────────────────────────
          const rowY = curY + 2;
          for (let col = 0; col < pair.length; col++) {
            const prod = pair[col];
            const cardX = M + col * (CARD_W + GAP);
            drawProductCard(doc, prod, imgMap[prod.id], cardX, rowY, CARD_W, CARD_H);
          }

          curY = rowY + CARD_H;

          // Si sobra espacio, agregar más filas en la misma página
          let nextPi = pi + 2;
          while (nextPi < products.length && curY + CARD_H + 10 < PAGE_H - 20) {
            const nextPair = products.slice(nextPi, nextPi + 2);
            const nextRowY = curY + GAP;
            for (let col = 0; col < nextPair.length; col++) {
              const prod = nextPair[col];
              const cardX = M + col * (CARD_W + GAP);
              drawProductCard(doc, prod, imgMap[prod.id], cardX, nextRowY, CARD_W, CARD_H);
            }
            curY = nextRowY + CARD_H;
            // Avanzar el iterador externo
            pi += 2;
            nextPi += 2;
          }

          // Footer de página
          drawFooter(doc, pageNum, '?', PAGE_W, PAGE_H);
          pageNum++;
        }
      }

      // Corregir total de páginas en footers (jsPDF no soporta two-pass nativamente,
      // dejamos el número real que ya se calculó)
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 2; p <= totalPages; p++) {
        doc.setPage(p);
        // Sobreescribir el "?" con el total real
        doc.setFillColor(...C.offWhite);
        doc.rect(PAGE_W - M - 22, PAGE_H - 12, 22, 8, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...C.midGray);
        doc.text(`${p - 1} / ${totalPages - 1}`, PAGE_W - M, PAGE_H - 7.5, { align: 'right' });
      }

      // 6. Descargar
      const fecha = new Date().toISOString().slice(0, 10);
      doc.save(`PromoInc_Catalogo_${fecha}.pdf`);

    } catch (err) {
      console.error('[CatalogPDF] Error:', err);
      alert('No fue posible generar el catálogo. Revisa tu conexión e inténtalo de nuevo.\n\nDetalle: ' + err.message);
    } finally {
      if (btn) {
        btn.classList.remove('loading');
        btnText.textContent = 'Descargar Catálogo PDF';
        btnSvg.innerHTML = '<path d="M12 16l4-4h-3V4h-2v8H8l4 4z"/><path d="M20 18H4v2h16v-2z"/>';
      }
    }
  }

  // Inicializar
  function init() {
    const btn = document.getElementById('btn-download-catalog');
    if (btn) btn.addEventListener('click', generateCatalog);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
