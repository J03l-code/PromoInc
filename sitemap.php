<?php
/**
 * PromoInk — Generador dinámico de Sitemap XML
 */
require_once 'api/config.php';

// Cabecera XML correcta
header('Content-Type: application/xml; charset=utf-8');

// Determinar el dominio base del sitio web de manera segura
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'promoink.ec';
$baseUrl = "$protocol://$host/";

// Inicializar la estructura XML del sitemap
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// 1. Páginas estáticas principales
$staticPages = [
    '' => '1.0',
    'catalogo.html' => '0.9',
    'contacto.html' => '0.8',
    'nosotros.html' => '0.8'
];

foreach ($staticPages as $path => $priority) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($baseUrl . $path) . "</loc>\n";
    echo "    <changefreq>daily</changefreq>\n";
    echo "    <priority>$priority</priority>\n";
    echo "  </url>\n";
}

// Obtener conexión a la base de datos
$db = getDB();

// 2. Páginas de Categorías Activas
try {
    $stmtCats = $db->query("SELECT id, slug FROM categories WHERE active = 1 ORDER BY sort_order ASC");
    $categories = $stmtCats->fetchAll(PDO::FETCH_ASSOC);
    foreach ($categories as $cat) {
        // Enlace al catálogo filtrado por categoría
        $url = $baseUrl . "catalogo.html?category=" . $cat['id'];
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($url) . "</loc>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.70</priority>\n";
        echo "  </url>\n";
    }
} catch (\Exception $e) {
    // Si falla por alguna razón, continuar silenciosamente para no romper el XML
}

// 3. Páginas de Detalles de Productos Activos
try {
    $stmtProds = $db->query("SELECT id, slug, updated_at FROM products WHERE active = 1 ORDER BY id DESC");
    $products = $stmtProds->fetchAll(PDO::FETCH_ASSOC);
    foreach ($products as $prod) {
        $url = $baseUrl . "producto.html?id=" . $prod['id'];
        $lastmod = !empty($prod['updated_at']) ? date('c', strtotime($prod['updated_at'])) : date('c');
        
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($url) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.80</priority>\n";
        echo "  </url>\n";
    }
} catch (\Exception $e) {
    // Continuar silenciosamente
}

echo '</urlset>' . "\n";
