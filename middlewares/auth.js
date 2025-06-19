const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  // Check for token in cookies or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Throws if invalid
    req.user = decoded; // decoded: { userId, role, iat, exp }
    next(); // Allow to proceed
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.clearCookie("token"); // only relevant in browser-based clients
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
