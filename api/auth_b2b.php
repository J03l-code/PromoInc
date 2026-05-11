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
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            jsonError(400, 'El correo ya está registrado');
        }

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'client')");
        if ($stmt->execute([sanitize($data['name']), sanitize($data['email']), $hash])) {
            $userId = $db->lastInsertId();
            // Re-open session to write (it was closed in config.php)
            session_start();
            $_SESSION['user_id']   = $userId;
            $_SESSION['user_role'] = 'client';
            $_SESSION['user_name'] = $data['name'];
            session_write_close();
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
            // Re-open session to write
            session_start();
            session_regenerate_id(true);
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_name'] = $user['name'];
            session_write_close();

            $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

            jsonSuccess(['message' => 'Login exitoso', 'user' => ['name' => $user['name'], 'role' => $user['role']]]);
        } else {
            jsonError(401, 'Credenciales incorrectas');
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'logout') {
        // Re-open session to destroy it
        session_start();
        session_unset();
        session_destroy();
        jsonSuccess(['message' => 'Sesión cerrada']);
    }

    if ($action === 'me') {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        // Session was already read and closed in config.php — $_SESSION is still readable
        if (empty($_SESSION['user_id'])) {
            jsonError(401, 'No autenticado');
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT id, name, email, role, last_login FROM users WHERE id = ? AND active = 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonError(401, 'Usuario no encontrado o inactivo');
        }

        jsonSuccess(['user' => $user]);
    }
}
