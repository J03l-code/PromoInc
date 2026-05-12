<?php
/**
 * PromoInc — API Catálogo para PDF
 * GET /api/catalog_pdf.php → todos los productos activos agrupados por categoría
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(405, 'Método no permitido');
}

$db = getDB();

// Obtener todos los productos activos con su categoría, precio y SKU
$stmt = $db->query("
    SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price_from,
        p.min_quantity,
        p.customizable,
        p.image_webp,
        COALESCE(c.name, 'Sin categoría') AS category_name,
        COALESCE(c.icon, '') AS category_icon,
        c.sort_order AS category_sort
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
    ORDER BY COALESCE(c.sort_order, 999) ASC, c.name ASC, p.name ASC
");
$products = $stmt->fetchAll();

// Para cada producto, obtener sus precios por volumen
$stmtPrices = $db->prepare("SELECT min_qty, price FROM product_prices WHERE product_id = ? ORDER BY min_qty ASC");

// Agrupar por categoría
$categories = [];
foreach ($products as $p) {
    $cat = $p['category_name'];
    if (!isset($categories[$cat])) {
        $categories[$cat] = [
            'name'     => $cat,
            'icon'     => $p['category_icon'],
            'products' => []
        ];
    }
    
    $stmtPrices->execute([$p['id']]);
    $p['volume_prices'] = $stmtPrices->fetchAll();
    
    $categories[$cat]['products'][] = $p;
}

// Convertir a array indexado
$result = array_values($categories);

jsonSuccess([
    'categories' => $result,
    'total'      => count($products),
    'generated'  => date('Y-m-d H:i:s')
]);
