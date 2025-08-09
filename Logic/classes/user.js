import {
  addNewUser,
  deleteUser,
  updateUser,
  getUsers,
  authtenticateUser,
  getUserId,
} from "../../db/connection.js";
import bcrypt, { hashSync } from "bcrypt";

// async function encryptPassword(password) {
//   return new Promise((resolve, reject) => {
//     bcrypt.genSalt(15, (err, salt) => {
//       if (err) reject(err);
//       bcrypt.hash(password, salt, (err, hash) => {
//         if (err) reject(err);
//         resolve(hash);
//       });
//     });
//   });
// }

export class User {
  constructor(username, email, password, role) {
    this.name = username;
    this.password = hashSync(password, 15);
    this.email = email;
    this.role = role ?? "user";
  }

  async addUser() {
    const res = await addNewUser(this.name, this.email, this.password, this.role);
    return res[0]?.result; 
  }

  async deleteUser(id) {
    const res = await deleteUser(id);
    return res[0]?.result;
  }

  async updateUser(id) {
    const res = await updateUser(id, this.name, this.email, this.password, this.role);
    return res[0]?.result;
  }

  async get() {
    return await getUsers();
  }

  async auth() {
    if (!(this.name || this.email) || !this.password) return;
    return await authtenticateUser(this.name, this.email, this.password);
  }

  async getId() {
    return await getUserId(this.name, this.email);
  }

  generatePayload(uid) {
    const userObject = {
      id: uid ?? getUserId(this.name, this.email, this.password),
      name: this.name,
      role: this.role,
    };
    return userObject;
  }
}
