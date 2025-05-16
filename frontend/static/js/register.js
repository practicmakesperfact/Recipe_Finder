document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        axios.post('/Recipes/users/', { username, email, password })
            .then(response => {
                alert('Registration successful! Please login.');
                window.location.href = '/login/';
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Error during registration');
            });
    });
});