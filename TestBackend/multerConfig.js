const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define the storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const username = req.body.username;
        cb(null, username + ext); // Save file as username.jpg
    }
});

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/'); // Directory where post images will be saved
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = crypto.randomBytes(16).toString('hex'); 
        cb(null, uniqueName + ext); 
    }
});

// Create the multer instance
const upload = multer({ storage });
const uploadPost = multer({storage: postStorage});

module.exports = {upload,uploadPost};
