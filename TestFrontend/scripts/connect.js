function goBackToHome() {
    window.location.href = "../pages/home.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "../pages/login.html";
        return;
    }

    if (isTokenExpired(jwtToken)) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("jwtToken");
        window.location.href = "../pages/login.html";
        return;
    }

    const decodedToken = jwtDecode(jwtToken);
    const userId = decodedToken.id;

    try {
        const response = await fetch(`http://localhost:3000/api/follows/not-following/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        const usersData = await response.json();
        if (response.ok) {
            displayUsers(usersData, "notFollowingList", jwtToken);
            const searchBar = document.getElementById("searchBar");
            searchBar.addEventListener("input", () => {
                const filteredUsers = usersData.filter(user =>
                    user.username.toLowerCase().includes(searchBar.value.toLowerCase())
                );
                displayUsers(filteredUsers, "notFollowingList", jwtToken);
            });
        } else {
            console.error("Failed to fetch users:", usersData.message);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
});

async function displayUsers(users, listElementId, jwtToken) {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = "";

    for (const user of users) {
        const userItem = document.createElement("div");
        userItem.classList.add("user-item");
        userItem.innerHTML = `
            <img src="http://localhost:3000/uploads/profiles/${user.profile_picture}" alt="${user.username}'s Profile Picture">
            <span class="username">${user.username}</span>
        `;
        userItem.querySelector(".username").addEventListener("click", () => {
            // Save the selected username to localStorage
            localStorage.setItem("viewUsername", user.username);
            // Redirect to viewUserProfile.html
            window.location.href = "../pages/viewUserProfile.html";
        });
        const followButton = document.createElement("button");
        followButton.classList.add("follow-btn");
        followButton.innerText = "Follow";
        followButton.addEventListener("click", async () => {
            await followUser(user.id, jwtToken, user.username);
            userItem.remove();
            location.reload();
        });

        userItem.appendChild(followButton);
        listElement.appendChild(userItem);
    }
}

async function followUser(followedId, jwtToken, username) {
    const decodedToken = jwtDecode(jwtToken);
    const followerId = decodedToken.id;

    try {
        const response = await fetch(`http://localhost:3000/api/follows`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ followerId, followedId }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Followed successfully.");
            alert(`You started following ${username}`);
        } else {
            console.error("Failed to follow:", result.message);
        }
    } catch (error) {
        console.error("Error following user:", error);
    }
}
