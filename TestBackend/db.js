const { Pool } = require('pg');

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'social_media_platform',
    password: 'sql123',
    port: 5432,
});

module.exports = pool;