document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Sanitize input values
        const username = DOMPurify.sanitize(document.getElementById('username').value);
        const email = DOMPurify.sanitize(document.getElementById('email').value);
        const password = DOMPurify.sanitize(document.getElementById('password').value);
        const gender = DOMPurify.sanitize(document.getElementById('gender').value);
        const birthdate = DOMPurify.sanitize(document.getElementById('birthdate').value);
        const bio = DOMPurify.sanitize(document.getElementById('bio').value);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('gender', gender);
        formData.append('birthdate', birthdate);
        formData.append('bio', bio);
        formData.append('profile_picture', document.getElementById('profile_picture').files[0]);

        try {
            const response = await fetch('http://localhost:3000/api/users/add', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                window.location.href = '../pages/login.html'; 
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while registering.');
        }
    });
});
