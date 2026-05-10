<?php
/**
 * PromoInc — API Autenticación (Login / Logout / Check)
 * POST /api/auth.php           { action: 'login', email, password }
 * POST /api/auth.php           { action: 'logout' }
 * GET  /api/auth.php           → { loggedIn: bool, user: {...} }
 */

require_once 'config.php';

// Iniciar sesión PHP de forma segura
if (session_status() === PHP_SESSION_NONE) {
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;
    session_set_cookie_params([
        'lifetime' => 28800,       // 8 horas
        'path'     => '/',
        'secure'   => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',       // Lax es más compatible para redirecciones
    ]);
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Check de sesión activa
    if (!empty($_SESSION['user_id'])) {
        jsonSuccess([
            'loggedIn' => true,
            'user'     => [
                'id'    => $_SESSION['user_id'],
                'name'  => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'role'  => $_SESSION['user_role'],
            ],
        ]);
    }
    jsonSuccess(['loggedIn' => false]);
}

if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $data['action'] ?? '';

    // ── LOGIN ───────────────────────────────────────────────
    if ($action === 'login') {
        $email    = trim($data['email']    ?? '');
        $password = trim($data['password'] ?? '');

        if (!$email || !$password) {
            jsonError(422, 'Email y contraseña son requeridos');
        }

        $db   = getDB();
        $stmt = $db->prepare("SELECT id, name, email, password_hash, role, active FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !$user['active']) {
            // Mismo mensaje deliberado para no revelar si el email existe
            jsonError(401, 'Credenciales incorrectas');
        }

        if (!password_verify($password, $user['password_hash'])) {
            jsonError(401, 'Credenciales incorrectas');
        }

        // Actualizar last_login
        $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")
           ->execute([$user['id']]);

        // Crear sesión
        session_regenerate_id(true);
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['user_name']  = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role']  = $user['role'];

        jsonSuccess([
            'loggedIn' => true,
            'user'     => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);
    }

    // ── LOGOUT ──────────────────────────────────────────────
    if ($action === 'logout') {
        session_destroy();
        jsonSuccess(['loggedIn' => false]);
    }

    jsonError(400, 'Acción no reconocida');
}

jsonError(405, 'Método no permitido');
