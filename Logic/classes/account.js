import {
  getAccounts,
  addNewAccount,
  deleteAccount,
  updateAccount,
  getAccountID,
} from "../../db/connection.js";

export class Account {
  constructor(uid, balance, type) {
    this.uid = uid;
    this.balance = balance;
    this.type = type;
  }

  async addAccount() {
    return await addNewAccount(this.uid, this.balance, this.type)?.result;
  }

  async deleteAccount(id) {
    return await deleteAccount(id, this.uid)?.result;
  }

  async updateAccount(id) {
    return await updateAccount(id, this.uid, this.balance, this.type);
  }

  async get() {
    return await getAccounts();
  }

  async getID() {
    return await getAccountID(this.uid);
  }
}
