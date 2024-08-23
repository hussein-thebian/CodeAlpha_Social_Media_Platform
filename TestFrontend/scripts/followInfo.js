function goBackToProfile() {
    window.location.href = "../pages/profile.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "../pages/login.html";
        return;
    }

    // Ensure jwtDecode is defined
    if (typeof jwtDecode === "undefined") {
        console.error("jwtDecode is not available");
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
        // Fetch followers and display count
        const followersResponse = await fetch(`http://localhost:3000/api/follows/followers/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        const followersData = await followersResponse.json();

        if (followersResponse.ok) {
            document.getElementById("followerCount").innerText = `${followersData.length}`;
            displayUsers(followersData, "followersList", jwtToken);
        } else {
            console.error("Failed to fetch followers:", followersData.message);
        }

        // Fetch following and display count
        const followingResponse = await fetch(`http://localhost:3000/api/follows/following/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        const followingData = await followingResponse.json();

        if (followingResponse.ok) {
            document.getElementById("followingCount").innerText = `${followingData.length}`;
            displayUsers(followingData, "followingList", jwtToken);
        } else {
            console.error("Failed to fetch following:", followingData.message);
        }

    } catch (error) {
        console.error("Error fetching follow information:", error);
    }
});

async function displayUsers(usernames, listElementId, jwtToken) {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = ""; // Clear any existing content

    const decodedToken = jwtDecode(jwtToken);
    const userId = decodedToken.id;

    for (const user of usernames) {
        try {
            const userResponse = await fetch(`http://localhost:3000/api/users/name/${user.username}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const userData = await userResponse.json();
            if (userResponse.ok) {
                const userItem = document.createElement("div");
                userItem.classList.add("user-item");
                userItem.innerHTML = `
                    <img src="http://localhost:3000/uploads/profiles/${userData.profile_picture}" alt="${userData.username}'s Profile Picture">
                    <span class="username">${userData.username}</span>
                `;
                userItem.querySelector(".username").addEventListener("click", () => {
                    // Save the selected username to localStorage
                    localStorage.setItem("viewUsername", userData.username);
                    // Redirect to viewUserProfile.html
                    window.location.href = "../pages/viewUserProfile.html";
                });
                // Create Remove Follower button if in the followers list
                if (listElementId === "followersList") {
                    const removeButton = document.createElement("button");
                    removeButton.classList.add("remove-follower-btn");
                    removeButton.innerText = "Remove Follower";
                    removeButton.addEventListener("click", async () => {
                        await removeFollower(userData.id, userId, jwtToken);
                        userItem.remove(); // Remove the user from the list
                        location.reload();
                    });
                    userItem.appendChild(removeButton);
                }

                // Create Unfollow button if in the following list
                if (listElementId === "followingList") {
                    const unfollowButton = document.createElement("button");
                    unfollowButton.classList.add("unfollow-btn");
                    unfollowButton.innerText = "Unfollow";
                    unfollowButton.addEventListener("click", async () => {
                        await unfollowUser(userId, userData.id, jwtToken);
                        userItem.remove(); // Remove the user from the list
                        location.reload();
                    });
                    userItem.appendChild(unfollowButton);
                }

                listElement.appendChild(userItem);
            } else {
                console.error(`Failed to fetch user info for ${user.username}:`, userData.message);
            }
        } catch (error) {
            console.error(`Error fetching user info for ${user.username}:`, error);
        }
    }
}

async function removeFollower(followerId, followedId, jwtToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/follows`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ followerId, followedId }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Follower removed successfully.");
        } else {
            console.error("Failed to remove follower:", result.message);
        }
    } catch (error) {
        console.error("Error removing follower:", error);
    }
}

async function unfollowUser(followerId, followedId, jwtToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/follows`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ followerId, followedId }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Unfollowed successfully.");
        } else {
            console.error("Failed to unfollow:", result.message);
        }
    } catch (error) {
        console.error("Error unfollowing user:", error);
    }
}