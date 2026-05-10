<?php
/**
 * PromoInc — API Productos
 * GET    /api/products.php            → Listado con filtros
 * GET    /api/products.php?id=X       → Detalle de producto
 * GET    /api/products.php?featured=1 → Productos destacados
 * POST   /api/products.php            → Crear (admin)
 * PUT    /api/products.php            → Actualizar (admin)
 * DELETE /api/products.php            → Eliminar (admin)
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':
        getProducts($db);
        break;
    case 'POST':
        createProduct($db);
        break;
    case 'PUT':
        updateProduct($db);
        break;
    case 'DELETE':
        deleteProduct($db);
        break;
    default:
        jsonError(405, 'Método no permitido');
}

// ── GET: Listar/Filtrar ───────────────────────────────────────
function getProducts(PDO $db): void {
    // Detalle por ID
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT p.*, c.name AS category_name,
                   COALESCE(SUM(s.quantity), 0) AS total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN stock s ON s.product_id = p.id
            WHERE p.id = ? AND p.active = 1
            GROUP BY p.id
        ");
        $stmt->execute([(int)$_GET['id']]);
        $product = $stmt->fetch();
        if (!$product) jsonError(404, 'Producto no encontrado');

        // Variantes de stock
        $stmtStock = $db->prepare("SELECT variant, quantity FROM stock WHERE product_id = ? ORDER BY variant");
        $stmtStock->execute([$product['id']]);
        $product['variants'] = $stmtStock->fetchAll();

        jsonSuccess($product);
    }

    // Construcción dinámica del query
    $where  = ['p.active = 1'];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[]  = 'p.category_id = ?';
        $params[] = (int)$_GET['category'];
    }

    if (!empty($_GET['featured'])) {
        $where[]  = 'p.featured = 1';
    }

    if (!empty($_GET['search'])) {
        $where[]  = 'MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)';
        $params[] = sanitize($_GET['search']) . '*';
    }

    if (!empty($_GET['in_stock'])) {
        $where[] = '(SELECT COALESCE(SUM(quantity),0) FROM stock WHERE product_id = p.id) > 0';
    }

    $limit  = min((int)($_GET['limit']  ?? 12), 100);
    $offset = max((int)($_GET['offset'] ?? 0),  0);
    $sort   = in_array($_GET['sort'] ?? '', ['name','price_from','created_at']) ? $_GET['sort'] : 'featured';
    $dir    = ($_GET['dir'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

    $whereSQL = implode(' AND ', $where);

    $stmt = $db->prepare("
        SELECT p.id, p.sku, p.name, p.slug, p.price_from, p.image_webp,
               p.min_quantity, p.customizable, p.featured,
               c.name AS category_name,
               COALESCE(SUM(s.quantity), 0) AS total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN stock s ON s.product_id = p.id
        WHERE {$whereSQL}
        GROUP BY p.id
        ORDER BY p.{$sort} {$dir}
        LIMIT {$limit} OFFSET {$offset}
    ");
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Total sin paginación
    $countStmt = $db->prepare("SELECT COUNT(DISTINCT p.id) FROM products p WHERE {$whereSQL}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    jsonSuccess(['items' => $products, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
}

// ── POST: Crear Producto ──────────────────────────────────────
function createProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonError(400, 'Datos inválidos');

    $required = ['category_id','sku','name','slug'];
    foreach ($required as $field) {
        if (empty($data[$field])) jsonError(422, "Campo requerido: {$field}");
    }

    $stmt = $db->prepare("
        INSERT INTO products (category_id, sku, name, slug, description, price_from, image_webp, min_quantity, customizable, featured)
        VALUES (:category_id, :sku, :name, :slug, :description, :price_from, :image_webp, :min_quantity, :customizable, :featured)
    ");
    $stmt->execute([
        ':category_id'  => (int)$data['category_id'],
        ':sku'          => sanitize($data['sku']),
        ':name'         => sanitize($data['name']),
        ':slug'         => sanitize($data['slug']),
        ':description'  => sanitize($data['description'] ?? ''),
        ':price_from'   => $data['price_from'] ?? null,
        ':image_webp'   => sanitize($data['image_webp'] ?? ''),
        ':min_quantity' => (int)($data['min_quantity'] ?? 10),
        ':customizable' => (int)($data['customizable'] ?? 1),
        ':featured'     => (int)($data['featured'] ?? 0),
    ]);

    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

// ── PUT: Actualizar Producto ──────────────────────────────────
function updateProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true);
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
        ':price_from'   => $data['price_from'] ?? null,
        ':image_webp'   => sanitize($data['image_webp'] ?? ''),
        ':min_quantity' => (int)($data['min_quantity'] ?? 10),
        ':customizable' => (int)($data['customizable'] ?? 1),
        ':featured'     => (int)($data['featured'] ?? 0),
        ':active'       => (int)($data['active'] ?? 1),
        ':id'           => (int)$data['id'],
    ]);

    jsonSuccess(['updated' => true]);
}

// ── DELETE: Eliminar Producto ─────────────────────────────────
function deleteProduct(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $stmt = $db->prepare("UPDATE products SET active = 0 WHERE id = ?");
    $stmt->execute([(int)$data['id']]);

    jsonSuccess(['deleted' => true]);
}
