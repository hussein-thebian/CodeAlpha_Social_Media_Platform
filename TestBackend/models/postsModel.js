const pool = require('../db');

const PostModel = {

    getPostsByUser: async (userId) => {
        const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    },

    getPostsFromFollowing : async (userId) => {
        try {
            // Get user ids of people the user is following
            const followingResult = await pool.query(
                `SELECT followedid FROM follows WHERE followerid = $1`, [userId]);
            const followedIds = followingResult.rows.map(row => row.followedid);
    
            if (followedIds.length === 0) return [];
    
            // Get posts from followed users along with usernames
            const result = await pool.query(
                `SELECT p.*, u.username 
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id = ANY($1::int[])
                 ORDER BY created_at DESC`, [followedIds]);
                 
            return result.rows;
        } catch (error) {
            console.error('Error fetching posts from followed users:', error);
            throw error;
        }
    },
    
    createPost: async (post) => {
        const result = await pool.query(
            `INSERT INTO posts (user_id, title, content,photo, tags, location) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [post.user_id, post.title, post.content, post.photo,post.tags, post.location]
        );
        return result.rows[0];
    },

    updatePost: async (id, post) => {
        const result = await pool.query(
            `UPDATE posts SET 
                title = COALESCE($1, title),
                content = COALESCE($2, content),
                photo = COALESCE($3, photo),
                tags = COALESCE($4, tags),
                location = COALESCE($5, location)
            WHERE id = $6 RETURNING *`,
            [post.title, post.content, post.photo, post.tags, post.location, id]
        );
        return result.rows[0];
    },

    deletePost: async (postId, userId) => {
    // Check if the post belongs to the user
    const post = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [postId, userId]);
    if (post.rows.length === 0) {
        return null; // The post does not exist or the user does not own it
    }

    // Proceed with deletion
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId]);
    return result.rows[0];
    },

    getPostById: async (id) => {
        const result = await pool.query(
            `SELECT * FROM posts WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }
};

module.exports = PostModel;
