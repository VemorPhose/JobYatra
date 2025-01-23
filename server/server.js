const express = require('express');
const multer = require('multer');
const pool = require("./config/db");
require("dotenv").config();
const convertPdfToText = require('./scripts/pdf_to_txt.cjs');
const { getJobRecommendations } = require('./scripts/script.js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const textResult = await convertPdfToText(req.file.buffer);
    res.send(textResult);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/api/recommendations', express.json(), async (req, res) => {
    try {
      const { resumeText } = req.body;
      const recommendations = await getJobRecommendations(resumeText);
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

const PORT = process.env.PORT || 5000;

// Database initialization
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_openings (
        id SERIAL PRIMARY KEY,
        website VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        job_intern VARCHAR(20),
        salary_stipend VARCHAR(20),
        experience_reqd INTEGER DEFAULT 0
      );

    `);
    console.log("Database tables initialized");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));