const CommentModel = require('../models/commentsModel');

const CommentController = {
    getCommentsByPost: async (req, res) => {
        try {
            const {comments,commentCount} = await CommentModel.getCommentsByPost(req.params.postId);
            res.json({ comments, commentCount });
            } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createComment: async (req, res) => {
        try {
            // Ensure required fields are provided
            console.log("Incoming comment data:", req.body);
            const { post_id, user_id, content } = req.body;
            if (!post_id || !user_id || !content) {
                return res.status(400).json({ error: "Missing required fields" });
            }
    
            const comment = {
                post_id,
                user_id,
                content
            };
            
            const newComment = await CommentModel.createComment(comment);
            res.status(201).json(newComment);
        } catch (error) {
            console.error("Error creating comment:", error); // Add detailed error logging
            res.status(500).json({ error: error.message });
        }
    },
    

    updateComment: async (req, res) => {
        try {
            const comment = {
                content: req.body.content
            };
            const updatedComment = await CommentModel.updateComment(req.params.id, comment);
            if (updatedComment) {
                res.json(updatedComment);
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const deletedComment = await CommentModel.deleteComment(req.params.id);
            if (deletedComment) {
                res.json({ message: 'Comment deleted successfully' });
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCommentsByParentId: async (req, res) => {
        try {
            const comments = await CommentModel.getCommentsByParentId(req.params.parentId);
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
};

module.exports = CommentController;
