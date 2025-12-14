const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { _id } = decoded;
    const user = await User.findOne({ _id });
    if (!user) {
      throw new Error("User does not exists!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Error:" + err.message);
  }
};

module.exports = userAuth;
