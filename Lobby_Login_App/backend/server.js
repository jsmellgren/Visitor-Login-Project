const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import the PostgreSQL library
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Set up the connection pool using our hidden .env variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error acquiring database client', err.stack);
    }
    console.log('✨ Successfully connected to PostgreSQL database!');
    release();
});

// 2. Update our POST route to actually save data to the database
app.post('/api/checkin', async (req, res) => {
    const { name, purpose } = req.body;

    if (!name || !purpose) {
        return res.status(400).json({ error: "Name and Purpose are required." });
    }

    try {
        // Insert the data into our 'checkins' table safely using parameterized queries ($1, $2)
        const queryText = 'INSERT INTO checkins(name, purpose) VALUES($1, $2) RETURNING *';
        const values = [name, purpose];
        
        const result = await pool.query(queryText, values);
        
        console.log(`[Database Log] Saved check-in:`, result.rows[0]);
        
        res.json({ message: `Welcome, ${name}! You have been checked in successfully.` });
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: "Database saving failed." });
    }
});
// GET route to fetch all visitor check-ins sorted by newest first
app.get('/api/visitors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM checkins ORDER BY checked_in_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Database Fetch Error:', err);
        res.status(500).json({ error: 'Failed to retrieve visitor data.' });
    }
    // PUT route to handle checking out a visitor by their unique ID
app.put('/api/checkout/:id', async (req, res) => {
    const visitorId = req.params.id; // Grabs the ID directly out of the URL string

    try {
        // Update the row matching the ID with the current, local timestamp
        const queryText = `
            UPDATE checkins 
            SET checked_out_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND checked_out_at IS NULL
            RETURNING *
        `;
        
        const result = await pool.query(queryText, [visitorId]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Visitor already checked out or not found." });
        }

        console.log(`[Database Log] Checked out visitor ID: ${visitorId}`);
        res.json({ message: "Successfully checked out visitor.", visitor: result.rows[0] });
    } catch (err) {
        console.error('Database Checkout Error:', err);
        res.status(500).json({ error: 'Failed to process check-out.' });
    }
});
});
app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
});
