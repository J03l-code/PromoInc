<?php
require_once __DIR__ . '/config.php';



$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    
    if ($action === 'register') {
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            jsonError(400, 'Todos los campos son obligatorios');
        }
        
        $db = getDB();
        // Check if email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            jsonError(400, 'El correo ya está registrado');
        }
        
        // Register user
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'client')");
        if ($stmt->execute([sanitize($data['name']), sanitize($data['email']), $hash])) {
            $userId = $db->lastInsertId();
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_role'] = 'client';
            $_SESSION['user_name'] = $data['name'];
            jsonSuccess(['message' => 'Registro exitoso', 'user' => ['name' => $data['name']]]);
        } else {
            jsonError(500, 'Error al registrar el usuario');
        }
    }
    
    if ($action === 'login') {
        if (empty($data['email']) || empty($data['password'])) {
            jsonError(400, 'Correo y contraseña requeridos');
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT id, name, password_hash, role FROM users WHERE email = ? AND active = 1");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($data['password'], $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_name'] = $user['name'];
            
            // Update last login
            $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);
            
            jsonSuccess(['message' => 'Login exitoso', 'user' => ['name' => $user['name'], 'role' => $user['role']]]);
        } else {
            jsonError(401, 'Credenciales incorrectas');
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'logout') {
        session_destroy();
        jsonSuccess(['message' => 'Sesión cerrada']);
    }
    
    if ($action === 'me') {
        if (isset($_SESSION['user_id'])) {
            $db = getDB();
            $stmt = $db->prepare("SELECT id, name, email, role, last_login FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $u = $stmt->fetch();
            if ($u) {
                jsonSuccess(['user' => [
                    'name' => $u['name'],
                    'email' => $u['email'],
                    'role' => $u['role'],
                    'last_login' => $u['last_login']
                ]]);
            }
        }
        jsonError(401, 'No autenticado');
    }
}

jsonError(400, 'Acción no válida');
