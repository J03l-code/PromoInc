<?php
require_once __DIR__ . '/config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    jsonError(401, 'No autenticado');
}

$userId = $_SESSION['user_id'];
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare("SELECT id, filename, created_at FROM user_logos WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $logos = $stmt->fetchAll();
    jsonSuccess(['logos' => $logos]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
        jsonError(400, 'Error al subir el archivo');
    }
    
    $file = $_FILES['logo'];
    
    if ($file['size'] > 2 * 1024 * 1024) {
        jsonError(400, 'El archivo es demasiado grande (máx 2MB)');
    }
    
    $allowedTypes = ['image/png', 'image/svg+xml'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        jsonError(400, 'Solo se permiten archivos PNG y SVG');
    }
    
    $ext = ($mimeType === 'image/svg+xml') ? 'svg' : 'png';
    $filename = 'logo_' . $userId . '_' . time() . '.' . $ext;
    $dest = __DIR__ . '/../assets/images/user_logos/' . $filename;
    
    // Ensure directory exists
    if (!is_dir(__DIR__ . '/../assets/images/user_logos')) {
        mkdir(__DIR__ . '/../assets/images/user_logos', 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $dest)) {
        $stmt = $db->prepare("INSERT INTO user_logos (user_id, filename) VALUES (?, ?)");
        $stmt->execute([$userId, $filename]);
        jsonSuccess(['message' => 'Logo subido correctamente', 'filename' => $filename]);
    } else {
        jsonError(500, 'Error al guardar el archivo');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) {
        jsonError(400, 'ID de logo requerido');
    }
    
    $stmt = $db->prepare("SELECT filename FROM user_logos WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['id'], $userId]);
    $logo = $stmt->fetch();
    
    if ($logo) {
        $path = __DIR__ . '/../assets/images/user_logos/' . $logo['filename'];
        if (file_exists($path)) {
            unlink($path);
        }
        $db->prepare("DELETE FROM user_logos WHERE id = ?")->execute([$data['id']]);
        jsonSuccess(['message' => 'Logo eliminado']);
    } else {
        jsonError(404, 'Logo no encontrado');
    }
}

jsonError(400, 'Método no soportado');
