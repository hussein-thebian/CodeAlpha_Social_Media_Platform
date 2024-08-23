document.addEventListener("DOMContentLoaded", async () => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "../pages/login.html"; // Redirect to login if no token
        return;
    }

    if (isTokenExpired(jwtToken)) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("jwtToken"); // Remove the expired token
        window.location.href = "../pages/login.html"; // Redirect to login
        return;
    }

    // Decode JWT to get user ID
    const decodedToken = jwtDecode(jwtToken);
    const userId = decodedToken.id; // Assuming the token contains an 'id' field

    try {
        // Fetch user data
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            // Populate form fields with user data
            document.getElementById("currentProfilePic").src = `http://localhost:3000/uploads/profiles/${data.profile_picture}`;
            document.getElementById("username").value = data.username;
            document.getElementById("gender").value = data.gender;
            document.getElementById("birthdate").value = data.birthdate;
            document.getElementById("bio").value = data.bio;
            document.getElementById("email").innerText = data.email;

            // Format and display the birthdate
            const birthdate = new Date(data.birthdate);
            const formattedDate = `${birthdate
                .getDate()
                .toString()
                .padStart(2, "0")}/${(birthdate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${birthdate.getFullYear()}`;
            document.getElementById("birthdate-display").innerText = `Birthdate: ${formattedDate}`;
        } else {
            console.error("Failed to fetch user data:", data.message);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    // Show Password Functionality
    document.getElementById("showPassword").addEventListener("change", function() {
        const passwordInput = document.getElementById("password");
        passwordInput.type = this.checked ? "text" : "password";
    });

    // Handle form submission
    document.getElementById("updateProfileForm").addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Sanitize input values
        const username = DOMPurify.sanitize(document.getElementById("username").value);
        const password = DOMPurify.sanitize(document.getElementById("password").value);
        const gender = DOMPurify.sanitize(document.getElementById("gender").value);
        const birthdate = DOMPurify.sanitize(document.getElementById("birthdate").value);
        const bio = DOMPurify.sanitize(document.getElementById("bio").value);

        const formData = new FormData();

        // Add only non-empty fields to formData
        if (username) formData.append("username", username);
        if (password) formData.append("password", password);
        if (gender) formData.append("gender", gender);
        if (birthdate) formData.append("birthdate", birthdate);
        if (bio) formData.append("bio", bio);

        const profilePicture = document.getElementById("profile_picture").files[0];
        if (profilePicture) {
            formData.append("profile_picture", profilePicture);
        }

        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                window.location.href = "../pages/profile.html"; // Redirect to profile page
            } else {
                alert(data.message || "An error occurred while updating the profile.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while updating the profile.");
        }
    });
});
function goBackToProfile() {
    window.location.href = "../pages/profile.html";
}
