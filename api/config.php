<?php
/**
 * PromoInc — Configuración central de la API
 * Conexión PDO + CORS + Utilidades
 */

// ── Inicialización de Sesión Global ───────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 28800,
        'path' => '/',
        'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'u434851126_promoincec');
define('DB_USER', 'u434851126_promoinc_u');        // Cambiar en producción
define('DB_PASS', 'Promoinc2026!');            // Cambiar en producción
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/../assets/images/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
define('WEBP_QUALITY', 85);

// ── CORS (ajustar en producción al dominio real) ──────────────
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

// ── Método Overriding (Emulación de PUT/DELETE vía POST) ──────
// El admin.js envía { _method: 'PUT' } dentro del JSON vía POST.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $inputData = json_decode($rawInput, true);
    if (isset($inputData['_method'])) {
        $emulated = strtoupper($inputData['_method']);
        if (in_array($emulated, ['PUT', 'DELETE'])) {
            $_SERVER['REQUEST_METHOD'] = $emulated;
            // Guardamos el input decodificado para evitar re-decodificarlo en los controllers
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
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
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
