const pool = require('../db'); // Adjust the path to your pool configuration

const FollowModel = {
    followUser: async (followerId, followedId) => {
        const result = await pool.query(
            `INSERT INTO follows (followerid, followedid) 
            VALUES ($1, $2) RETURNING *`,
            [followerId, followedId]
        );
        return result.rows[0];
    },

    unfollowUser: async (followerId, followedId) => {
        const result = await pool.query(
            `DELETE FROM follows 
            WHERE followerid = $1 AND followedid = $2 RETURNING *`,
            [followerId, followedId]
        );
        return result.rows[0];
    },

    getFollowers: async (userId) => {
        const result = await pool.query(
            `SELECT u.username FROM users u
            JOIN follows f ON u.id = f.followerid
            WHERE f.followedid = $1`,
            [userId]
        );
        return result.rows;
    },

    getFollowing: async (userId) => {
        const result = await pool.query(
            `SELECT u.username FROM users u
            JOIN follows f ON u.id = f.followedid
            WHERE f.followerid = $1`,
            [userId]
        );
        return result.rows;
    },
    
    getAllUsersNotFollowed: async (userId) => {
        const result = await pool.query(
            `SELECT * FROM users u
            WHERE u.id NOT IN (
                SELECT f.followedid FROM follows f
                WHERE f.followerid = $1
            ) AND u.id != $1`,
            [userId]
        );
        return result.rows;
    },
    
};

module.exports = FollowModel;
