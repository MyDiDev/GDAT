export class User{
    constructor(username, password, email){
        this.name = username;
        this.password = password;
        this.email = email;
    }

    addUser = () => {
        if (!this.name || !this.password || !this.email){
            return;
        }
        // continue with logic
    }

    auth = () => {
        if (!(this.name || this.email) || !this.password){

        }
        // continue with auth logic
    }
}
