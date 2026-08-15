import express from 'express';
import pool from './db/index.js';

const app = express();

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            message: "DownAlert API is running",
            database: "connected",
            timestamp: result.rows[0].now,
        });
    } catch (error) {
        console.error("Database connection error", error);

        res.status(500).json({
            success: false,
            message: "Database connection error",
            error: error.message,
        });
    }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});