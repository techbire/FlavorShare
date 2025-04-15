<?php
// api/newsletter.php - Newsletter subscription API
require_once '../config/database.php';

$conn = connectDB();

// Get POST data
$postData = json_decode(file_get_contents('php://input'), true);
$email = isset($postData['email']) ? $postData['email'] : '';

// Validate email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address']);
    exit;
}

// Insert into database
$stmt = $conn->prepare("INSERT INTO newsletter (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email");
$stmt->bind_param("s", $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Successfully subscribed to newsletter']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to subscribe: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>