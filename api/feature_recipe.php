<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in to feature a recipe'
    ]);
    exit;
}

// Get the request body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['recipe_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Recipe ID is required'
    ]);
    exit;
}

// Connect to the database
$conn = connectDB();

// Check if the user owns this recipe
$stmt = $conn->prepare("SELECT user_id FROM recipes WHERE id = ?");
$stmt->bind_param("i", $data['recipe_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Recipe not found'
    ]);
    exit;
}

$recipe = $result->fetch_assoc();

// Check if user is owner
if ($recipe['user_id'] != $_SESSION['user_id']) {
    echo json_encode([
        'success' => false,
        'message' => 'You can only feature your own recipes'
    ]);
    exit;
}

// Mark recipe as featured
$stmt = $conn->prepare("UPDATE recipes SET featured = 1 WHERE id = ?");
$stmt->bind_param("i", $data['recipe_id']);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Recipe successfully featured'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to feature recipe: ' . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>