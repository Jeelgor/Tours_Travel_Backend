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
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
      if (err) {
        return "Token Expired";
      } else {
        return res;
      }
    });

    req.userkey = decoded;
    req.user = { id: decoded.id, Email: decoded.Email }; // Ensure this attaches the user ID
    console.log("Middleware is working ", req.user);
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ msg: "Invalid Token" });
  }
};

// Function to generate JWT
exports.genrateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "30d" }); // Use a readable format for expiration
};
