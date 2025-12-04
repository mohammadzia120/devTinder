const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
      minLength: 4,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["Male", "Female", "Others"].includes(value)) {
          throw new Error("gender is not valid");
        }
      },
    },
    about: {
      type: String,
      default: "This is a software engineer",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.getJWT = async function () {
  try {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "sdfkdf@Kjfigdjkg", {
      expiresIn: "1d",
    });
    return token;
  } catch (err) {
    return err.message;
  }
};
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const isValid = await bcrypt.compare(passwordInputByUser, user.password);
  return isValid;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
