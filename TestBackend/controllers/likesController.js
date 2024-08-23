const LikeModel = require('../models/likesModel');

const LikeController = {
    getLikesByPost: async (req, res) => {
        try {
            const { postId } = req.params;
            const { likes, likeCount } = await LikeModel.getLikesByPost(postId);
            res.json({ likes, likeCount }); // Return both the list of likes and the like counter
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addLike: async (req, res) => {
        try {
            const like = {
                user_id: req.body.user_id,
                post_id: req.body.post_id
            };
            const newLike = await LikeModel.addLike(like);
            res.status(201).json(newLike);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    removeLike: async (req, res) => {
        try {
            const like = {
                user_id: req.body.user_id,
                post_id: req.body.post_id
            };
            await LikeModel.removeLike(like);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = LikeController;
