const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./models/db'); 
require('dotenv').config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.get('/api/dogs', async (req, res) => {
    try {
        const dogQuery = `
            SELECT
                Dogs.name as dog_name,
                Dogs.size,
                Users.username as owner_username
            FROM Dogs
            INNER JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE Users.role = 'owner'
            ORDER BY Dogs.name ASC
        `;

        const [dogResults] = await db.execute(dogQuery);
        return res.status(200).json(dogResults);

    } catch (dbError) {
        console.error('err in /api/dogs:', dbError.message);

        res.status(500).json({
            error: 'qry fail',
            message: 'this shit dont work'
        });
    }
});

const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app
module.exports = app;
