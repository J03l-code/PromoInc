<?php
echo "<h1>PromoInc — Servidor Activo</h1>";
echo "<p>PHP está funcionando correctamente.</p>";
echo "<p>Ruta: " . __DIR__ . "</p>";
echo "<p>Fecha: " . date('Y-m-d H:i:s') . "</p>";
echo "<h2>Archivos en el directorio:</h2><ul>";
$files = scandir(__DIR__);
foreach($files as $file) {
    echo "<li>$file</li>";
}
echo "</ul>";
?>
