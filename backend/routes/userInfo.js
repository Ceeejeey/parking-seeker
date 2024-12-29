const express = require('express');
const User = require('../models/User'); 
const Keeper = require('../models/keeper'); 
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Example Node.js/Express backend route
router.get('/:userId', async (req, res) => {
    console.log('User ID:', req.params.userId);
    try {
      const user = await User.findById(req.params.userId); // MongoDB schema used here
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data', error });
    }
  });
  
  module.exports = router;
