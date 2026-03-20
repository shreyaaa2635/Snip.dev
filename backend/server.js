const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        process.env.FRONTEND_URL, 
        'http://localhost:5173', 
        'https://snip-dev.vercel.app' // Hardcoded backup
    ].filter(Boolean), 
    credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/snippets', require('./routes/snippets'));

app.get('/', (req, res) => res.send('Snippet Manager API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
