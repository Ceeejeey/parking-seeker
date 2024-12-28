const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Keeper = require('../models/keeper'); 
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// User signup route
router.post('/signup', async (req, res) => {
  console.log(req.body);
  const { username, email, nic, tpno, address, password } = req.body;
  
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, nic, tpno, address, password: hashedPassword });
    await newUser.save();

    console.log(req.body);

    res.status(200).json({ message: "Signup successful" });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Log to check if the request is hitting the backend
  console.log('Login request received:', req.body);

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid email'); // Log invalid email
      return res.status(400).json({ message: 'Invalid Email' });
    }
    
    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
      console.log('Invalid password'); // Log invalid password
      return res.status(400).json({ message: 'Invalid Password' });
    } 
    
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Log successful token generation
    console.log('Generated token:', token); 
    

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// keeper login route
router.post('/klogin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the keeper exists
    const keeper = await Keeper.findOne({ email });
    if (!keeper) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Compare the password
    const isMatch = await bcrypt.compare(password, keeper.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Generate a JWT token
    const token = jwt.sign({ keeperId: keeper._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get user data
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
