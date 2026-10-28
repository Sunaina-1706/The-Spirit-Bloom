const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets (index.html, style.css, script.js, etc.)
app.use(express.static(__dirname));

// Route to serve the main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌸 The Spirit Bloom server is running at http://localhost:${PORT}`);
});
