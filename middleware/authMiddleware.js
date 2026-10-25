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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key");
    req.user = { id: decoded.id, Email: decoded.Email, role: decoded.role || "user" };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    const msg = err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
    return res.status(401).json({ msg });
  }
};

// Middleware to verify admin role
exports.adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ msg: "Access Denied: Admin Privileges Required" });
  }
};

// Function to generate JWT
exports.genrateToken = (userData) => {
  return jwt.sign(
    {
      id: userData.id,
      Email: userData.Email,
      role: userData.role || "user",
    },
    process.env.JWT_SECRET || "default_jwt_secret_key",
    { expiresIn: "1d" }
  );
};
