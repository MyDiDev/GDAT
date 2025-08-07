import express from "express";
import { connectToDb } from "./db/connection.js"
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
const __dirname = dirname(__filename)

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded());
await connectToDb();

app.get("/api/data", async (req, res) => {
  const table = req.body.table ?? null;
  if (!table){
    res.send("Invalid table to request, try again")
  }
  switch(String(table).toLowerCase()){
    case "accounts":
      const account = new Account();
      const accounts = await account.get();
      res.send(accounts);
      break;
    case "users":
      const user = new User();
      const users = await user.get();
      res.send({"result":users});
      break;
    case "transactions":
      const transaction = new Transactions();
      const transactions = await transaction.get();
      res.send(transactions);
      break;
    default:
      res.send("Invalid table found, try again")
  }
})

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
