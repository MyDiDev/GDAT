const form = document.querySelector("form");
form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    console.log(data);
});
