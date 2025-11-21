const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the frontend directory
app.use('/frontend', express.static(path.join(__dirname)));

// Handle all routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'html', 'manage-resorts.html'));
});

const PORT = process.env.PORT || 5502;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 