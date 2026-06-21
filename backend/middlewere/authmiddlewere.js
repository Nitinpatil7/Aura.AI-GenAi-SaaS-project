const jwt = require("jsonwebtoken");
const User = require("../model/usermodel"); // make sure path is correct

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.accesstoken;
  if (!token) return res.status(401).json({ message: "Unauthorized token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);

    // Fetch full user from DB
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // now req.user is a Mongoose document
    console.log("Auth middleware called");
next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;