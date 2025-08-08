import express from "express";
import cors from "cors";
import { connectToDb } from "./db/connection.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { User } from "./Logic/classes/user.js";
import { Account } from "./Logic/classes/account.js";
import { Transactions } from "./logic/classes/transaction.js";
import { sanitize } from "./utils/sanitizer.js";
import { genToken, decodeToken } from "./logic/tokenizer.js";

const app = express();
let token = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APIURL = "http://localhost:3000";

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());
await connectToDb();

app.get("/api/data", async (req, res) => {
  const table = req.query.table ?? null;
  if (!table) {
    res.status(404).json({ error: "Missing 'table' in get request" });
  }
  switch (String(table).toLowerCase()) {
    case "accounts":
      const account = new Account();
      const accounts = await account.get();
      res.json({ result: accounts });
      break;
    case "users":
      const user = new User();
      const users = await user.get();
      res.json({ result: users });
      break;
    case "transactions":
      const transaction = new Transactions();
      const transactions = await transaction.get();
      res.json({ result: transactions });
      break;
    default:
      res.send("Invalid table found, try again");
  }
});

app.get("/api/authUser", async (req, res) => {
  const name = req.query?.name;
  const email = req.query?.email;
  const password = req.query?.password;

  let user = new User(name, email, password);
  const result = await user.auth();
  if (!result) {
    res.status(404).json({ invalid: true });
  }
  res.json({ result: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/login", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    if (role == "admin") {
      res.redirect("/dashboard");
    }
    res.redirect("/home");
    return;
  }
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login/auth", async (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    if (role == "admin") res.redirect("/dashboard");
    res.redirect("/home");
  }

  const name = sanitize(req.body.name);
  const password = sanitize(req.body.password);
  const response = await fetch(
    `${APIURL}/api/userAuth?name=${name}&email=${name}&password=${password}`,
    {
      method: "GET",
    }
  );
  console.log(response.ok, response.json());

  if (response.ok && !response.json()?.invalid) {
    const result = response.json();
    const user = new User(
      response[0]?.username,
      response[0]?.email,
      response[0]?.password,
      response[0]?.role
    );
    const payload = user.generatePayload(result[0]?.id);
    token = genToken(payload);

    if (!token) {
      console.error("Invalid token, try login process again");
      res.redirect("/login");
      return;
    }

    // redirect to home if user, else dashboard if admin
  }
  res.redirect("/login");
  return;
});

app.get("/register", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    if (role == "admin") {
      res.redirect("/dashboard");
    }
    res.redirect("/home");
    return;
  }
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register/auth", (req, res) => {
  if (token) {
    const decode = decodeToken(token);
    const role = decode.role;
    if (role == "admin") {
      res.redirect("/dashboard");
    }
    res.redirect("/home");
    return;
  }

  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const password = sanitize(req.body.password);
  const user = new User(name, email, password);
  user.addUser();
  // redirect to /login
});

app.post("/dashboard/accounts", (req, res) => {});

app.post("/dashboard/add/account", (req, res) => {});

app.post("/dashboard/update/account", (req, res) => {});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log("App running on localhost:3000");
});
