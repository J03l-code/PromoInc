<?php
/**
 * PromoInc — Middleware de autenticación para APIs admin.
 * Incluir ANTES de cualquier lógica en endpoints protegidos.
 */

require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 28800,
        'path'     => '/',
        'secure'   => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function requireAuth(): void {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No autenticado'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function requireRole(string ...$roles): void {
    requireAuth();
    if (!in_array($_SESSION['user_role'], $roles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Sin permisos suficientes'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function currentUser(): array {
    return [
        'id'    => $_SESSION['user_id']    ?? null,
        'name'  => $_SESSION['user_name']  ?? '',
        'email' => $_SESSION['user_email'] ?? '',
        'role'  => $_SESSION['user_role']  ?? '',
    ];
}
