const jwt = require("jsonwebtoken");

// Middleware to verify JWT
exports.authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  // Check for authorization header
  if (!authorization) return res.status(401).json({ msg: "Token Not Found" });

  // Extract the token from the header
  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Unauthorized" });

  try {
    // Verify the token synchronously
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, Email: decoded.Email };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    const msg = err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
    return res.status(401).json({ msg });
  }
};

// Function to generate JWT
exports.genrateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "1d" });
};
