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
    case 'GET':    getBrandLogos($db);    break;
    case 'POST':
        $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['_method'] ?? 'POST';
        if ($action === 'DELETE') deleteBrandLogo($db);
        else createBrandLogo($db);
        break;
    case 'DELETE': deleteBrandLogo($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

function getBrandLogos(PDO $db): void {
    $stmt = $db->query("SELECT * FROM brand_logos ORDER BY sort_order ASC, id DESC");
    jsonSuccess($stmt->fetchAll());
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
