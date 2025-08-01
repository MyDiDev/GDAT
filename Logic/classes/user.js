export class User{
    constructor(username, secondName, password, email){
        this.name = username;
        this.secondName = secondName;
        this.password = password;
        this.email = email;
    }

    addUser() {
        if (!this.name || !this.secondName || !this.password || !this.email)
            return;
        // add user
    }

    deleteUser (id) {
        if (!this.id)
            return;
        // delete user
    }

    updateUser (id) {
        if (!this.id || !this.name || !this.password || !this.email)
            return;
        // update user
    }

    get () {
        // query users
    }

    auth () {
        if (!(this.name || this.email) || !this.password)
            return;
        // authenticate user
    }
}
