const pool = require('../db');

const CommentModel = {
    getCommentsByPost: async (postId) => {
        const result = await pool.query(
            `SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC`,
            [postId]
        );
        const commentCount = result.rowCount; // Count of likes
        return { comments: result.rows, commentCount }; // Return comments and count
    },

    createComment: async (comment) => {
        try {
            const result = await pool.query(
                `INSERT INTO comments (post_id, user_id, content) 
                VALUES ($1, $2, $3) RETURNING *`,
                [comment.post_id, comment.user_id, comment.content]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Error inserting comment:", error); // Add detailed error logging
            throw error;
        }
    },
    

    updateComment: async (id, comment) => {
        const result = await pool.query(
            `UPDATE comments SET content = COALESCE($1, content) WHERE id = $2 RETURNING *`,
            [comment.content, id]
        );
        return result.rows[0];
    },

    deleteComment: async (id) => {
        const result = await pool.query(
            `DELETE FROM comments WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rowCount > 0;
    },

    getCommentsByParentId: async (parentId) => {
        const result = await pool.query(
            `SELECT * FROM comments WHERE parent_id = $1 ORDER BY created_at ASC`,
            [parentId]
        );
        return result.rows;
    },
    
};

module.exports = CommentModel;
