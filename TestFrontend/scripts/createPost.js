function goBackToProfile() {
    window.location.href = "../pages/profile.html";
}

document.addEventListener("DOMContentLoaded", async () => {

    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "../pages/login.html"; // Redirect to login if no token
        return;
    }

    if (typeof jwtDecode === "undefined") {
        console.error("jwtDecode is not available");
        return;
    }

    if (isTokenExpired(jwtToken)) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("jwtToken"); // Remove the expired token
        window.location.href = "../pages/login.html"; // Redirect to login
        return;
    }

    const createPostForm = document.getElementById("createPostForm");

    createPostForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(createPostForm);
        const sanitizedTitle = DOMPurify.sanitize(formData.get("title"));
        const sanitizedContent = DOMPurify.sanitize(formData.get("content"));
        const sanitizedTags = DOMPurify.sanitize(formData.get("tags"));
        const sanitizedLocation = DOMPurify.sanitize(formData.get("location"));

        formData.set("title", sanitizedTitle);
        formData.set("content", sanitizedContent);
        formData.set("tags", sanitizedTags);
        formData.set("location", sanitizedLocation);

        try {
            const decodedToken = jwtDecode(jwtToken);
            console.log("Decoded Token:", decodedToken);
            const userId = decodedToken.id;
            formData.append("user_id", userId);

            const response = await fetch("http://localhost:3000/api/posts/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                const postData = await response.json();
                alert("Post created successfully!");
                window.location.href = "../pages/profile.html"; // Redirect to profile page
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    });
});
