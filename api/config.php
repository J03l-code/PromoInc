<?php
/**
 * PromoInk — Configuración central de la API
 * Conexión PDO + CORS + Utilidades
 */

// ── Inicialización de Sesión Global ───────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) === 'on')
        $isSecure = true;
    elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        $isSecure = true;

    session_set_cookie_params([
        'lifetime' => 28800,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
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
define('DB_NAME', 'u434851126_promoink');
define('DB_USER', 'u434851126_promoink_usr');
define('DB_PASS', 'Promoink2026!');
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
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            // Corrección proactiva de typo común en correo de configuración para evitar rebotes de SMTP
            try {
                $pdo->exec("UPDATE settings SET `value` = 'info@promocionalespromoink.com' WHERE `key` = 'site_email' AND (LOWER(TRIM(`value`)) = 'info@promocionalesink.com' OR LOWER(TRIM(`value`)) = 'info@promocionalesink.com/')");
            } catch (\Exception $ex) {}
            // Crear columna show_in_sidebar automáticamente si no existe para evitar fallas
            try {
                $pdo->exec("ALTER TABLE categories ADD COLUMN show_in_sidebar TINYINT(1) NOT NULL DEFAULT 1 AFTER active");
            } catch (\Exception $ex) {}
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
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function jsonError(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function sanitize(string $input): string
{
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Envía un correo HTML profesional vía SMTP seguro (Hostinger)
 * Sin dependencias externas
 */
function sendSMTP(string $to, string $subject, string $htmlContent, string $replyTo = ''): bool
{
    $smtpHost = 'smtp.hostinger.com';
    $smtpPort = 465;
    $smtpUser = 'info@promocionalespromoink.com';
    $smtpPass = '26072023Dyv!'; // Actualizada con la contraseña correcta (Promoink2026!)

    // Cabeceras MIME para HTML en UTF-8
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: PromoInk <" . $smtpUser . ">\r\n";
    if (!empty($replyTo)) {
        $headers .= "Reply-To: <" . $replyTo . ">\r\n";
    }
    $headers .= "To: <" . $to . ">\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "Message-ID: <" . uniqid('', true) . "@" . ($_SERVER['HTTP_HOST'] ?? 'promoink.ec') . ">\r\n";

    $body = $headers . "\r\n" . $htmlContent;

    // Conectar vía SSL
    $socket = @fsockopen("ssl://" . $smtpHost, $smtpPort, $errno, $errstr, 10);
    if (!$socket) {
        $err = "SMTP Connection Error: $errstr ($errno)";
        error_log($err);
        $GLOBALS['SMTP_LAST_ERROR'] = $err;
        return false;
    }

    $read = function ($socket) {
        $res = "";
        while ($str = fgets($socket, 515)) {
            $res .= $str;
            if (substr($str, 3, 1) === " ")
                break;
        }
        return $res;
    };

    $send = function ($socket, $cmd, $expectedCode) use ($read) {
        fputs($socket, $cmd . "\r\n");
        $response = $read($socket);
        $code = (int) substr($response, 0, 3);
        if ($code !== $expectedCode) {
            throw new \Exception("SMTP Command failed: '$cmd' -> Expected $expectedCode, got: " . trim($response));
        }
        return $response;
    };

    try {
        $greet = $read($socket); // 220
        if ((int) substr($greet, 0, 3) !== 220) {
            throw new \Exception("Invalid greeting: " . trim($greet));
        }

        $send($socket, "EHLO " . ($_SERVER['HTTP_HOST'] ?? 'localhost'), 250);
        $send($socket, "AUTH LOGIN", 334);
        $send($socket, base64_encode($smtpUser), 334);
        $send($socket, base64_encode($smtpPass), 235);

        $send($socket, "MAIL FROM:<" . $smtpUser . ">", 250);
        $send($socket, "RCPT TO:<" . $to . ">", 250);
        $send($socket, "DATA", 354);

        fputs($socket, $body . "\r\n.\r\n");
        $dataResponse = $read($socket); // 250
        if ((int) substr($dataResponse, 0, 3) !== 250) {
            throw new \Exception("Data transfer failed: " . trim($dataResponse));
        }

        $send($socket, "QUIT", 221);
        fclose($socket);
        return true;
    } catch (\Throwable $e) {
        error_log("SMTP Error: " . $e->getMessage());
        $GLOBALS['SMTP_LAST_ERROR'] = $e->getMessage();
        @fclose($socket);
        return false;
    }
}
