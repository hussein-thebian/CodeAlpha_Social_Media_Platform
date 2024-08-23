const pool = require('../db');

const LikeModel = {
    
    getLikesByPost: async (postId) => {
        const result = await pool.query(
            `SELECT user_id FROM likes WHERE post_id = $1 ORDER BY created_at DESC`, 
            [postId]
        );
        const likeCount = result.rowCount; // Count of likes
        return { likes: result.rows, likeCount }; // Return likes and count
    },

    addLike: async (like) => {
        const result = await pool.query(
            `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *`,
            [like.user_id, like.post_id]
        );
        return result.rows[0];
    },

    removeLike: async (like) => {
        await pool.query(
            `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
            [like.user_id, like.post_id]
        );
    }
};

module.exports = LikeModel;
