<?php
/**
 * PromoInc — API Categorías
 * GET /api/categories.php         → Árbol completo
 * GET /api/categories.php?flat=1  → Lista plana para selects
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(405, 'Método no permitido');
}

$db = getDB();

$stmt = $db->query("
    SELECT id, parent_id, name, slug, icon, sort_order
    FROM categories
    WHERE active = 1
    ORDER BY sort_order ASC, name ASC
");
$rows = $stmt->fetchAll();

// Lista plana (para dropdowns admin)
if (!empty($_GET['flat'])) {
    jsonSuccess($rows);
}

// Árbol anidado
$tree = buildTree($rows);
jsonSuccess($tree);

function buildTree(array $rows, int $parentId = 0): array {
    $branch = [];
    foreach ($rows as $row) {
        if ((int)$row['parent_id'] === $parentId) {
            $children = buildTree($rows, (int)$row['id']);
            if ($children) $row['children'] = $children;
            $branch[] = $row;
        }
    }
    return $branch;
}
