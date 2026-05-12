/**
 * PromoInc — Generador de Catálogo PDF
 * Usa jsPDF + jsPDF-AutoTable para generar un PDF elegante y profesional
 * con todos los productos agrupados por sección/categoría
 */

(function () {
  'use strict';

  const API_BASE = '../api';
  const COMPANY_NAME = 'PromoInc';
  const COMPANY_TAGLINE = 'Artículos Promocionales de Alta Calidad';
  const ACCENT_CYAN = [0, 188, 255];
  const DARK_BG = [24, 25, 29];
  const DARK_SURFACE = [38, 40, 45];
  const TEXT_PRIMARY = [244, 245, 247];
  const TEXT_MUTED = [139, 145, 158];
  const WHITE = [255, 255, 255];

  /**
   * Convierte una imagen URL a base64 para incrustarla en el PDF
   */
  async function urlToBase64(url) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  /**
   * Trunca texto largo con ellipsis
   */
  function truncate(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
  }

  /**
   * Formatea un precio en MXN
   */
  function formatPrice(price) {
    if (!price || price <= 0) return 'Consultar';
    return `$${parseFloat(price).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  }

  /**
   * Genera el PDF completo del catálogo
   */
  async function generateCatalog() {
    const btn = document.getElementById('btn-download-catalog');
    if (!btn) return;

    // Loading state
    btn.classList.add('loading');
    btn.querySelector('.btn-text').textContent = 'Generando…';
    btn.querySelector('svg').innerHTML = '<circle cx="12" cy="12" r="9" stroke-width="2.5" stroke-dasharray="20 40" stroke-linecap="round"/>';

    try {
      // 1. Cargar datos
      const response = await fetch(`${API_BASE}/catalog_pdf.php`);
      const json = await response.json();
      if (!json.success) throw new Error(json.error || 'Error al cargar catálogo');

      const { categories, total, generated } = json.data;
      const { jsPDF } = window.jspdf;

      // 2. Crear documento
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const PAGE_W = doc.internal.pageSize.getWidth();  // 215.9mm
      const PAGE_H = doc.internal.pageSize.getHeight(); // 279.4mm
      const MARGIN = 14;
      const CONTENT_W = PAGE_W - MARGIN * 2;

      // ── PORTADA ────────────────────────────────────────────────
      // Fondo oscuro completo
      doc.setFillColor(...DARK_BG);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

      // Franja de acento superior
      doc.setFillColor(...ACCENT_CYAN);
      doc.rect(0, 0, PAGE_W, 4, 'F');

      // Logo text (fallback ya que no podemos garantizar font custom)
      doc.setTextColor(...ACCENT_CYAN);
      doc.setFontSize(42);
      doc.setFont('helvetica', 'bold');
      doc.text(COMPANY_NAME.toUpperCase(), PAGE_W / 2, 80, { align: 'center' });

      // Separador
      doc.setDrawColor(...ACCENT_CYAN);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 30, 90, PAGE_W - MARGIN - 30, 90);

      // Tagline
      doc.setTextColor(...TEXT_PRIMARY);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_TAGLINE, PAGE_W / 2, 102, { align: 'center' });

      // Subtítulo
      doc.setTextColor(...TEXT_MUTED);
      doc.setFontSize(11);
      doc.text('CATÁLOGO DE PRODUCTOS', PAGE_W / 2, 115, { align: 'center' });

      // Año
      doc.setFontSize(10);
      const year = new Date().getFullYear();
      doc.text(`Actualizado: ${generated.split(' ')[0]}`, PAGE_W / 2, 127, { align: 'center' });

      // Badge de total
      doc.setFillColor(...DARK_SURFACE);
      doc.roundedRect(PAGE_W / 2 - 40, 140, 80, 22, 4, 4, 'F');
      doc.setDrawColor(...ACCENT_CYAN);
      doc.setLineWidth(0.4);
      doc.roundedRect(PAGE_W / 2 - 40, 140, 80, 22, 4, 4, 'D');
      doc.setTextColor(...ACCENT_CYAN);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${total}`, PAGE_W / 2, 154, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_MUTED);
      doc.text('PRODUCTOS DISPONIBLES', PAGE_W / 2, 160, { align: 'center' });

      // Índice de categorías en portada
      doc.setTextColor(...TEXT_MUTED);
      doc.setFontSize(9);
      doc.text('SECCIONES:', MARGIN, 195);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.setFontSize(9);
      let catY = 203;
      categories.forEach((cat, i) => {
        const bullet = `${String(i + 1).padStart(2, '0')}.  ${cat.name.toUpperCase()}`;
        const count = `${cat.products.length} producto${cat.products.length !== 1 ? 's' : ''}`;
        doc.setFont('helvetica', 'bold');
        doc.text(bullet, MARGIN + 5, catY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT_MUTED);
        doc.text(count, PAGE_W - MARGIN - 5, catY, { align: 'right' });
        doc.setTextColor(...TEXT_PRIMARY);
        catY += 7;
        if (catY > PAGE_H - 30) { catY = 203; } // si hay muchas categorías
      });

      // Pie de portada
      doc.setFillColor(...DARK_SURFACE);
      doc.rect(0, PAGE_H - 20, PAGE_W, 20, 'F');
      doc.setTextColor(...TEXT_MUTED);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('www.promoinc.mx  •  Los precios están sujetos a cambio sin previo aviso', PAGE_W / 2, PAGE_H - 8, { align: 'center' });

      // ── PÁGINAS DE CATEGORÍAS ──────────────────────────────────
      for (let ci = 0; ci < categories.length; ci++) {
        const cat = categories[ci];
        doc.addPage();

        // Fondo de página
        doc.setFillColor(...DARK_BG);
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

        // Header de sección
        doc.setFillColor(...DARK_SURFACE);
        doc.rect(0, 0, PAGE_W, 28, 'F');

        // Acento izquierdo de la sección
        doc.setFillColor(...ACCENT_CYAN);
        doc.rect(0, 0, 4, 28, 'F');

        // Nombre de categoría
        doc.setTextColor(...ACCENT_CYAN);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(cat.name.toUpperCase(), MARGIN + 4, 12);

        // Conteo
        doc.setTextColor(...TEXT_MUTED);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cat.products.length} producto${cat.products.length !== 1 ? 's' : ''} disponibles`, MARGIN + 4, 21);

        // Número de sección
        doc.setTextColor(...ACCENT_CYAN);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(`${String(ci + 1).padStart(2, '0')}`, PAGE_W - MARGIN, 18, { align: 'right' });

        // Tabla de productos
        const tableData = cat.products.map(p => {
          const mainPrice = formatPrice(p.price_from);
          
          // Precios por volumen en texto compacto
          let volPrices = '';
          if (p.volume_prices && p.volume_prices.length > 0) {
            volPrices = p.volume_prices
              .slice(0, 3)
              .map(vp => `${vp.min_qty}+: $${parseFloat(vp.price).toFixed(2)}`)
              .join('\n');
          } else {
            volPrices = 'Precio único';
          }

          const minQty = p.min_quantity ? `${p.min_quantity} pzs.` : '1 pzs.';
          const customizable = p.customizable ? '✓ Personalizable' : '—';
          const sku = p.sku || '—';

          return [
            truncate(p.name, 40),
            sku,
            mainPrice,
            volPrices,
            minQty,
            customizable
          ];
        });

        doc.autoTable({
          startY: 33,
          margin: { left: MARGIN, right: MARGIN },
          head: [['PRODUCTO', 'SKU', 'PRECIO BASE', 'PRECIOS VOLUMEN', 'MÍNIMO', 'PERSONALIZABLE']],
          body: tableData,
          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
            textColor: TEXT_PRIMARY,
            fillColor: DARK_BG,
            lineColor: [50, 53, 60],
            lineWidth: 0.2,
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: DARK_SURFACE,
            textColor: ACCENT_CYAN,
            fontStyle: 'bold',
            fontSize: 7.5,
            cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
          },
          alternateRowStyles: {
            fillColor: [28, 30, 35],
          },
          columnStyles: {
            0: { cellWidth: 56, fontStyle: 'bold' },
            1: { cellWidth: 22, textColor: TEXT_MUTED },
            2: { cellWidth: 32, textColor: ACCENT_CYAN, fontStyle: 'bold' },
            3: { cellWidth: 38, fontSize: 7, textColor: TEXT_MUTED },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 28, halign: 'center', textColor: TEXT_MUTED },
          },
          didParseCell: (data) => {
            // Highlight personalizable = true
            if (data.column.index === 5 && data.row.raw && data.row.raw[5] === '✓ Personalizable') {
              data.cell.styles.textColor = [0, 188, 100];
            }
          },
        });

        // Footer de cada página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFillColor(...DARK_SURFACE);
        doc.rect(0, PAGE_H - 14, PAGE_W, 14, 'F');
        doc.setTextColor(...TEXT_MUTED);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(COMPANY_NAME + '  •  ' + COMPANY_TAGLINE, MARGIN, PAGE_H - 5);
        doc.text(`Pág. ${ci + 2}`, PAGE_W - MARGIN, PAGE_H - 5, { align: 'right' });
      }

      // Actualizar número de páginas en portada no es necesario ya que jsPDF numera bien
      // Añadir footers a todas las páginas excepto la portada ya está manejado arriba

      // 3. Descargar
      const filename = `PromoInc_Catalogo_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error('Error generando catálogo:', err);
      alert('Ocurrió un error generando el catálogo. Por favor intenta de nuevo.');
    } finally {
      // Restaurar botón
      if (btn) {
        btn.classList.remove('loading');
        btn.querySelector('.btn-text').textContent = 'Descargar Catálogo';
        btn.querySelector('svg').innerHTML = '<path d="M12 16l4-4h-3V4h-2v8H8l4 4z"/><path d="M20 18H4v2h16v-2z"/>';
      }
    }
  }

  // Esperar a que jsPDF esté disponible y luego attachear el evento
  function init() {
    const btn = document.getElementById('btn-download-catalog');
    if (!btn) return;
    btn.addEventListener('click', generateCatalog);
  }

  // Si el DOM ya está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
