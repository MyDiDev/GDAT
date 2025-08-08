import { HOST, PASSWORD, USER, DATABASE, PORT } from "./secret.js";
import mysql from "mysql";

let conn = null;
export async function connectToDb() {
  try {
    conn = mysql.createConnection({
      host: HOST,
      port: PORT,
      user: USER,
      password: PASSWORD,
      database: DATABASE,
    });

    conn.connect((err) => {
      if (err) {
        if (err.code == "ECONNRESET")
          console.error(
            "Try and check if proxy or vpn is active, if so try again without it."
          );
        else if (err.code == "PROTOCOL_CONNECTION_LOST")
          console.error("Lost connection to db, try reconnecting again");
        throw err;
      }
      console.log("Database connected");
    });
  } catch (error) {
    console.error(`Expection while trying to connect to db: ${error}`);
  }
}

export function comparePassword(password, password_hash) {
  bcrypt.compare(password, password_hash, (err, result) => {
    if (err) throw err;
    return result;
  });
}

export async function authtenticateUser(name = "", email = "", password = "") {
  try {
    if (!conn) await connectToDb();
    return new Promise((resolve, reject) => {
      if (!(name || email) || !password)
        reject("Fields missing to authenticate user");
      let passwordHash = "";
      console.log("getting user");
      conn.query(
        "SELECT * FROM users WHERE username=? OR email=?",
        (err, result) => {
          if (err) reject(err);
          console.log("found user");
          passwordHash = result[0]?.password_hash;

          if (!passwordHash) reject("Invalid Password");
          resolve(result ? comparePassword(password, passwordHash) : false);
        }
      );
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function getUsers() {
  try {
    if (!conn) await connectToDb();
    return new Promise((resolve, reject) => {
      conn.query("CALL get_users()", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function getAccounts() {
  try {
    if (!conn) console.log("Couldn't find connection to MySQL.");
    return new Promise((resolve, reject) => {
      conn.query("CALL get_accounts()", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {
    console.log(error?.code);
    throw error;
  }
}

export async function getTransactions() {
  try {
    if (!conn) console.log("Couldn't find connection to MySQL.");
    return new Promise((resolve, reject) => {
      conn.query("CALL get_transactions()", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {}
}

async function getPasswordHash(name = "", email = "") {
  try {
    if (!conn) await connectToDb();
    if (!name && !email) {
      console.error(
        "Can not get password from user without either its username or email"
      );
      return;
    }

    return new Promise((resolve, reject) => {
      conn.query(
        "SELECT password_hash FROM users WHERE username=? OR email=?",
        [name, email],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]?.password_hash);
        }
      );
    });
  } catch (error) {
    if (error.message == "Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
  }
}

export async function getUserId(name = "", email = "") {
  try {
    if (!conn) await connectToDb();
    if (!(name && email)) {
      console.error("User fields missing to get id");
      return;
    }
    const passwordHash = await getPasswordHash(name, email);
    if (!passwordHash) return -1;

    return new Promise((resolve, reject) => {
      conn.query(
        "SELECT id FROM users WHERE username=? OR email=? AND password_hash=?",
        [name, email, passwordHash],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]?.id);
        }
      );
    });
  } catch (error) {
    if (error.message == "Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
  }
}

export async function addNewUser(name, email, password, role = "user") {
  try {
    if (!conn) await connectToDb();

    return new Promise((resolve, reject) => {
      if (!name || !email || !password || !role)
        console.error("User fields missing");
      conn.query(
        "CALL insert_user(?, ?, ?, ?)",
        [name, email, password, role],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {
    if (error.message == "Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
  }
}

export async function addNewTransaction(
  description,
  amount,
  accountId,
  state = "On Queque"
) {
  try {
    return new Promise((resolve, reject) => {
      if (!description || !amount || !accountId || !state)
        console.error("Transactions fields missing");
      conn.query(
        "CALL insert_transaction (?, ?, ?, ?)",
        [description, amount, accountId],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function addNewAccount(uid, amount, type) {
  try {
    if (!conn) await connectToDb();

    return new Promise((resolve, reject) => {
      if (!uid || !amount || !type) console.error("User fields missing");
      conn.query(
        "CALL insert_account(?, ?, ?)",
        [uid, amount, type],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function deleteUser(id) {
  if (!conn) await connectToDb();
  return new Promise((resolve, reject) => {
    try {
      if (!id) console.error("User.id missing");
      conn.query("CALL delete_user(?)", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function deleteTransaction(id) {
  try {
    if (!conn) connectToDb();
    return new Promise((resolve, reject) => {
      if (!id) reject("Transactions id missing");
      conn.query("CALL delete_transaction(?)", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function deleteAccount(id) {
  try {
    if (!conn) await connectToDb();
    return new Promise((resolve, reject) => {
      if (!id) reject("Account id missing");
      conn.query("CALL delete_account(?)", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  } catch (error) {
    if (error == "ReferenceError: Cannot access 'conn' before initialization") {
      console.error("DB not connected");
      return;
    }
    throw error;
  }
}

export async function updateUser(id, name, email, password, role = "user") {
  try {
    if (!conn) await connectToDb();
    return new Promise((resolve, reject) => {
      if (!id || !name || !email || !password || !role)
        console.error("User fields missing");
      conn.query(
        "CALL update_user (?, ?, ?, ?, ?)",
        [id, name, email, password, role],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {}
}

export async function updateTransaction(id, description, amount, state) {
  try {
    if (!conn) await connectToDb();
    return new Promise((resolve, reject) => {
      if (!id || !description || !amount || !state)
        reject("Transactions fields missing");
      conn.query(
        "CALL update_transaction (?, ?, ?, ?)",
        [id, description, amount, state],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {
    throw error;
  }
}

export async function updateAccount(id, uid, amount, type) {
  try {
    if (!conn) connectToDb();
    return new Promise((resolve, reject) => {
      if (!id || !uid || !amount || !type)
        reject("Account fields missing");
      conn.query(
        "CALL update_account(?, ?, ?, ?)",
        [id, uid, amount, type],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  } catch (error) {
    throw error;
  }
}

// addNewUser("user", "user@gmail.com", "0000", "admin");
updateUser(5, "user1", "user1@gmail.com", "1234", "user");
deleteUser(2);

const users = await getUsers();
console.log(users[0]);
