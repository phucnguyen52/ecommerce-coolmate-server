const jwt = require("jsonwebtoken");

const tokenCookie = async (user, statusCode, res) => {
  // Tạo token JWT
  const token = jwt.sign({ user }, process.env.JWT, {
    expiresIn: "90d", // 90 ngày
  });

  // Trả token trong JSON để client lưu và gửi qua header Authorization
  res.status(statusCode).json({
    success: true,
    message: "Đăng nhập thành công",
    token, // Client sẽ dùng: Authorization: Bearer <token>
    role: user.role,
  });
};

module.exports = tokenCookie;
