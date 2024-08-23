const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postsController.js');
const multer = require('multer');
const { uploadPost } = require('../multerConfig');
const { authenticateJWT } = require('../jwt.js');

// Apply the authentication middleware to routes that require authentication
router.get('/:id', authenticateJWT, PostController.getPostById);
router.get('/user/:userId', authenticateJWT, PostController.getPostsByUser); // Get posts by user ID
router.get('/following/:userId', authenticateJWT, PostController.getPostsFromFollowing); // Get posts from users you follow
router.post('/', authenticateJWT, uploadPost.single('photo'), PostController.createPost); // Create a new post with optional photo
router.put('/:id', authenticateJWT, uploadPost.single('photo'), PostController.updatePost); // Update a post
router.delete('/:id', authenticateJWT, PostController.deletePost); // Delete a post

module.exports = router;
