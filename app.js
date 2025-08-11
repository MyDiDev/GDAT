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
import { error } from "console";

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
  if (!token) {
    return res.status(404).json({ error: "Invalid token to contact API" });
  }
  const decode = await decodeToken(token);
  console.log(decode);
  const role = decode?.role;
  
  if (role != "admin") {
    return res.status(404).json({ error: "Invalid role to contact API" });
  }

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
  const name = sanitize(req.query?.name);
  const email = sanitize(req.query?.email);
  const password = sanitize(req.query?.password);

  console.log(name, email, password);
  const user = new User(name, email);
  const result = await user.auth(password);

  if (!result) res.json({ result: false });
  else res.json({ result: true, data: result });
});

app.post("/api/data/add/user", async (req, res) => {
  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const password = sanitize(req.body.password);

  console.log(name, email, password);
  const user = new User(name, email, password, "user");
  const result = await user.addUser();

  if (result[0]?.result) res.json({ result: result[0]?.result });
  else res.json({ result: "Could not add User." });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/login", async (req, res) => {
  if (token) {
    const decode = await decodeToken(token);
    console.log(decode);

    const role = decode?.role;
    if (role == "admin") {
      res.redirect("/dashboard");
      return;
    }
    return res.redirect("/home");
  } else {
    res.sendFile(path.join(__dirname, "views", "login.html"));
  }
});

app.post("/login/auth", async (req, res) => {
  try {
    if (token) {
      const decode = await decodeToken(token);
      const role = decode.role;
      if (role == "admin") res.redirect("/dashboard");
      res.redirect("/home");
    }

    const name = sanitize(req.body.name);
    const password = sanitize(req.body.password);
    const response = await fetch(
      `${APIURL}/api/authUser?name=${name}&email=${name}&password=${password}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();

    if (response.ok && data?.result && data?.data) {
      console.log(data.data[0]);
      const user = new User(
        data.data[0]?.username,
        data.data[0]?.email,
        data.data[0]?.password,
        data.data[0]?.user_role
      );
      const payload = user.generatePayload(data.data[0]?.id);
      token = genToken(payload);

      if (!token) {
        console.error("Invalid token, try login process again");
        res.redirect("/login");
        return;
      }

      if (user.role == "admin") {
        res.redirect("/dashboard");
        return;
      }

      res.redirect("/home");
    } else {
      console.log("Failed login, redirecting...");
      res.redirect("/login?error=Invalid+credentials");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

app.get("/register", async (req, res) => {
  if (token) {
    const decode = await decodeToken(token);
    const role = decode.role;
    if (role == "admin") {
      res.redirect("/dashboard");
    }
    res.redirect("/home");
    return;
  }
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register/add", async (req, res) => {
  if (token) {
    const decode = await decodeToken(token);
    const role = decode.role;
    if (role == "admin") {
      return res.redirect("/dashboard");
    }
    return res.redirect("/home");
  }

  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    const response = await fetch(`${APIURL}/api/data/add/user`, {
      method: "POST",
      body: { name: name, email: email, password: password },
    });
    const data = response.json();

    if (response.ok && data.result) {
      res.redirect("/login");
      return;
    } else return res.redirect("/register?error=Invalid+Credentials");
  } catch (error) {
    console.error("Error while trying to register:", error.message);
    return res.redirect("/register?error=Invalid+Credentials");
  }
});

app.post("/dashboard/users", (req, res) => {});

app.post("/dashboard/add/user", (req, res) => {});

app.post("/dashboard/update/user", (req, res) => {});

app.post("/dashboard/accounts", (req, res) => {});

app.post("/dashboard/add/account", (req, res) => {});

app.post("/dashboard/update/account", (req, res) => {});

app.post("/dashboard/transactions", (req, res) => {});

app.post("/dashboard/add/transaction", (req, res) => {});

app.post("/dashboard/update/transaction", (req, res) => {});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log("App running on localhost:3000");
});
