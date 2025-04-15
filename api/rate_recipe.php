<?php
// api/rate_recipe.php - Handle recipe ratings
require_once '../config/database.php';
require_once '../utils/functions.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Please login to rate recipes']);
    exit;
}

// Get the POST data
$postData = json_decode(file_get_contents('php://input'), true);
$recipeId = isset($postData['recipe_id']) ? (int)$postData['recipe_id'] : 0;
$rating = isset($postData['rating']) ? (int)$postData['rating'] : 0;
$userId = $_SESSION['user_id'];

// Validate data
if ($recipeId <= 0 || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid recipe ID or rating']);
    exit;
}

$conn = connectDB();

// Check if user has already rated this recipe
$stmt = $conn->prepare("SELECT id FROM reviews WHERE recipe_id = ? AND user_id = ?");
$stmt->bind_param("ii", $recipeId, $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Update existing rating
    $review = $result->fetch_assoc();
    $reviewId = $review['id'];
    
    $updateStmt = $conn->prepare("UPDATE reviews SET rating = ? WHERE id = ?");
    $updateStmt->bind_param("ii", $rating, $reviewId);
    
    if ($updateStmt->execute()) {
        // Success - get the new average
        $avgStmt = $conn->prepare("SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE recipe_id = ?");
        $avgStmt->bind_param("i", $recipeId);
        $avgStmt->execute();
        $avgResult = $avgStmt->get_result();
        $avgData = $avgResult->fetch_assoc();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Rating updated successfully',
            'new_rating' => round($avgData['avg_rating'] * 2) / 2, // Round to nearest 0.5
            'reviews_count' => $avgData['count']
        ]);
        
        $avgStmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update rating']);
    }
    
    $updateStmt->close();
} else {
    // Insert new rating
    $insertStmt = $conn->prepare("INSERT INTO reviews (recipe_id, user_id, rating) VALUES (?, ?, ?)");
    $insertStmt->bind_param("iii", $recipeId, $userId, $rating);
    
    if ($insertStmt->execute()) {
        // Success - get the new average
        $avgStmt = $conn->prepare("SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE recipe_id = ?");
        $avgStmt->bind_param("i", $recipeId);
        $avgStmt->execute();
        $avgResult = $avgStmt->get_result();
        $avgData = $avgResult->fetch_assoc();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Rating submitted successfully',
            'new_rating' => round($avgData['avg_rating'] * 2) / 2, // Round to nearest 0.5
            'reviews_count' => $avgData['count']
        ]);
        
        $avgStmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit rating']);
    }
    
    $insertStmt->close();
}

$stmt->close();
$conn->close();
?>