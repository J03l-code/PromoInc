<?php
/**
 * PromoInc — API Cotización
 * POST /api/quote.php   Content-Type: application/json
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError(405, 'Método no permitido');
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) jsonError(400, 'JSON inválido');

// Validación
$required = ['company', 'contact_name', 'email'];
foreach ($required as $field) {
    if (empty($data[$field])) jsonError(422, "Campo requerido: {$field}");
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    jsonError(422, 'Email inválido');
}

$db = getDB();

try {
    $stmt = $db->prepare("
        INSERT INTO quotes (company, contact_name, email, phone, products_json, message)
        VALUES (:company, :contact_name, :email, :phone, :products_json, :message)
    ");

    $stmt->execute([
        ':company'       => sanitize($data['company']),
        ':contact_name'  => sanitize($data['contact_name']),
        ':email'         => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
        ':phone'         => sanitize($data['phone'] ?? ''),
        ':products_json' => json_encode($data['products'] ?? []),
        ':message'       => sanitize($data['message'] ?? ''),
    ]);

    $quoteId = (int)$db->lastInsertId();
} catch (\Throwable $e) {
    $code = $e->getCode();
    
    // Si es un error de PDO y es 42S02 (Table not found)
    if ($e instanceof PDOException && $code == '42S02') {
        $db->exec("CREATE TABLE IF NOT EXISTS quotes (
            id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            company      VARCHAR(255) NOT NULL,
            contact_name VARCHAR(255) NOT NULL,
            email        VARCHAR(255) NOT NULL,
            phone        VARCHAR(50),
            message      TEXT,
            products_json JSON,
            status       ENUM('new','read','responded','closed') DEFAULT 'new',
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        
        // Re-intentar la inserción ahora que la tabla existe
        $stmt->execute([
            ':company'       => sanitize((string)$data['company']),
            ':contact_name'  => sanitize((string)$data['contact_name']),
            ':email'         => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
            ':phone'         => sanitize((string)($data['phone'] ?? '')),
            ':products_json' => json_encode($data['products'] ?? []),
            ':message'       => sanitize((string)($data['message'] ?? '')),
        ]);
        $quoteId = (int)$db->lastInsertId();
    } 
    // Si es un error de PDO y es 42S22 (Column not found)
    else if ($e instanceof PDOException && $code == '42S22') {
        $stmt = $db->prepare("
            INSERT INTO quotes (company, contact_name, email, phone, message)
            VALUES (:company, :contact_name, :email, :phone, :message)
        ");
        $stmt->execute([
            ':company'       => sanitize((string)$data['company']),
            ':contact_name'  => sanitize((string)$data['contact_name']),
            ':email'         => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
            ':phone'         => sanitize((string)($data['phone'] ?? '')),
            ':message'       => sanitize((string)($data['message'] ?? '')),
        ]);
        $quoteId = (int)$db->lastInsertId();
    } else {
        // Enviar el error real al cliente para debug
        jsonError(500, "Error Interno: " . $e->getMessage() . " en la linea " . $e->getLine());
    }
}

// Envío de email (opcional — requiere configuración SMTP)
// sendQuoteEmail($data, $quoteId);

jsonSuccess([
    'quote_id' => $quoteId,
    'message'  => '¡Cotización recibida! Te contactaremos en menos de 24 horas.',
], 201);

function sendQuoteEmail(array $data, int $id): void {
    $to      = 'ventas@promoinc.ec'; // Cambiar al email corporativo
    $subject = "Nueva Cotización #{$id} - {$data['company']}";
    $body    = "Empresa: {$data['company']}\nContacto: {$data['contact_name']}\nEmail: {$data['email']}\nMensaje: {$data['message']}";
    $headers = 'From: noreply@promoinc.ec';
    mail($to, $subject, $body, $headers);
}
