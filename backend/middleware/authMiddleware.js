const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', ''); // Remove 'Bearer ' prefix

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Set the userId from the token payload to req.user
    next(); // Move to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
