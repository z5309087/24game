const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Create and connect to the database
const db = new sqlite3.Database(':memory:');

// Middleware to parse JSON bodies
app.use(express.json());

// Create the scores table
db.serialize(() => {
  db.run(`CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Endpoint to submit a new score
app.post('/submit-score', (req, res) => {
  const { username, score } = req.body;
  db.run('INSERT INTO scores (username, score) VALUES (?, ?)', [username, score], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ id: this.lastID });
  });
});

// Endpoint to get the leaderboard
app.get('/leaderboard', (req, res) => {
  db.all('SELECT username, score, timestamp FROM scores ORDER BY score DESC, timestamp ASC LIMIT 10', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
