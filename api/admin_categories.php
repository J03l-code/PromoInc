<?php
/**
 * PromoInc — API Admin: Categorías (protegida)
 * GET    /api/admin_categories.php      → Listado
 * POST   /api/admin_categories.php      → Crear
 * PUT    /api/admin_categories.php      → Actualizar
 * DELETE /api/admin_categories.php      → Eliminar
 */

require_once 'middleware.php';
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    getCategories($db);    break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $data['_method'] ?? 'POST';
        if ($action === 'PUT') updateCategory($db);
        elseif ($action === 'DELETE') deleteCategory($db);
        else createCategory($db);
        break;
    case 'PUT':    updateCategory($db);   break;
    case 'DELETE': deleteCategory($db);   break;
    default:       jsonError(405, 'Método no permitido');
}

function getCategories(PDO $db): void {
    $stmt = $db->query("
        SELECT c.*, 
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active = 1) AS product_count
        FROM categories c
        ORDER BY c.sort_order, c.name
    ");
    jsonSuccess($stmt->fetchAll());
}

function createCategory(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['name'])) jsonError(422, 'Nombre requerido');

    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $data['name'])), '-'));

    $stmt = $db->prepare("INSERT INTO categories (parent_id, name, slug, icon, sort_order, active) VALUES (?,?,?,?,?,1)");
    $stmt->execute([
        (int)($data['parent_id'] ?? 0),
        sanitize($data['name']),
        $slug,
        sanitize($data['icon'] ?? ''),
        (int)($data['sort_order'] ?? 0),
    ]);
    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

function updateCategory(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $stmt = $db->prepare("
        UPDATE categories SET name = :name, icon = :icon, sort_order = :sort_order, active = :active
        WHERE id = :id
    ");
    $stmt->execute([
        ':name'       => sanitize($data['name']),
        ':icon'       => sanitize($data['icon'] ?? ''),
        ':sort_order' => (int)($data['sort_order'] ?? 0),
        ':active'     => (int)($data['active'] ?? 1),
        ':id'         => (int)$data['id'],
    ]);
    jsonSuccess(['updated' => true]);
}

function deleteCategory(PDO $db): void {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    // Verificar si tiene productos activos
    $count = $db->prepare("SELECT COUNT(*) FROM products WHERE category_id = ? AND active = 1");
    $count->execute([(int)$data['id']]);
    if ((int)$count->fetchColumn() > 0) {
        jsonError(409, 'La categoría tiene productos activos. Muévelos primero.');
    }

    // Borrado permanente
    $db->prepare("DELETE FROM categories WHERE id = ?")->execute([(int)$data['id']]);
    jsonSuccess(['deleted' => true]);
}
