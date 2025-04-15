<?php
// api/check_login.php - Check user login status
require_once '../utils/functions.php';

if (isLoggedIn()) {
    echo json_encode([
        'loggedIn' => true,
        'userId' => $_SESSION['user_id'],
        'userName' => $_SESSION['user_name']
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>