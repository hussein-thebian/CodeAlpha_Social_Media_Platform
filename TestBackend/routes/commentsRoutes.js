const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentsController');
const { authenticateJWT } = require('../jwt.js');

// Route Definitions with Authentication
router.get('/:postId', authenticateJWT, CommentController.getCommentsByPost); // Get comments by post ID
router.post('/', authenticateJWT, CommentController.createComment); // Create a new comment or reply
router.put('/:id', authenticateJWT, CommentController.updateComment); // Update a comment
router.delete('/:id', authenticateJWT, CommentController.deleteComment); // Delete a comment
router.get('/parent/:parentId', authenticateJWT, CommentController.getCommentsByParentId); // Get comments by parent ID

module.exports = router;
