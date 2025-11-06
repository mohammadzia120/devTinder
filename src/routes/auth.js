const express = require("express");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    //validate the data // api level
    validateSignupData(req);
    const { firstName, lastName, email, password } = req.body;
    //encryption of password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //create a new instance of User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await user.save();
    res.send("Data inserted successfully!");
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist!");
    } else {
      const isPasswordValidated = await user.validatePassword(password);
      if (isPasswordValidated) {
        const token = await user.getJWT();
        if (!token) {
          throw new Error("Invalid token");
        }
        res.cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000),
        });
        res.send("Login Successfull.");
      } else {
        res.send("login Failed!");
      }
    }
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/logout", async (req, res) => {
  res.cookie("token", null, { expiresIn: new Date(Date.now()) });
  res.send("logout successfull!");
});

module.exports = router;
