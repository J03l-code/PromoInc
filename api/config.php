<?php
/**
 * PromoInc — Configuración central de la API
 * Conexión PDO + CORS + Utilidades
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'u434851126_promoincdb');
define('DB_USER', 'u434851126_promoinc_usr');        // Cambiar en producción
define('DB_PASS', 'Promoinc2026!');            // Cambiar en producción
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/../assets/images/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
define('WEBP_QUALITY', 85);

// ── CORS (ajustar en producción al dominio real) ──────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
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
            
            // Auto-crear tabla product_prices si no existe para evitar fallos de guardado
            $pdo->exec("CREATE TABLE IF NOT EXISTS product_prices (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id INT UNSIGNED NOT NULL,
                min_qty INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

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
