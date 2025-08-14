import { User } from "../Logic/classes/user.js";
import { HOST, PASSWORD, USER, DATABASE, PORT } from "./secret.js";
import mysql from "mysql";
import bcrypt, { compare } from "bcrypt";
import { Account } from "../Logic/classes/account.js";
import { Transactions } from "../logic/classes/transaction.js";

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
      if (err && err.code == "ECONNRESET") {
        console.error(
          "VPN or Proxy might be blocking the connection to the DB."
        );
        console.warn("Retrying in 5 seconds...");
        setTimeout(async () => {
          await connectToDb();
        }, 5000);
      } else {
        console.log("Database connected");
      }
    });

    conn.on("error", async (err) => {
      console.error("DB error:", err.code);
      if (err.code == "PROTOCOL_CONNECTION_LOST") {
        console.log("Reconnecting to DB...");
        await connectToDb();
      }
      else if (err.code == "ECONNRESET") {
        console.error(
          "VPN or Proxy might be blocking the connection to the DB."
        );
        console.warn("Retrying in 5 seconds...");
        setTimeout(async () => {
          await connectToDb();
        }, 5000);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error(`Expection while trying to connect to db: ${error}`);
  }
}

export async function comparePassword(password, password_hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, password_hash, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

export async function authtenticateUser(name = "", email = "", password = "") {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!(name || email) || !password)
        reject(new Error("Fields missing to authenticate user"));
      console.log("Getting user...");
      conn.query(
        "SELECT * FROM users WHERE username=? OR email=?",
        [name, email],
        async (err, result) => {
          if (err) reject(err);
          console.log("Found user...");
          const passwordHash = result[0]?.password_hash;
          if (!passwordHash) reject(new Error("Invalid Password"));
          try {
            const res = await comparePassword(password, passwordHash);
            resolve(res ? result : false);
          } catch (error) {
            resolve(false);
          }
        }
      );
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function getUsers() {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      conn.query("CALL get_users()", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function getAccounts() {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      conn.query("CALL get_accounts()", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    } catch (error) {
      reject(error.message);
    }
  });
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
        reject(new Error("User fields missing"));
      conn.query(
        "CALL insert_user(?, ?, ?, ?)",
        [name, email, password, role],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    });
  } catch (error) {
    throw error.message;
  }
}

export async function addNewTransaction(
  description,
  amount,
  accountId,
  state = "On Queque",
  type
) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!description || !amount || !accountId || !state || !type)
        reject(new Error("Transactions fields missing"));
      conn.query(
        "CALL insert_transaction (?, ?, ?, ?, ?)",
        [accountId, description, amount, state, type],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function addNewAccount(uid, balance, type) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    try {
      if (!uid || !balance || !type) reject(new Error("Account fields missing"));
      conn.query(
        "CALL insert_account(?, ?, ?)",
        [uid, balance, type],
        (err, result) => {
          console.log(uid, balance, type);
          if (err) reject(err);
          console.log(result);
          resolve(result[0]);
        }
      );
    } catch (error) {
      console.log("ERROR HERE")
      reject(error.message);
    }
  });
}

export async function deleteUser(id) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    try {
      if (!id) reject(new Error("User.id missing"));
      conn.query("CALL delete_user(?)", [id], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function deleteTransaction(id) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }

  return new Promise((resolve, reject) => {
    try {
      if (!id) reject(new Error("Transactions id missing"));
      conn.query("CALL delete_transaction(?)", [id], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function deleteAccount(id, uid) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!id || !uid) reject(new Error("Account or user ID missing"));
      conn.query("CALL delete_account(?, ?)", [id, uid], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function updateUser(id, name, email, password, role = "user") {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!id || !name || !email || !password || !role)
        reject(new Error("User fields missing"));
      conn.query(
        "CALL update_user (?, ?, ?, ?, ?)",
        [id, name, email, password, role],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function updateTransaction(id, description, amount, state, type) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!id || !description || !amount || !state || !type)
        reject(new Error("Transactions fields missing"));
      conn.query(
        "CALL update_transaction (?, ?, ?, ?, ?)",
        [id, description, amount, state, type],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    } catch (error) {
      reject(error.message);
    }
  });
}

export async function updateAccount(id, uid, amount, type) {
  try {
    if (!conn) await connectToDb();
  } catch (error) {
    throw new Error(`Error while trying to connect to db: ${error.message}`);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!id || !uid || !amount || !type)
        reject(new Error("Account fields missing"));
      conn.query(
        "CALL update_account(?, ?, ?, ?)",
        [id, uid, amount, type],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    } catch (error) {
      reject(error.message);
    }
  });
}
