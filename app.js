import express from "express";
import cors from "cors";
import { connectToDb, getUserId } from "./db/connection.js";
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
  // if (!token) {
  //   return res.status(404).json({ error: "Invalid token to contact API" });
  // }
  // const decode = await decodeToken(token);
  // console.log(decode);
  // const role = decode?.role;

  // if (role != "admin") {
  //   return res.status(404).json({ error: "Invalid role to contact API" });
  // }

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

app.post("/api/data/auth", async (req, res) => {
  const name = sanitize(req.body?.name);
  const email = req.body?.name;
  const password = sanitize(req.body?.password);

  const user = new User(name, email);
  try {
    const result = await user.auth(password);
    if (!result) res.json({ result: false });
    else res.json({ result: true, data: result });
  } catch (error) {
    console.error(error.message);
    return res.json({ result: false });
  }
});

app.post("/api/data/add/user", async (req, res) => {
  console.log(req.body);
  const name = sanitize(req.body?.name);
  const email = req.body?.email;
  const password = sanitize(req.body?.password);

  const user = new User(name, email, password, "user");
  const result = await user.addUser();

  if (result) res.json({ result: result });
  else res.json({ result: "Could not add User." });
});

app.post("/api/data/add/account", async (req, res) => {
  console.log(req.body);
  const email = req.body?.email;
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.accType);

  const uid = await getUserId(email, email);
  const account = new Account(uid, balance, accType);
  const result = await account.addAccount();

  if (result) res.json({ result: result });
  else res.json({ result: "Could not add Account." });
});

app.post("/api/data/add/transaction", async (req, res) => {
  console.log(req.body);
  const name = sanitize(req.body?.name);
  const email = req.body?.email;
  const password = sanitize(req.body?.password);

  const user = new User(name, email, password, "user");
  const result = await user.addUser();

  if (result) res.json({ result: result });
  else res.json({ result: "Could not add User." });
});

app.post("/api/data/update/user", async (req, res) => {
  console.log(req.body);
  const id = Number(req.body?.id);
  const name = sanitize(req.body?.name);
  const email = req.body?.email;
  const password = sanitize(req.body?.password);

  const user = new User(name, email, password, "user");
  const result = await user.updateUser(id);

  if (result) res.json({ result: result });
  else res.json({ result: "Could not modify User." });
});

app.post("/api/data/update/account", async (req, res) => {
  console.log(req.body);
  const id = Number(req.body?.id);
  const email = req.body?.email;
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.accType);

  const uid = await getUserId(email, email);
  const account = new Account(uid, balance, accType);
  const result = await account.updateAccount(id);
  console.log(result);
  if (result) res.json({ result: result });
  else res.json({ result: "Could not modify Account." });
});

app.post("/api/data/update/transaction", async (req, res) => {
  console.log(req.body);
  const id = req.body?.id;  
  const transaction = new Transactions();
  const result = await transaction.updateTransaction(id);

  if (result) res.json({ result: result });
  else res.json({ result: "Could not add User." });
});

app.post("/api/data/delete/user", async (req, res) => {
  console.log(req.body);
  const id = Number(req.body?.id);
  const user = new User();
  const result = await user.deleteUser(id);

  if (result) res.json({ result: result });
  else res.json({ result: "Could not delete User." });
});

app.post("/api/data/delete/account", async (req, res) => {
  console.log(req.body);
  const id = Number(req.body?.id);
  const email = req.body?.email;

  const uid = await getUserId(email, email);
  const account = new Account(uid);
  const result = await account.deleteAccount(id);
  if (result) res.json({ result: result });
  else res.json({ result: "Could not delete Account." });
});

