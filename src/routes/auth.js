const express = require("express");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, email, password, age, gender, photoUrl } =
      req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
      photoUrl,
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
    if (!email || !password) {
      return res.status(400).send({ error: "Email or password is required!" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid username or passowrd!");
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
        res.send({ message: "Login Successfull.", data: user });
      } else {
        res.status(401).send({
          message: "login Failed!",
          error: "Invalid username or password!",
        });
      }
    }
  } catch (err) {
    res.status(401).send({ message: "Login Failed", error: err.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expiresIn: new Date(Date.now()) });
    res.send("logout successfull!");
  } catch (err) {
    res.status(401).send("logout faild!");
  }
});

module.exports = router;
