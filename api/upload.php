<?php
/**
 * PromoInc — API Upload con conversión WebP nativa
 * Convierte PNG/JPG/GIF → WebP usando PHP GD (sin dependencias externas)
 * POST /api/upload.php   multipart/form-data  field: "image"
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError(405, 'Solo se permiten peticiones POST');
}

if (empty($_FILES['image'])) {
    jsonError(400, 'No se recibió ninguna imagen');
}

$file    = $_FILES['image'];
$tmpPath = $file['tmp_name'];
$origExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

// ── Validaciones ──────────────────────────────────────────────
if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonError(422, 'Error al subir el archivo: código ' . $file['error']);
}

if ($file['size'] > MAX_FILE_SIZE) {
    jsonError(413, 'El archivo supera el límite de 5 MB');
}

$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($origExt, $allowed)) {
    jsonError(415, 'Formato no soportado. Use JPG, PNG o WebP');
}

// ── Detectar tipo real con finfo ──────────────────────────────
$mime = mime_content_type($tmpPath);
$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($mime, $allowedMimes)) {
    jsonError(415, 'Tipo MIME no válido');
}

// ── Conversión a WebP ─────────────────────────────────────────
$srcImage = null;
switch ($mime) {
    case 'image/jpeg': $srcImage = imagecreatefromjpeg($tmpPath); break;
    case 'image/png':  $srcImage = imagecreatefrompng($tmpPath);  break;
    case 'image/gif':  $srcImage = imagecreatefromgif($tmpPath);  break;
    case 'image/webp': $srcImage = imagecreatefromwebp($tmpPath); break;
}

if (!$srcImage) {
    jsonError(500, 'No se pudo procesar la imagen');
}

// Para PNG con transparencia
$width  = imagesx($srcImage);
$height = imagesy($srcImage);
$output = imagecreatetruecolor($width, $height);
imagealphablending($output, false);
imagesavealpha($output, true);
$transparent = imagecolorallocatealpha($output, 0, 0, 0, 127);
imagefilledrectangle($output, 0, 0, $width, $height, $transparent);
imagecopy($output, $srcImage, 0, 0, 0, 0, $width, $height);

// ── Guardar WebP ──────────────────────────────────────────────
$folder   = UPLOAD_DIR;
if (!is_dir($folder)) mkdir($folder, 0755, true);

$filename = uniqid('img_', true) . '.webp';
$destPath = $folder . $filename;

if (!imagewebp($output, $destPath, WEBP_QUALITY)) {
    jsonError(500, 'Error al guardar imagen WebP');
}

imagedestroy($srcImage);
imagedestroy($output);

jsonSuccess([
    'filename'  => $filename,
    'path'      => 'assets/images/' . $filename,
    'url'       => '/assets/images/' . $filename,
    'size_bytes'=> filesize($destPath),
    'width'     => $width,
    'height'    => $height,
]);
