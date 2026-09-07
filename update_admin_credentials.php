<?php
/**
 * PromoInk — Script único para actualizar credenciales del administrador
 * ELIMINAR este archivo después de ejecutarlo.
 */
require_once 'api/config.php';

$newEmail    = 'admin@promoink.com';
$newPassword = 'Admin2026!';
$newHash     = password_hash($newPassword, PASSWORD_BCRYPT);

$db = getDB();

// Verificar si ya existe un admin o superadmin
$stmt = $db->query("SELECT id, email, role FROM users WHERE role IN ('admin', 'superadmin') OR email LIKE 'admin@%' ORDER BY id ASC");
$admins = $stmt->fetchAll();

if (!empty($admins)) {
    // Actualizar administradores existentes
    foreach ($admins as $admin) {
        $upd = $db->prepare("UPDATE users SET email = ?, password_hash = ?, active = 1 WHERE id = ?");
        $upd->execute([$newEmail, $newHash, $admin['id']]);
        echo "<h2 style='color:green;font-family:monospace;'>✅ Credenciales actualizadas correctamente (ID: {$admin['id']}).</h2>";
        echo "<p>Email anterior: <code>{$admin['email']}</code></p>";
        echo "<p>Rol: <code>{$admin['role']}</code></p>";
    }
    echo "<p>Email nuevo: <code>{$newEmail}</code></p>";
    echo "<p>Contraseña: <code>{$newPassword}</code></p>";
} else {
    // Crear admin si no existe
    $ins = $db->prepare("INSERT INTO users (name, email, password_hash, role, active) VALUES ('Administrador', ?, ?, 'admin', 1)");
    $ins->execute([$newEmail, $newHash]);
    echo "<h2 style='color:green;font-family:monospace;'>✅ Administrador creado correctamente.</h2>";
    echo "<p>Email: <code>{$newEmail}</code></p>";
    echo "<p>Contraseña: <code>{$newPassword}</code></p>";
}

echo "<hr><p style='color:red;font-weight:bold;'>⚠️ ELIMINA este archivo del servidor por seguridad.</p>";
?>
