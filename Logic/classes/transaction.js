export class Transactions {
  constructor(description, amount, accountId) {
    this.description = description;
    this.amount = amount;
    this.accountId = accountId;
  }

  addTransaction () {
    if (!this.description || !this.amount || !this.accountId) return;
    // add transaction
  };

  deleteTransaction (id) {
    if (!this.id) return;
    // delete transaction
  };

  updateTransaction (id) {
    if (!this.id || !this.description || !this.amount || !this.accountId) return;
    // update transaction
  };

  get () {
    // query transactions
  };
}
