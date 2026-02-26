const express = require('express');
const cors = require('cors');
const modelRoutes = require('./routes/modelRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/models', modelRoutes);

// Health Check
app.get('/', (req, res) => res.send('IoT Model API is running...'));

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});