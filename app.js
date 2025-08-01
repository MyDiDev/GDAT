import { User } from "./Classes/user";
import { sanitize } from "./utils/sanitizer";

const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login/auth", (req, res) => {
  const name = sanitize(req.body.name);
  const password = sanitize(req.body.password);
  let user = new User(name, "", password);
  user.auth();
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register/auth", (req, res) => {
  const name = sanitize(req.body.name);
  const secondName = sanitize(req.body.secondName);
  const password = sanitize(req.body.password);
  const user = new User(name, secondName, password);
  user.addUser();
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log("App running on localhost:3000");
});
