require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Authentication routes
const authMiddleware = require('./middleware/authMiddleware'); // Authentication middleware
const parkingRoutes = require('./routes/parking'); // Parking routes
const bodyParser = require('body-parser');
const keepersRoutes = require('./routes/keepers'); // Keepers routes
const UserInfo = require('./routes/userInfo'); // User info routes
const bookingRoutes = require('./routes/booking'); // Booking routes

const app = express();

// Set up CORS
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true,
}));

// Middleware to parse incoming JSON data
app.use(express.json());

// Define Routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/user', UserInfo); // User info routes
app.use('/api/parking', parkingRoutes); // Parking routes
app.use('/api/bookings', bookingRoutes); // Booking routes

// Example of a protected route (using authMiddleware)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `This is protected, userId: ${req.user}` });
});

// Keepers data routes
app.use('/api/keepers', keepersRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Car Parking Backend!');
});

// Global error handler (for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
