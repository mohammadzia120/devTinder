const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token!");
    }
    const { _id } = await jwt.verify(token, "sdfkdf@Kjfigdjkg");
    const user = await User.findOne({ _id });
    if (!user) {
      throw new Error("User does not exists!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.send("Error:" + err.message);
  }
};

module.exports = userAuth;
