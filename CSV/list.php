<?php
$dir = __DIR__;
$files = array_values(array_filter(scandir($dir), function ($f) {
    return is_file($f) && strtolower(pathinfo($f, PATHINFO_EXTENSION)) === 'csv';
}));
header('Content-Type: application/json');
echo json_encode($files);
