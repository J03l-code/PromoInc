<?php
require_once 'api/config.php';

header('Content-Type: text/plain');
echo "SESSION DIAGNOSTIC\n";
echo "==================\n";
echo "Session ID: " . session_id() . "\n";
echo "Session Status: " . session_status() . " (1=none, 2=active)\n";
echo "User ID in Session: " . ($_SESSION['user_id'] ?? 'NONE') . "\n";
echo "User Name in Session: " . ($_SESSION['user_name'] ?? 'NONE') . "\n";
echo "User Role in Session: " . ($_SESSION['user_role'] ?? 'NONE') . "\n";
echo "\nSERVER INFO\n";
echo "-----------\n";
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'OFF') . "\n";
echo "X-Forwarded-Proto: " . ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? 'NONE') . "\n";
echo "Cookie: " . ($_SERVER['HTTP_COOKIE'] ?? 'NONE') . "\n";

echo "\nDATABASE INFO\n";
echo "-------------\n";
try {
    $db = getDB();
    echo "Connection: SUCCESS\n";
    if (isset($_SESSION['user_id'])) {
        $stmt = $db->prepare("SELECT id, name FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $u = $stmt->fetch();
        if ($u) {
            echo "User found in DB: YES (Name: " . $u['name'] . ")\n";
        } else {
            echo "User found in DB: NO (ID " . $_SESSION['user_id'] . " not in users table)\n";
        }
    }
} catch (Exception $e) {
    echo "Connection: FAILED (" . $e->getMessage() . ")\n";
}
?>