app.post("/api/data/delete/transaction", async (req, res) => {
  console.log(req.body);
  try {
    const id = Number(req.body?.id);
    const transaction = new Transactions();
    const result = await transaction.deleteTransaction(id);

    if (result) res.json({ result: result });
    else res.json({ result: "Could not delete Transaction." });
  } catch (error) {
    console.error(error.message);
    res.json({
      result: "Could not delete Transaction cause of an unknown error",
    });
  }
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
      res.redirect("/dashboard/home");
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
      if (role == "admin") return res.redirect("/dashboard/home");
      else return res.redirect("/home");
    }

    const name = sanitize(req.body.name);
    const password = sanitize(req.body.password);
    const response = await fetch(`${APIURL}/api/data/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }),
    });
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
      console.log("token created:", token);
      if (!token) {
        console.error("Invalid token, try login process again");
        return res.redirect("/login?error=Invalid+Session+Try+again");
      }
      if (user.role == "admin") return res.redirect("/dashboard/home");
      return res.redirect("/home");
    } else {
      console.log("Failed login, redirecting...");
      return res.redirect("/login?error=Invalid+credentials");
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
      res.redirect("/dashboard/home");
      return;
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
      return res.redirect("/dashboard/home");
    }
    return res.redirect("/home");
  }

  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    const response = await fetch(`${APIURL}/api/data/add/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    console.log(response.ok, data);
    if (response.ok && data.result && data.result != "Could not add User.") {
      return res.redirect("/login");
    } else return res.redirect("/register?error=Invalid+Credentials");
  } catch (error) {
    console.error("Error while trying to register:", error.message);
    return res.redirect("/register?error=Invalid+Credentials");
  }
});

app.get("/dashboard/home", async (req, res) => {
  if (!token)
    return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin")
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.sendFile(path.join(__dirname, "views", "Dashboard", "index.html"));
});

app.get("/dashboard/users", async (req, res) => {
  if (!token)
    return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin")
    return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.sendFile(path.join(__dirname, "views", "Dashboard", "users.html"));
});

app.post("/dashboard/add/user", async (req, res) => {
  try {
    const name = sanitize(req.body?.name);
    const email = req.body?.email;
    const password = req.body?.password;

    const response = await fetch(`${APIURL}/api/data/add/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = response.ok ? await response.json() : null;
    if (!data)
      return res.redirect("/dashboard/users?error=Could+Not+register+user");
    return res.redirect("/dashboard/users");
  } catch (error) {
    console.error(error.message);
    return;
  }
});

app.post("/dashboard/update/user", async (req, res) => {
  try {
    const id = req.body?.id;
    const name = sanitize(req.body?.name);
    const email = req.body?.email;
    const password = req.body?.password;

    const response = await fetch(`${APIURL}/api/data/update/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, email, password }),
    });
    const data = response.ok ? await response.json() : null;
    if (!data)
      return res.redirect("/dashboard/users?error=Could+Not+modify+user");
    return res.redirect("/dashboard/users");
  } catch (error) {
    console.error(error.message);
    return;
  }
});

app.post("/dashboard/delete/user", async (req, res) => {
  try {
    const id = req.body?.id;

    const response = await fetch(`${APIURL}/api/data/delete/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const data = response.ok ? await response.json() : null;
    if (!data)
      return res.redirect("/dashboard/users?error=Could+Not+delete+user");
    return res.redirect("/dashboard/users");
  } catch (error) {
    console.error(error.message);
    return;
  }
});

app.get("/dashboard/accounts", async (req, res) => {
  if (!token) return res.json({ error: "Invalid token found" });
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin") return res.json({ error: "Invalid User" });

  res.sendFile(path.join(__dirname, "views", "Dashboard", "accounts.html"));
});

app.post("/dashboard/add/account", async (req, res) => {
  if (!token) return res.json({ error: "Invalid token found" });
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin") return res.json({ error: "Invalid User" });

  const email = req.body?.email;
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.accountType);
  console.log(email, balance, accType);
  const result = await fetch(`${APIURL}/api/data/add/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, balance, accType }),
  });

  if (result.ok && result.result != "Could not add Account")
    return res.redirect("/dashboard/accounts");
  else return res.redirect("/dashboard/accounts?error=Could+not+add+Account");
});

