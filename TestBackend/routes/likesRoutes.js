const express = require('express');
const router = express.Router();
const LikeController = require('../controllers/likesController');
const { authenticateJWT } = require('../jwt.js');

// Route Definitions with Authentication
router.get('/post/:postId', authenticateJWT, LikeController.getLikesByPost); // Get likes by post ID
router.post('/', authenticateJWT, LikeController.addLike); // Add a like
router.delete('/', authenticateJWT, LikeController.removeLike); // Remove a like

module.exports = router;
