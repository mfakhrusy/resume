document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Console Greeting
    console.log(
        "%c Hello! Thanks for checking out the code. ",
        "background: #2980b9; color: #fff; padding: 4px; border-radius: 4px;"
    );

    // Optional: Add simple fade-in for elements on scroll could be added here
    // But CSS animation covers the hero load.
});
