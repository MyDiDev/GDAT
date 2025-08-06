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

  addAccount() {
    if (!this.uid || !this.balance || !this.type) return;
    addNewAccount(this.uid, this.balance, this.type);
  }

  deleteAccount(id) {
    if (!this.id) return;
    deleteAccount(id);
  }

  updateAccount(id) {
    if (!this.id || !this.uid || !this.balance || !this.type) return;
    updateAccount(id, this.uid, this.balance, this.type);
  }

  async get() {
    return await getAccounts();
  }
}
