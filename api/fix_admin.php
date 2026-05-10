<?php
/**
 * Script de emergencia para resetear la contraseña del administrador
 */
require_once 'config.php';

try {
    $db = getDB();
    $email = 'admin@promoinc.com';
    $newPassword = 'Admin2024!';
    $hash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Verificar si existe
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $db->prepare("UPDATE users SET password_hash = ?, active = 1 WHERE id = ?")
           ->execute([$hash, $user['id']]);
        echo "<h1>¡Éxito!</h1><p>La contraseña para <strong>$email</strong> ha sido actualizada a: <strong>$newPassword</strong></p>";
    } else {
        $db->prepare("INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)")
           ->execute(['Administrador', $email, $hash, 'superadmin', 1]);
        echo "<h1>¡Éxito!</h1><p>El usuario <strong>$email</strong> no existía y ha sido creado con la contraseña: <strong>$newPassword</strong></p>";
    }
    
    echo "<br><p style='color:red'><strong>IMPORTANTE:</strong> Por seguridad, elimina este archivo (api/fix_admin.php) de tu servidor después de usarlo.</p>";
    echo "<br><a href='../admin/login.html'>Ir al Login</a>";

} catch (Exception $e) {
    echo "<h1>Error</h1><p>" . $e->getMessage() . "</p>";
}
