const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization"],
};
const { connectToDB } = require("./config/mysql.js");
const { server } = require("./socket/socket");
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//router
const customerRouter = require("./router/customer.js");
const adminRouter = require("./router/admin.js");
const uploadRouter = require("./router/upImage.js");

//api
app.use("/api/customer", customerRouter);
app.use("/api/admin", adminRouter);
app.use("/upload", uploadRouter);

const startServer = async () => {
  try {
    await connectToDB();
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
