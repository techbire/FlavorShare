<?php
// api/recipe_detail.php - Single recipe details API
require_once '../config/database.php';
require_once '../utils/functions.php';

// Get recipe ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid recipe ID']);
    exit;
}

$conn = connectDB();

// Get recipe details with joins to get category and author names
$query = "SELECT r.*, c.name as category, u.name as author, 
          (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as reviews,
          (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as rating
          FROM recipes r
          JOIN categories c ON r.category_id = c.id
          JOIN users u ON r.user_id = u.id
          WHERE r.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $recipe = $result->fetch_assoc();
    
    // Format the rating to one decimal place
    if (isset($recipe['rating'])) {
        $recipe['rating'] = round($recipe['rating'] * 2) / 2; // Round to nearest 0.5
    } else {
        $recipe['rating'] = 0;
    }
    
    echo json_encode(['success' => true, 'recipe' => $recipe]);
} else {
    echo json_encode(['success' => false, 'message' => 'Recipe not found']);
}

$stmt->close();
$conn->close();
?>