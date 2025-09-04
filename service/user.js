const { User } = require("../model/user");
const activeToken = require("../middleware/activeToken");
const sendMail = require("../config/sendMail");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const { Sequelize, Op, fn, col, literal } = require("sequelize");
const { default: axios } = require("axios");

const registerUser = async (data) => {
  try {
    const check = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (check) {
      return -1;
    }

    const user = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: "customer",
    };

    const token = activeToken(user);
    const otp = token.code;
    sendMail({
      email: data.email,
      subject: "Xác nhận đăng ký tài khoản",
      message: otp,
    });
    return token;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const activeUser = async (data) => {
  try {
    const newUser = jwt.verify(data.token, process.env.JWT);
    if (newUser.code != data.code) {
      return -1;
    }
    await User.create(newUser.user);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const postUser = async (data) => {
  await User.create(data);
};

const loginUser = async (data) => {
  try {
    const users = await User.findOne({
      where: {
        email: data.email,
      },
    });
    if (!users) {
      return -1;
    } else {
      const check = await bcryptjs.compare(data.password, users.password);
      if (!check) {
        return -2;
      } else {
        return users;
      }
    }
  } catch (error) {
    console.log(error);
    return "error";
  }
};
const getOauthGoogleToken = async (code) => {
  const body = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    body,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return data; // { access_token, id_token }
};

const getGoogleUserInfo = async (access_token, id_token) => {
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      params: {
        access_token,
        alt: "json",
      },
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
  return data;
};

const oauth = async (code) => {
  try {
    // 1. Lấy access_token + id_token từ Google
    const { id_token, access_token } = await getOauthGoogleToken(code);

    // 2. Lấy thông tin user từ Google
    const userInfo = await getGoogleUserInfo(access_token, id_token);

    if (!userInfo.verified_email) {
      return res.status(400).json({
        success: false,
        message: "Email chưa được Google Verified!",
      });
    }

    // 3. Kiểm tra user trong DB
    let user = await User.findOne({ where: { email: userInfo.email } });
    let isNewUser = false;
    if (!user) {
      // Nếu chưa có thì tạo mới
      user = await User.create({
        fullName: userInfo.name,
        email: userInfo.email,
        password: Math.random().toString(36).substring(2, 15), // Google login thì không cần mật khẩu
        role: "customer",
      });
      isNewUser = true;
    }

    // 4. Tạo JWT duy nhất (7 ngày, tuỳ bạn)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT,
      { expiresIn: "90d" }
    );

    // 5. Redirect về frontend kèm token
    return { ...user, token, isNewUser };
  } catch (error) {
    console.error(error);
  }
};
const getUser = async (id) => {
  const users = await User.findOne({
    where: {
      id: id,
    },
  });
  return users;
};

//note
const putUser = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    if (data.password) {
      const check = await bcryptjs.compare(data.password_old, user.password);
      if (check) {
        user.update(data);
      } else {
        return -1;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const putUserForAdmin = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    user.update(data);
  } catch (error) {
    console.log(error);
  }
};

const getAllUser = async (data) => {
  const { count, rows: user } = await User.findAndCountAll({
    attributes: ["id", "fullName", "email", "role"],
    where: {
      role: data,
    },
    order: [["id", "ASC"]],
  });

  return { count, user };
};

const findUser = async (data) => {
  const search = `%${data}%`;

  const user = User.findAll({
    attributes: ["id", "fullName", "email", "picture"],
    where: {
      role: "customer",
      [Op.or]: [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("fullName")), {
          [Op.like]: search.toLowerCase(),
        }),
        { email: { [Op.like]: search } },
      ],
    },
  });

  return user;
};

module.exports = {
  registerUser,
  activeUser,
  loginUser,
  getUser,
  putUser,
  getAllUser,
  postUser,
  putUserForAdmin,
  findUser,
  oauth,
};
