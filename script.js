document.addEventListener('DOMContentLoaded', function () {
    let toggle = document.querySelector('.toggle');
    let nav = document.querySelector('header nav');

    toggle.addEventListener('click', function () {
        this.classList.toggle('active');
        nav.classList.toggle('active');
    });
});