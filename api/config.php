<?php
/**
 * PromoInc — Configuración central de la API
 * Conexión PDO + CORS + Utilidades
 */

// ── Inicialización de Sesión Global ───────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) === 'on') $isSecure = true;
    elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') $isSecure = true;

    session_set_cookie_params([
        'lifetime' => 28800,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    // ⚡ CRÍTICO: Liberar el bloqueo de sesión INMEDIATAMENTE.
    // Sin esto, las múltiples peticiones paralelas del frontend (carrito,
    // ajustes de WA, datos de usuario) quedan en cola esperando que
    // la sesión se libere, causando el error 504 Gateway Timeout.
    // Los endpoints que ESCRIBEN en $_SESSION (login, logout) reabren
    // la sesión ellos mismos con session_start().
    session_write_close();
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'u434851126_promoincec');
define('DB_USER', 'u434851126_promoinc_u');
define('DB_PASS', 'Promoinc2026!');
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/../assets/images/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
define('WEBP_QUALITY', 85);

// ── CORS ──────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!$origin && isset($_SERVER['HTTP_HOST'])) {
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $origin = "$protocol://" . $_SERVER['HTTP_HOST'];
}
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Método Overriding ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $inputData = json_decode($rawInput, true);
    if (isset($inputData['_method'])) {
        $emulated = strtoupper($inputData['_method']);
        if (in_array($emulated, ['PUT', 'DELETE'])) {
            $_SERVER['REQUEST_METHOD'] = $emulated;
            $GLOBALS['_POST_JSON'] = $inputData;
        }
    }
}

// ── Conexión PDO ──────────────────────────────────────────────
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            jsonError(500, 'Error de conexión a la BD: ' . $e->getMessage());
        }
    }
    return $pdo;
}

// ── Helpers de respuesta ──────────────────────────────────────
function jsonSuccess(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize(string $input): string
{
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}
