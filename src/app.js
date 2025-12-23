const http = require("http");
const io = require("socket.io");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const validateSignupData = require("./utils/validation");
const connectDB = require("./config/database");
const userAuth = require("./middlewares/authentication");
const app = express();
const initializeSocket = require("./utils/socket");

require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./routes/profile"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/request"));
app.use("/", require("./routes/user"));
app.use("/", require("./routes/chat"));

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("db connection successfull");
    server.listen(process.env.PORT, () => {
      console.log(`server is running at 3000`);
    });
  })
  .catch((err) => {
    console.log(`${err.message}`);
  });
