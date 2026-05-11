<?php
require_once __DIR__ . '/config.php';

// Crear tabla de carrito si no existe
function ensureCartTable(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS cart_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_product (user_id, product_id),
        CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}



if (!isset($_SESSION['user_id'])) {
    jsonError(401, 'No autenticado');
}

$userId = (int)$_SESSION['user_id'];
$db = getDB();
ensureCartTable($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET — listar ítems del carrito
if ($method === 'GET') {
    $stmt = $db->prepare("
        SELECT ci.id, ci.product_id, ci.quantity, ci.unit_price,
               p.name, p.image_webp, p.sku, p.min_quantity
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
        ORDER BY ci.updated_at DESC
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();
    jsonSuccess($items);
}

// POST — agregar o actualizar ítem
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];

    if (empty($data['product_id']) || empty($data['quantity'])) {
        jsonError(400, 'Datos incompletos: product_id y quantity requeridos');
    }

    $productId = (int)$data['product_id'];
    $qty = (int)$data['quantity'];
    $unitPrice = round((float)($data['unit_price'] ?? 0), 2);

    if ($qty < 1) {
        jsonError(400, 'La cantidad debe ser mayor a 0');
    }

    // Verificar que el producto exista
    $pStmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    $pStmt->execute([$productId]);
    if (!$pStmt->fetch()) {
        jsonError(404, 'Producto no encontrado');
    }

    // UPSERT
    $stmt = $db->prepare("
        INSERT INTO cart_items (user_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), unit_price = VALUES(unit_price), updated_at = NOW()
    ");
    $stmt->execute([$userId, $productId, $qty, $unitPrice]);

    jsonSuccess(['message' => 'Producto guardado en tu carrito']);
}

// DELETE — eliminar ítem específico o limpiar todo
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];

    if (isset($data['product_id'])) {
        $stmt = $db->prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, (int)$data['product_id']]);
        jsonSuccess(['message' => 'Ítem eliminado del carrito']);
    } else {
        $stmt = $db->prepare("DELETE FROM cart_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        jsonSuccess(['message' => 'Carrito vaciado']);
    }
}

jsonError(405, 'Método no permitido');
