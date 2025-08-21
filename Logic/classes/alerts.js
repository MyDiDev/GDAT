import {
  getAccounts,
  addNewAccount,
  deleteAccount,
  updateAccount,
  getAccountID,
} from "../../db/connection.js";

export class Alert {
  constructor(uid, transactionID, description) {
    this.uid = uid;
    this.transactionID = balance;
    this.description = description;
  }

  async addAlert() {
    return await addNewAccount(this.uid, this.balance, this.type)?.result;
  }

  async deleterAlert(id) {
    return await deleteAccount(id, this.uid)?.result;
  }

  async updateAlert(id) {
    return await updateAccount(id, this.uid, this.balance, this.type);
  }

  async get() {
    return await getAccounts();
  }

  async getID() {
    return await getAccountID(this.uid, this.transactionID);
  }
}
