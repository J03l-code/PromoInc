<?php
/**
 * PromoInc — API Admin: Usuarios (protegida – solo superadmin)
 * GET    /api/admin_users.php     → Listado
 * POST   /api/admin_users.php     → Crear usuario
 * PUT    /api/admin_users.php     → Actualizar (nombre, rol, activo, contraseña)
 * DELETE /api/admin_users.php     → Eliminar
 */

require_once 'middleware.php';
requireRole('superadmin');

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    getUsers($db);    break;
    case 'POST':   createUser($db);  break;
    case 'PUT':    updateUser($db);  break;
    case 'DELETE': deleteUser($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

function getUsers(PDO $db): void {
    $stmt = $db->query("SELECT id, name, email, role, active, last_login, created_at FROM users ORDER BY created_at DESC");
    jsonSuccess($stmt->fetchAll());
}

function createUser(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
        jsonError(422, 'Nombre, email y contraseña son requeridos');
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)");
    $stmt->execute([
        sanitize($data['name']),
        sanitize($data['email']),
        $hash,
        in_array($data['role'] ?? '', ['superadmin','admin','editor']) ? $data['role'] : 'editor',
    ]);
    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

function updateUser(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $sets = [];
    $params = [];

    if (!empty($data['name']))  { $sets[] = 'name = ?';   $params[] = sanitize($data['name']); }
    if (!empty($data['email'])) { $sets[] = 'email = ?';  $params[] = sanitize($data['email']); }
    if (!empty($data['role']))  { $sets[] = 'role = ?';   $params[] = $data['role']; }
    if (isset($data['active'])) { $sets[] = 'active = ?'; $params[] = (int)$data['active']; }
    if (!empty($data['password'])) {
        $sets[]   = 'password_hash = ?';
        $params[] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    }

    if (!$sets) jsonError(422, 'Nada que actualizar');

    $params[] = (int)$data['id'];
    $db->prepare("UPDATE users SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
    jsonSuccess(['updated' => true]);
}

function deleteUser(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    // No eliminar al propio usuario logueado
    if ((int)$data['id'] === (int)($_SESSION['user_id'] ?? 0)) {
        jsonError(409, 'No puedes eliminar tu propia cuenta');
    }
    $db->prepare("DELETE FROM users WHERE id = ?")->execute([(int)$data['id']]);
    jsonSuccess(['deleted' => true]);
}
