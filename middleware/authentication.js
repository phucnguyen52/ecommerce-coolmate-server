const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded.user; // tuỳ bạn encode thế nào khi tạo token
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authentication };
