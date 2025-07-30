import { User } from "./user";

const form = document.querySelector('form');
form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    console.log(formData);
});

function addNewUser(){

}