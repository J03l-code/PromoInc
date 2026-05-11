<?php
require_once __DIR__ . '/config.php';



if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError(405, 'Método no permitido');
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
if (empty($data['credential'])) {
    jsonError(400, 'Token de Google no recibido');
}

$jwt = $data['credential'];

// Decodificar el JWT sin validación estricta de firma por ahora (solo como demo)
// NOTA: Para producción, se debe usar la librería oficial de Google API de PHP
// para validar la firma del token con las claves públicas de Google.
$tokenParts = explode('.', $jwt);
if (count($tokenParts) !== 3) {
    jsonError(400, 'Token inválido');
}

$payload = json_decode(base64_decode($tokenParts[1]), true);

if (!$payload || empty($payload['email'])) {
    jsonError(400, 'Error al decodificar información de Google');
}

// Extraer info
$email = $payload['email'];
$name = $payload['name'] ?? 'Usuario Google';
$google_id = $payload['sub'] ?? '';

$db = getDB();

try {
    // Buscar si el usuario ya existe por correo
    $stmt = $db->prepare("SELECT id, name, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Crear nuevo usuario automáticamente
        // Contraseña dummy porque entra con Google
        $dummyPass = password_hash(bin2hex(random_bytes(10)), PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'client')");
        $stmt->execute([$name, $email, $dummyPass]);
        
        $userId = $db->lastInsertId();
        $userRole = 'client';
    } else {
        $userId = $user['id'];
        $userRole = $user['role'];
        $name = $user['name'];
        // Update last login
        $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$userId]);
    }
    
    // Iniciar sesión
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_role'] = $userRole;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_picture'] = $payload['picture'] ?? '';
    session_write_close();
    
    jsonSuccess(['message' => 'Autenticación con Google exitosa', 'user' => ['name' => $name]]);
} catch (PDOException $e) {
    jsonError(500, 'Error de base de datos: ' . $e->getMessage());
}
