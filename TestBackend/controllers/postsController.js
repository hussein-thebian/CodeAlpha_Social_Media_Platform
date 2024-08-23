const PostModel = require('../models/postsModel');
const path = require('path');
const fs = require('fs');

const PostController = {

    getPostById: async (req, res) => {
        try {
            const postId = req.params.id;
            const post = await PostModel.getPostById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.json(post);
        } catch (error) {
            console.error('Error in getPostById:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getPostsByUser: async (req, res) => {
    try {
      const posts = await PostModel.getPostsByUser(req.params.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPostsFromFollowing: async (req, res) => {
    try {
      const posts = await PostModel.getPostsFromFollowing(req.params.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createPost: async (req, res) => {
    try {
        let tags = req.body.tags;

        if (Array.isArray(tags)) {
            tags = tags.join('/'); // Convert array to a string separated by '/'
        } else if (typeof tags === 'string') {
            // Replace commas with slashes and remove extra spaces
            tags = tags.split(',').map(tag => tag.trim()).join('/'); // Split by comma, trim spaces, and join by '/'
        } else {
            tags = null; // Handle the case where tags are not provided
        }
      const postPhoto = req.file ? req.file.filename : null;
      console.log("Received request:", req.body);

      // Create the post first to get the ID
      const post = {
        user_id: req.body.user_id,
        title: req.body.title,
        content: req.body.content,
        photo: postPhoto,
        tags: tags,
        location: req.body.location,
      };
      const newPost = await PostModel.createPost(post);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      // Fetch the existing post data
      const existingPost = await PostModel.getPostById(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      let tags = req.body.tags;

      if (Array.isArray(tags)) {
        tags = tags.join('/'); // Convert array to a string separated by '/'
      } else if (typeof tags === 'string') {
        // Replace commas with slashes and remove extra spaces
        tags = tags.split(',').map(tag => tag.trim()).join('/'); // Split by comma, trim spaces, and join by '/'
      } else {
        tags = null; // Handle the case where tags are not provided
      }

      let photoFilename = existingPost.photo;

      if (req.file) {
        // Delete the old photo if it exists
        if (existingPost.photo) {
          const oldPhotoPath = path.join(__dirname, '../uploads/posts', existingPost.photo);
          if (fs.existsSync(oldPhotoPath)) {
            console.log('Deleting old post photo:', oldPhotoPath);
            fs.unlinkSync(oldPhotoPath);
          }
        }

        // Save the new photo with the generated filename
        photoFilename = req.file.filename;
      }

      const post = {
        title: req.body.title,
        content: req.body.content,
        photo: photoFilename,
        tags: tags,
        location: req.body.location,
      };

      const updatedPost = await PostModel.updatePost(req.params.id, post);
      if (updatedPost) {
        res.json(updatedPost);
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.body.user_id; // Assuming `req.user` contains the authenticated user's ID from the JWT

        // Attempt to delete the post
        const deletedPost = await PostModel.deletePost(postId, userId);

        if (deletedPost) {
            // Delete the associated photo if it exists
            if (deletedPost.photo) {
                const photoPath = path.join(__dirname, '../uploads/posts', deletedPost.photo);
                if (fs.existsSync(photoPath)) {
                    console.log('Deleting post photo:', photoPath);
                    fs.unlinkSync(photoPath);
                }
            }
            res.json({ message: "Post deleted" });
        } else {
            res.status(403).json({ message: "You are not authorized to delete this post" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PostController;
