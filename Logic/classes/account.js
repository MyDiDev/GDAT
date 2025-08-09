import {
  getAccounts,
  addNewAccount,
  deleteAccount,
  updateAccount,
} from "../../db/connection.js";

export class Account {
  constructor(uid, balance, type) {
    this.uid = uid;
    this.balance = balance;
    this.type = type;
  }

  async addAccount() {
    return await addNewAccount(this.uid, this.balance, this.type);
  }

  async deleteAccount(id) {
    return await deleteAccount(id, this.uid);
  }

  async updateAccount(id) {
    return await updateAccount(id, this.uid, this.balance, this.type);
  }

  async get() {
    return await getAccounts();
  }
}
