import {
  getTransactions,
  addNewTransaction,
  deleteTransaction,
  updateTransaction,
} from "../../db/connection.js";

export class Transactions {
  constructor(description, amount, accountId, state) {
    this.description = description;
    this.amount = amount;
    this.accountId = accountId;
    this.state = state ?? "On Queque";
  }

  addTransaction() {
    if (!this.description || !this.amount || !this.accountId || !this.state)
      return;
    addNewTransaction(this.description, this.amount, this.state);
  }

  deleteTransaction(id) {
    if (!this.id) return;
    deleteTransaction(id);
  }

  updateTransaction(id) {
    if (!this.id || !this.description || !this.amount || !this.state) return;
    updateTransaction(id, this.description, this.amount, this.state);
  }

  async get() {
    return await getTransactions();
  }
}
