<?php
/**
 * One-time script: Update WhatsApp number in settings table.
 * Run once via browser: https://yourdomain.com/update_wa.php
 * DELETE this file after running it.
 */
require_once 'api/config.php';
$db = getDB();
$stmt = $db->prepare("INSERT INTO settings (`key`, `value`) VALUES ('whatsapp_number', '593987827215') ON DUPLICATE KEY UPDATE `value` = '593987827215'");
$stmt->execute();
echo '<h2 style="font-family:sans-serif;color:green">✅ WhatsApp actualizado a 593987827215</h2>';
echo '<p style="font-family:sans-serif">Elimina este archivo del servidor después de ejecutarlo.</p>';
