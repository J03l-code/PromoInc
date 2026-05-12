<?php
/**
 * PromoInc — API Admin: Logos de Marcas (protegida)
 * GET    /api/admin_brand_logos.php            → Listado
 * POST   /api/admin_brand_logos.php            → Crear
 * DELETE /api/admin_brand_logos.php            → Eliminar
 */

require_once 'middleware.php';
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    
        if (isset($_GET['id'])) getBrandLogo($db, (int)$_GET['id']);
        else getBrandLogos($db);    
        break;
    case 'POST':
        $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['_method'] ?? 'POST';
        if ($action === 'DELETE') deleteBrandLogo($db);
        elseif ($action === 'PUT') updateBrandLogo($db);
        else createBrandLogo($db);
        break;
    case 'PUT':    updateBrandLogo($db); break;
    case 'DELETE': deleteBrandLogo($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

function getBrandLogos(PDO $db): void {
    try {
        $stmt = $db->query("SELECT * FROM brand_logos ORDER BY sort_order ASC, id DESC");
        jsonSuccess($stmt->fetchAll());
    } catch (PDOException $e) {
        // Si la tabla no existe, intentamos crearla
        if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "no such table") !== false) {
            $db->exec("CREATE TABLE IF NOT EXISTS brand_logos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                filename VARCHAR(255) NOT NULL,
                sort_order INT DEFAULT 0,
                active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            jsonSuccess([]);
        }
        jsonError(500, 'Error en BD: ' . $e->getMessage());
    }
}

function createBrandLogo(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    
    if (empty($data['name'])) jsonError(422, 'El nombre es requerido');
    if (empty($data['filename'])) jsonError(422, 'La imagen es requerida');

    $stmt = $db->prepare("
        INSERT INTO brand_logos (name, filename, sort_order, active)
        VALUES (:name, :filename, :sort_order, 1)
    ");
    $stmt->execute([
        ':name'       => sanitize($data['name']),
        ':filename'   => sanitize($data['filename']),
        ':sort_order' => (int)($data['sort_order'] ?? 0),
    ]);

    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

function deleteBrandLogo(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $stmt = $db->prepare("DELETE FROM brand_logos WHERE id = ?");
    $stmt->execute([(int)$data['id']]);

    jsonSuccess(['deleted' => true]);
}

function getBrandLogo(PDO $db, int $id): void {
    $stmt = $db->prepare("SELECT * FROM brand_logos WHERE id = ?");
    $stmt->execute([$id]);
    $brand = $stmt->fetch();
    if (!$brand) jsonError(404, 'Marca no encontrada');
    jsonSuccess($brand);
}

function updateBrandLogo(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');
    if (empty($data['name'])) jsonError(422, 'El nombre es requerido');
    if (empty($data['filename'])) jsonError(422, 'La imagen es requerida');

    $stmt = $db->prepare("
        UPDATE brand_logos 
        SET name = :name, filename = :filename, sort_order = :sort_order 
        WHERE id = :id
    ");
    $stmt->execute([
        ':name'       => sanitize($data['name']),
        ':filename'   => sanitize($data['filename']),
        ':sort_order' => (int)($data['sort_order'] ?? 0),
        ':id'         => (int)$data['id']
    ]);

    jsonSuccess(['updated' => true]);
}
