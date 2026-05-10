<?php
/**
 * PromoInc — API Admin: Productos (protegida)
 * GET    /api/admin_products.php            → Listado completo
 * GET    /api/admin_products.php?id=X       → Detalle
 * POST   /api/admin_products.php            → Crear
 * PUT    /api/admin_products.php            → Actualizar
 * DELETE /api/admin_products.php            → Eliminar (soft)
 */

require_once 'middleware.php';
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    getAdminProducts($db);    break;
    case 'POST':
        // Permitir emulación de PUT/DELETE vía POST para compatibilidad
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['_method'] ?? 'POST';
        if ($action === 'PUT') updateAdminProduct($db);
        elseif ($action === 'DELETE') deleteAdminProduct($db);
        else createAdminProduct($db);
        break;
    case 'PUT':    updateAdminProduct($db);  break;
    case 'DELETE': deleteAdminProduct($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

// ── GET: Listado completo con stock ──────────────────────────
function getAdminProducts(PDO $db): void {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([(int)$_GET['id']]);
        $product = $stmt->fetch();
        if (!$product) jsonError(404, 'Producto no encontrado');

        $stmtStock = $db->prepare("SELECT variant, quantity FROM stock WHERE product_id = ? ORDER BY variant");
        $stmtStock->execute([$product['id']]);
        $product['stock'] = $stmtStock->fetchAll();
        jsonSuccess($product);
    }

    $search    = !empty($_GET['search'])   ? '%' . $_GET['search'] . '%' : null;
    $category  = !empty($_GET['category']) ? (int)$_GET['category']      : null;
    $active    = isset($_GET['active'])    ? (int)$_GET['active']         : null;
    $limit     = min((int)($_GET['limit']  ?? 50), 200);
    $offset    = max((int)($_GET['offset'] ?? 0),  0);

    $where  = [];
    $params = [];

    if ($search !== null) {
        $where[]  = '(p.name LIKE ? OR p.sku LIKE ?)';
        $params[] = $search;
        $params[] = $search;
    }
    if ($category !== null) { $where[] = 'p.category_id = ?'; $params[] = $category; }
    if ($active   !== null) { $where[] = 'p.active = ?';      $params[] = $active; }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $db->prepare("
        SELECT p.id, p.sku, p.name, p.slug, p.price_from, p.image_webp,
               p.min_quantity, p.customizable, p.featured, p.active,
               p.created_at, p.updated_at,
               c.name AS category_name,
               COALESCE((SELECT SUM(quantity) FROM stock WHERE product_id = p.id), 0) AS total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        {$whereSQL}
        ORDER BY p.updated_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ");
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    $countStmt = $db->prepare("SELECT COUNT(*) FROM products p {$whereSQL}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    jsonSuccess(['items' => $products, 'total' => $total]);
}

// ── POST: Crear ───────────────────────────────────────────────
function createAdminProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];

    $required = ['category_id', 'sku', 'name'];
    foreach ($required as $f) {
        if (empty($data[$f])) jsonError(422, "Campo requerido: {$f}");
    }

    $slug = makeSlug($data['name'], $db);

    $stmt = $db->prepare("
        INSERT INTO products
          (category_id, sku, name, slug, description, price_from, image_webp, min_quantity, customizable, featured, active)
        VALUES
          (:category_id, :sku, :name, :slug, :description, :price_from, :image_webp, :min_quantity, :customizable, :featured, 1)
    ");
    $stmt->execute([
        ':category_id'  => (int)$data['category_id'],
        ':sku'          => sanitize($data['sku']),
        ':name'         => sanitize($data['name']),
        ':slug'         => $slug,
        ':description'  => sanitize($data['description'] ?? ''),
        ':price_from'   => is_numeric($data['price_from'] ?? null) ? (float)$data['price_from'] : null,
        ':image_webp'   => sanitize($data['image_webp'] ?? ''),
        ':min_quantity' => (int)($data['min_quantity'] ?? 10),
        ':customizable' => (int)($data['customizable'] ?? 1),
        ':featured'     => (int)($data['featured'] ?? 0),
    ]);

    $productId = (int)$db->lastInsertId();

    // Guardar variantes de stock si se enviaron
    if (!empty($data['stock']) && is_array($data['stock'])) {
        saveStock($db, $productId, $data['stock']);
    } else {
        saveStock($db, $productId, [['variant' => 'Única', 'quantity' => (int)($data['stock_quantity'] ?? 0)]]);
    }

    jsonSuccess(['id' => $productId, 'slug' => $slug], 201);
}

// ── PUT: Actualizar ───────────────────────────────────────────
function updateAdminProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $stmt = $db->prepare("
        UPDATE products SET
          category_id  = :category_id,
          name         = :name,
          description  = :description,
          price_from   = :price_from,
          image_webp   = :image_webp,
          min_quantity = :min_quantity,
          customizable = :customizable,
          featured     = :featured,
          active       = :active
        WHERE id = :id
    ");
    $stmt->execute([
        ':category_id'  => (int)$data['category_id'],
        ':name'         => sanitize($data['name']),
        ':description'  => sanitize($data['description'] ?? ''),
        ':price_from'   => is_numeric($data['price_from'] ?? null) ? (float)$data['price_from'] : null,
        ':image_webp'   => sanitize($data['image_webp'] ?? ''),
        ':min_quantity' => (int)($data['min_quantity'] ?? 10),
        ':customizable' => (int)($data['customizable'] ?? 1),
        ':featured'     => (int)($data['featured'] ?? 0),
        ':active'       => (int)($data['active'] ?? 1),
        ':id'           => (int)$data['id'],
    ]);

    if (!empty($data['stock']) && is_array($data['stock'])) {
        saveStock($db, (int)$data['id'], $data['stock']);
    }

    jsonSuccess(['updated' => true]);
}

// ── DELETE: Soft delete ───────────────────────────────────────
function deleteAdminProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    // Borrado permanente
    $db->prepare("DELETE FROM products WHERE id = ?")
       ->execute([(int)$data['id']]);

    // También limpiar el stock asociado
    $db->prepare("DELETE FROM stock WHERE product_id = ?")
       ->execute([(int)$data['id']]);

    jsonSuccess(['deleted' => true]);
}

// ── Helpers ───────────────────────────────────────────────────
function saveStock(PDO $db, int $productId, array $variants): void {
    // Borrar variantes anteriores y reinsertar
    $db->prepare("DELETE FROM stock WHERE product_id = ?")
       ->execute([$productId]);

    $stmt = $db->prepare("INSERT INTO stock (product_id, variant, quantity) VALUES (?, ?, ?)");
    foreach ($variants as $v) {
        $stmt->execute([
            $productId,
            sanitize($v['variant'] ?? 'Única'),
            max(0, (int)($v['quantity'] ?? 0)),
        ]);
    }
}

function makeSlug(string $text, PDO $db): string {
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $text)), '-'));
    $base = $slug;
    $i    = 0;
    do {
        $s    = $i ? "{$base}-{$i}" : $base;
        $stmt = $db->prepare("SELECT COUNT(*) FROM products WHERE slug = ?");
        $stmt->execute([$s]);
        $exists = (int)$stmt->fetchColumn() > 0;
        $i++;
    } while ($exists);
    return $s;
}
