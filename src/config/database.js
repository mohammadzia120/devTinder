const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://mohammadzia:Dreamer%401234@devtinder.u4ugvqu.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
