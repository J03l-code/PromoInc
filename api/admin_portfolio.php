<?php
/**
 * PromoInk — API Admin: Portafolio de trabajos (protegida)
 * GET    /api/admin_portfolio.php            → Listado
 * POST   /api/admin_portfolio.php            → Crear
 * DELETE /api/admin_portfolio.php            → Eliminar
 */

require_once 'middleware.php';
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    
        if (isset($_GET['id'])) getPortfolioItem($db, (int)$_GET['id']);
        else getPortfolioItems($db);    
        break;
    case 'POST':
        $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['_method'] ?? 'POST';
        if ($action === 'DELETE') deletePortfolioItem($db);
        elseif ($action === 'PUT') updatePortfolioItem($db);
        else createPortfolioItem($db);
        break;
    case 'PUT':    updatePortfolioItem($db); break;
    case 'DELETE': deletePortfolioItem($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

function getPortfolioItems(PDO $db): void {
    try {
        $stmt = $db->query("SELECT * FROM portfolio ORDER BY sort_order ASC, id DESC");
        jsonSuccess($stmt->fetchAll());
    } catch (PDOException $e) {
        jsonError(500, 'Error en BD: ' . $e->getMessage());
    }
}

function createPortfolioItem(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    
    if (empty($data['title'])) jsonError(422, 'El título es requerido');
    if (empty($data['filename'])) jsonError(422, 'La imagen es requerida');

    $stmt = $db->prepare("
        INSERT INTO portfolio (title, description, filename, sort_order)
        VALUES (:title, :description, :filename, :sort_order)
    ");
    $stmt->execute([
        ':title'       => sanitize($data['title']),
        ':description' => isset($data['description']) ? sanitize($data['description']) : null,
        ':filename'   => sanitize($data['filename']),
        ':sort_order' => (int)($data['sort_order'] ?? 0),
    ]);

    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

function deletePortfolioItem(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $stmt = $db->prepare("DELETE FROM portfolio WHERE id = ?");
    $stmt->execute([(int)$data['id']]);

    jsonSuccess(['deleted' => true]);
}

function getPortfolioItem(PDO $db, int $id): void {
    $stmt = $db->prepare("SELECT * FROM portfolio WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) jsonError(404, 'Trabajo no encontrado');
    jsonSuccess($item);
}

function updatePortfolioItem(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');
    if (empty($data['title'])) jsonError(422, 'El título es requerido');
    if (empty($data['filename'])) jsonError(422, 'La imagen es requerida');

    $stmt = $db->prepare("
        UPDATE portfolio 
        SET title = :title, description = :description, filename = :filename, sort_order = :sort_order 
        WHERE id = :id
    ");
    $stmt->execute([
        ':title'       => sanitize($data['title']),
        ':description' => isset($data['description']) ? sanitize($data['description']) : null,
        ':filename'   => sanitize($data['filename']),
        ':sort_order' => (int)($data['sort_order'] ?? 0),
        ':id'         => (int)$data['id']
    ]);

    jsonSuccess(['updated' => true]);
}
