const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const postsRoutes = require('./routes/postsRoutes');
const likesRoutes = require('./routes/likesRoutes');
const commentsRoutes = require('./routes/commentsRoutes');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/comments', commentsRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

