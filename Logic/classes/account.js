import {
  getAccounts,
  addNewAccount,
  deleteAccount,
  updateAccount,
} from "../../DB/connection.js";

export class Account {
  constructor(uid, amount, type) {
    this.uid = uid;
    this.amount = amount;
    this.type = type;
  }

  addAccount() {
    if (!this.uid || !this.amount || !this.type) return;
    addNewAccount(this.uid, this.amount, this.type);
  }

  deleteAccount(id) {
    if (!this.id) return;
    deleteAccount(id);
  }

  updateAccount(id) {
    if (!this.id || !this.uid || !this.amount || !this.type) return;
    updateAccount(id, this.uid, this.amount, this.type);
  }

  get() {
    return getAccounts();
  }
}
