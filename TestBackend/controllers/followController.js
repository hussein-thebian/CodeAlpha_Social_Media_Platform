const FollowModel = require('../models/followModel');

const FollowController = {
    followUser: async (req, res) => {
        try {
            const { followerId, followedId } = req.body;
            if ( followerId==followedId) {
                return res.status(400).json({ message: 'Can\'t follow yourself' });
            }
            const follow = await FollowModel.followUser(followerId, followedId);
            res.status(201).json(follow);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    unfollowUser: async (req, res) => {
        try {
            const { followerId, followedId } = req.body;
            if ( followerId==followedId) {
                return res.status(400).json({ message: 'Can\'t unfollow yourself' });
            }
            const unfollow = await FollowModel.unfollowUser(followerId, followedId);
            if (unfollow) {
                res.json({ message: 'Unfollow successful' });
            } else {
                res.status(404).json({ message: 'Follow relationship not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getFollowers: async (req, res) => {
        try {
            const followers = await FollowModel.getFollowers(req.params.userId);
            res.json(followers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getFollowing: async (req,res) => {
        try {
            const following = await FollowModel.getFollowing(req.params.userId);
            res.json(following);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllUsersNotFollowed: async (req, res) => {
        try {
            const usersNotFollowed = await FollowModel.getAllUsersNotFollowed(req.params.userId);
            res.json(usersNotFollowed);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
};

module.exports = FollowController;
