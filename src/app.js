const express = require("express");
const app = express();

app.use("/", (req, res) => {
  res.send("hello from 3000");
});
app.listen(3000, () => {
  console.log(`server is running at 3000`);
});