app.post("/dashboard/update/account", async (req, res) => {
  if (!token) return res.json({ error: "Invalid token found" });
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin") return res.json({ error: "Invalid User" });
  
  const id = Number(req.body?.id);
  const email = req.body?.email;
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.accountType);

  console.log(email, balance, accType);
  const result = await fetch(`${APIURL}/api/data/update/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, email, balance, accType }),
  });

  if (result.ok && result.result != "Could not modify Account")
    return res.redirect("/dashboard/accounts");
  else
    return res.redirect("/dashboard/accounts?error=Could+not+modify+Account");
});

app.post("/dashboard/delete/account", async (req, res) => {
  try {
    if (!token) return res.json({ error: "Invalid token found" });
    const decode = await decodeToken(token);
    const role = decode.role;
    if (role != "admin") return res.json({ error: "Invalid User" });

    const id = req.body?.id;
    const email = req.body?.email;

    const response = await fetch(`${APIURL}/api/data/delete/account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, email }),
    });
    const data = response.ok ? await response.json() : null;
    if (!data)
      return res.redirect("/dashboard/users?error=Could+Not+delete+account");
    return res.redirect("/dashboard/accounts");
  } catch (error) {
    console.error(error.message);
    return;
  }
});

app.get("/dashboard/transactions", async (req, res) => {
  if (!token)
    return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin")
    return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.sendFile(path.join(__dirname, "views", "Dashboard", "transactions.html"));
});

app.post("/dashboard/add/transaction", async (req, res) => {
  if (!token) return res.json({ error: "Invalid token found" });
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin") return res.json({ error: "Invalid User" });

  const email = sanitize(req.body?.email);
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.type);

  const result = await fetch(`${APIURL}/api/data/add/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, balance, accType }),
  });

  if (result.ok && result.result != "Could not add Transaction")
    return res.redirect("/dashboard/transactions");
  else
    return res.redirect(
      "/dashboard/transactions?error=Could+not+add+Transaction"
    );
});

app.post("/dashboard/update/transaction", async (req, res) => {
  if (!token) return res.json({ error: "Invalid token found" });
  const decode = await decodeToken(token);
  const role = decode.role;
  if (role != "admin") return res.json({ error: "Invalid User" });

  const email = sanitize(req.body?.email);
  const balance = Number(req.body?.balance);
  const accType = sanitize(req.body?.type);

  const result = await fetch(`${APIURL}/api/data/update/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, balance, accType }),
  });

  if (result.ok && result.result != "Could not add Transaction")
    return res.redirect("/dashboard/transactions");
  else
    return res.redirect(
      "/dashboard/transactions?error=Could+not+add+Transaction"
    );
});

app.post("/dashboard/delete/transaction", async (req, res) => {
  try {
    const id = req.body?.id;

    const response = await fetch(`${APIURL}/api/data/delete/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const data = response.ok ? await response.json() : null;
    if (!data)
      return res.redirect(
        "/dashboard/users?error=Could+Not+delete+transaction"
      );
    return res.redirect("/dashboard/transactions");
  } catch (error) {
    console.error(error.message);
    return;
  }
});

// User
app.get("/home", (req, res) => {
  if (!token) {
    return res.redirect("/login?error=Invalid+Session+Found");
  }
  const decode = decodeToken(token);
  const role = decode.role;
  if (role == "admin") res.redirect("/dashboard/home");
  else res.sendFile(path.join(__dirname, "views", "UI", "index.html"));
});

app.get("/forms/deposit", (req, res) => {
  if (!token) {
    return res.redirect("/login?error=Invalid+Session+Found");
  }
  const decode = decodeToken(token);
  const role = decode.role;
  if (role == "admin") res.redirect("/dashboard/home");
  res.sendFile(path.join(__dirname, "views", "UI", "deposit.html"));
});

app.get("/forms/withdraw", (req, res) => {
  if (!token) {
    return res.redirect("/login?error=Invalid+Session+Found");
  }
  const decode = decodeToken(token);
  const role = decode.role;
  if (role == "admin") res.redirect("/dashboard/home");
  res.sendFile(path.join(__dirname, "views", "UI", "withdraw.html"));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => {
  console.log("App running on localhost:3000");
});
