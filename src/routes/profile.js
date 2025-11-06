const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const userAuth = require("../middlewares/authentication");
const {
  validateEditProfileData,
  validatePasswordUpdateData,
} = require("../utils/validation");
const router = express.Router();

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (err) {
    res.send(err.message);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.send({ message: "Data updated successfully!", data: loggedInUser });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.patch("/profile/password", async (req, res) => {
  try {
    if (!validatePasswordUpdateData(req)) {
      throw new Error("Invalid Password Reset Request!");
    }
    const user = await User.findOne({ email: req.body.email });
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      throw new Error("Old and New password can not be same");
    } else {
      user.password = hashedPassword;
    }

    await user.save();

    res.send({ message: "password updated successfully", data: user });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
