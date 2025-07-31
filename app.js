const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.render("/View/home.html");
});

app.listen(3000, () => {
  console.log("App listening in port: 3000");
});
