const express = require('express');
const router = express.Router();
const FollowController = require('../controllers/followController');
const { authenticateJWT } = require('../jwt.js');

// Route Definitions with Authentication
router.post('/', authenticateJWT, FollowController.followUser); // Follow a user
router.delete('/', authenticateJWT, FollowController.unfollowUser); // Unfollow a user
router.get('/followers/:userId', authenticateJWT, FollowController.getFollowers); // Get followers of a specific user
router.get('/following/:userId', authenticateJWT, FollowController.getFollowing);
router.get('/not-following/:userId', authenticateJWT, FollowController.getAllUsersNotFollowed);


module.exports = router;
