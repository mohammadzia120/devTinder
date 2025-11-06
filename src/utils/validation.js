const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    console.log("Name is not valid");
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(email)) {
    console.log("email is not valid");
    throw new Error("Email id is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    console.log("password is not valid");
    throw new Error("Enter a strong password!");
  }
};

const validatePasswordUpdateData = (req) => {
  const { email, password } = req.body;
  if (!email || !validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  } else return true;
};
const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "about",
    "gender",
    "skills",
  ];
  const isAllowed = Object.keys(req.body).every((key) => {
    allowedFields.includes(key);
  });
  return isAllowed;
};
module.exports = {
  validateSignupData,
  validateEditProfileData,
  validatePasswordUpdateData,
};
