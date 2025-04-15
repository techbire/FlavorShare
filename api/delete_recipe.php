<?php
// api/delete_recipe.php - Delete recipe API
require_once '../config/database.php';
require_once '../utils/functions.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Please login to delete recipes']);
    exit;
}

// Get the POST data
$postData = json_decode(file_get_contents('php://input'), true);
$recipeId = isset($postData['recipe_id']) ? (int)$postData['recipe_id'] : 0;
$userId = $_SESSION['user_id'];

// Validate data
if ($recipeId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid recipe ID']);
    exit;
}

$conn = connectDB();

// Check if the user is the author or an admin
$stmt = $conn->prepare("SELECT user_id FROM recipes WHERE id = ?");
$stmt->bind_param("i", $recipeId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Recipe not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$recipe = $result->fetch_assoc();

// Check if the current user is the recipe author or an admin
if ($recipe['user_id'] != $userId && !isAdmin()) {
    echo json_encode(['success' => false, 'message' => 'You do not have permission to delete this recipe']);
    $stmt->close();
    $conn->close();
    exit;
}

// First delete reviews associated with the recipe
$deleteReviewsStmt = $conn->prepare("DELETE FROM reviews WHERE recipe_id = ?");
$deleteReviewsStmt->bind_param("i", $recipeId);
$deleteReviewsStmt->execute();
$deleteReviewsStmt->close();

// Now delete the recipe itself
$deleteRecipeStmt = $conn->prepare("DELETE FROM recipes WHERE id = ?");
$deleteRecipeStmt->bind_param("i", $recipeId);

if ($deleteRecipeStmt->execute()) {
    // If there was an image, delete it
    $imageStmt = $conn->prepare("SELECT image FROM recipes WHERE id = ?");
    $imageStmt->bind_param("i", $recipeId);
    $imageStmt->execute();
    $imageResult = $imageStmt->get_result();
    
    if ($imageResult->num_rows > 0) {
        $imageData = $imageResult->fetch_assoc();
        $imagePath = $imageData['image'];
        
        if ($imagePath && file_exists('../' . $imagePath)) {
            unlink('../' . $imagePath);
        }
    }
    
    echo json_encode(['success' => true, 'message' => 'Recipe deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete recipe']);
}

$stmt->close();
$deleteRecipeStmt->close();
$conn->close();

// Helper function to check if user is admin
function isAdmin() {
    // You can implement proper admin check here
    // For now, just return false
    return false;
}
?>