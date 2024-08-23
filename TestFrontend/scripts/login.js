const DOMPurify = window.DOMPurify || require('dompurify');

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    // Sanitize inputs
    email = DOMPurify.sanitize(email);
    password = DOMPurify.sanitize(password);

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT token in localStorage
            localStorage.setItem('jwtToken', data.token);
            // Redirect to the home page or dashboard
            window.location.href = '../pages/home.html'; // Adjust the path as needed
        } else {
            // Display error message
            document.getElementById('errorMessage').innerText = data.message;
            document.getElementById('errorMessage').classList.remove('hidden');
        }
    } catch (error) {
        document.getElementById('errorMessage').innerText = 'An unexpected error occurred.';
        document.getElementById('errorMessage').classList.remove('hidden');
    }
});
