export class Account{
    constructor(uid, amount, type){
        this.uid = uid;
        this.amount = amount;
        this.type = type;
    }

    addAccount() {
        if (!this.uid || !this.amount || !this.type)
            return;
        // add acount
    }

    deleteAccount(id) {
        if (!this.id)
            return;
        // delete account
    }

    updateAccount(id) {
        if (!this.id || !this.uid || !this.amount || !this.type)
            return;
        // update account
    } 

    get(){
        // query accounts
    }


}