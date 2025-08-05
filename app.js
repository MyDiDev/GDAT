import { User } from "./classes/user.js";
import { sanitize } from "./utils/sanitizer.js";
import { genToken, decodeToken } from "./logic/tokenizer.js";

const express = require("express");
const app = express();
const path = require("path");
let token = null;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/login", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    // redirect to home if user, dashboard if admin
    return;
  }
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login/auth", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
  }

  const name = sanitize(req.body.name);
  const password = sanitize(req.body.password);
  let user = new User(name, "", password);
  if (user.auth()) {
    const payload = user.generatePayload(null);
    token = genToken(payload);

    if (!token) {
      console.error("Invalid token, try login process again");
      // redirect to login cause failed
      return;
    }

    // redirect to home if user, else dashboard if admin
  }
  // return to login cause failed
});

app.get("/register", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    // redirect to home if user, dashboard if admin
    return;
  }
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register/auth", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    // redirect to home if user, dashboard if admin
    return;
  }

  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const password = sanitize(req.body.password);
  const user = new User(name, email, password);
  user.addUser();
  // redirect to /login
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log("App running on localhost:3000");
});
