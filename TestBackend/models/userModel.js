const pool = require('../db');

const UserModel = {
    getAllUsers: async () => {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
    },

    getUserByEmail: async (email) => {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    },

    getUserByUsernameOrEmail: async (username, email) => {
        const result = await pool.query(
            `SELECT * FROM users WHERE username = $1 OR email = $2`,
            [username, email]
        );
        return result.rows[0];
    },

    getByUsername : async (username) => {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    getUserById: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    createUser : async (user) => {
        const result = await pool.query(
            `INSERT INTO users (username, email, password, gender, birthdate, profile_picture, bio) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user.username, user.email, user.password, user.gender, user.birthdate, user.profile_picture, user.bio]
        );
        return result.rows[0];
    },
    

    updateUser : async (id, user) => {
        const result = await pool.query(
            `UPDATE users SET 
            username = COALESCE($1, username), 
            email = COALESCE($2, email), 
            password = COALESCE($3, password),
            gender = COALESCE($4, gender),
            birthdate = COALESCE($5, birthdate),
            profile_picture = COALESCE($6, profile_picture),
            bio = COALESCE($7, bio)
            WHERE id = $8 RETURNING *`,
            [user.username, user.email, user.password, user.gender, user.birthdate, user.profile_picture, user.bio, id]
        );
        return result.rows[0];
    },

    deleteUser: async (id) => {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    },

    getByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
};

module.exports = UserModel;

