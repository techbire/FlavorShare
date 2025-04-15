<?php
// api/categories.php - Categories API
require_once '../config/database.php';

// Get all categories
$conn = connectDB();

$query = "SELECT c.id, c.name, c.image, COUNT(r.id) as count 
          FROM categories c 
          LEFT JOIN recipes r ON c.id = r.category_id 
          GROUP BY c.id 
          ORDER BY c.name";

$result = $conn->query($query);
$categories = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
}

echo json_encode(['success' => true, 'categories' => $categories]);

$conn->close();
?>

