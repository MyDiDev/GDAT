import {
  addNewUser,
  deleteUser,
  updateUser,
  getUsers,
  authtenticateUser,
  getUserId,
  addNewTransaction
} from "../../db/connection.js";
import bcrypt from "bcrypt";

function encryptPassword(password) {
  let pwdHash = null;
  bcrypt.genSalt(15, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      pwdHash = hash;
    });
  });
  return pwdHash;
}

export class User {
  constructor(username, email, password, role) {
    this.name = username;
    // this.password = bcrypt.hashSync(password, 15) ? password : null;
    this.email = email;
    this.role = role ?? "user";
  }

  addUser() {
    console.log(this.name, this.password, this.email, this.role);
    if (!this.name || !this.password || !this.email || !this.role) {
      console.error("Parameters missing in user class to create it");
      return;
    }
    addNewUser(this.name, this.email, this.password, this.role);
  }

  deleteUser(id) {
    if (!id) {
      console.error("ID missing");
      return;
    }
    deleteUser(id);
  }

  updateUser(id) {
    if (!id || !this.name || !this.password || !this.email) return;
    updateUser(id, this.name, this.email, this.password, this.role);
  }

  async get() {
    return await getUsers();
  }

  auth() {
    if (!(this.name || this.email) || !this.password) return;
    authtenticateUser(this.name, this.email, this.password);
  }

  async getId(){
    return await getUserId(this.name, this.email)
  }

  generatePayload(uid){
    const userObject = {
      id: uid ?? getUserId(this.name, this.email, this.password),
      name: this.name,
      role: this.role
    }
    return userObject;
  }
}