import {
  getTransactions,
  addNewTransaction,
  deleteTransaction,
  updateTransaction,
} from "../../db/connection.js";

export class Transactions {
  constructor(description, amount, accountId, state, type) {
    this.description = description;
    this.amount = amount;
    this.accountId = accountId;
    this.state = state ?? "On Queque";
    this.type = type;
  }

  async addTransaction() {
    return await addNewTransaction(this.description, this.amount, this.accountId, this.state, this.type)?.result;
  }

  async deleteTransaction(id) {
    return await deleteTransaction(id)?.result;
  }

  async updateTransaction(id) {
    return await updateTransaction(id, this.description, this.amount, this.state, this.type)?.result;
  }

  async get() {
    return await getTransactions();
  }
}
