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

    const postId = localStorage.getItem('selectedPostId');
    if (!postId) {
        console.error("No post ID found");
        return;
    }

    try {
        // Fetch the post image and display it
        const postResponse = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        const postData = await postResponse.json();
        if (postResponse.ok) {
            const postImage = document.getElementById("postImage"); // Ensure you have an element with this ID
            if (postData.photo) {
                postImage.src = `http://localhost:3000/uploads/posts/${postData.photo}`;
            } else {
                postImage.src = "../assets/blank.jpg";
            }
            document.getElementById("postCaption").innerText = postData.content;
            document.getElementById("backButton").addEventListener("click", () => {
                goBack(); // postData.user_id is the post owner's ID
            });
        } else {
            console.error("Failed to fetch post:", postData.message);
        }

        // Fetch the likes and display count
        const likesResponse = await fetch(`http://localhost:3000/api/likes/post/${postId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        const likesData = await likesResponse.json();
        if (likesResponse.ok) {
            document.getElementById("likeCount").innerText = `${likesData.likeCount}`;
            displayUsers(likesData.likes, "likesList", jwtToken);
        } else {
            console.error("Failed to fetch likes:", likesData.message);
        }

        // Fetch the comments and display count
        const commentsResponse = await fetch(`http://localhost:3000/api/comments/${postId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        const commentsData = await commentsResponse.json();
        if (commentsResponse.ok) {
            document.getElementById("commentCount").innerText = `${commentsData.commentCount}`;
            displayComments(commentsData.comments, "commentsList", jwtToken);
        } else {
            console.error("Failed to fetch comments:", commentsData.message);
        }

    } catch (error) {
        console.error("Error fetching post information:", error);
    }
});

async function displayUsers(userIds, listElementId, jwtToken) {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = ""; // Clear any existing content

    if (userIds.length === 0) {
        const noLikesMessage = document.createElement("div");
        noLikesMessage.innerText = "NO LIKES FOUND";
        noLikesMessage.style.textAlign = "center";
        noLikesMessage.style.fontWeight = "bold";
        listElement.appendChild(noLikesMessage);
        return;
    }

    for (const id of userIds) {
        try {
            const userResponse = await fetch(`http://localhost:3000/api/users/${id.user_id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const user = await userResponse.json();
            if (userResponse.ok) {
                const userItem = document.createElement("div");
                userItem.classList.add("user-item");
                userItem.innerHTML = `
                    <img src="http://localhost:3000/uploads/profiles/${user.profile_picture}" alt="${user.username}'s Profile Picture">
                    <span class="username">${user.username}</span>
                `;
                listElement.appendChild(userItem);

                 // Add event listener for username click
                 userItem.querySelector(".username").addEventListener("click", () => {
                    const jwtToken = localStorage.getItem("jwtToken"); // Assuming the JWT is stored in localStorage
                    const decodedToken = jwtDecode(jwtToken);
                    const currentUserId = decodedToken.id;

                    if (user.id === currentUserId) {
                        // Redirect to profile.html if the clicked user is the current user
                        window.location.href = "../pages/profile.html";
                    } else {
                        // Save the selected username to localStorage
                        localStorage.setItem("viewUsername", user.username);
                        // Redirect to viewUserProfile.html
                        window.location.href = "../pages/viewUserProfile.html";
                    }
                });

            } else {
                console.error(`Failed to fetch user info for user ID: ${id.user_id}`, user.message);
            }
        } catch (error) {
            console.error(`Error fetching user info for user ID: ${id.user_id}`, error);
        }
    }
}

async function displayComments(comments, listElementId, jwtToken) {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = ""; // Clear any existing content

    if (Array.isArray(comments) && comments.length > 0) {
        for (const comment of comments) {
            try {
                const userResponse = await fetch(`http://localhost:3000/api/users/${comment.user_id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });

                const user = await userResponse.json();
                if (userResponse.ok) {
                    const commentItem = document.createElement("div");
                    commentItem.classList.add("comment-item");
                    commentItem.innerHTML = `
                        <img src="http://localhost:3000/uploads/profiles/${user.profile_picture}" alt="${user.username}'s Profile Picture">
                        <div class="comment-content">
                            <span class="comment-username">${user.username}:</span>
                            <span class="comment-text">${DOMPurify.sanitize(comment.content)}</span>
                            <span class="comment-delete">${user.id === jwtDecode(jwtToken).id ? '<button class="delete-comment-button">&#128465;</button>' : ''}</span>
                        </div>
                    `;

                    listElement.appendChild(commentItem);
                    commentItem.querySelector(".comment-username").addEventListener("click", () => {
                        const jwtToken = localStorage.getItem("jwtToken"); // Assuming the JWT is stored in localStorage
                        const decodedToken = jwtDecode(jwtToken);
                        const currentUserId = decodedToken.id;
    
                        if (user.id === currentUserId) {
                            // Redirect to profile.html if the clicked user is the current user
                            window.location.href = "../pages/profile.html";
                        } else {
                            // Save the selected username to localStorage
                            localStorage.setItem("viewUsername", user.username);
                            // Redirect to viewUserProfile.html
                            window.location.href = "../pages/viewUserProfile.html";
                        }
                    });
                    // Attach delete button functionality
                    if (user.id === jwtDecode(jwtToken).id) {
                        const deleteButton = commentItem.querySelector(".delete-comment-button");
                        deleteButton.addEventListener("click", async () => {
                            await handleDeleteComment(comment.id);
                        });
                    }
                } else {
                    console.error(`Failed to fetch user info for user ID: ${comment.user_id}`, user.message);
                }
            } catch (error) {
                console.error(`Error fetching user info for user ID: ${comment.user_id}`, error);
            }
        }
    } else {
        const noCommentsMessage = document.createElement("div");
        noCommentsMessage.classList.add("no-comments");
        noCommentsMessage.innerText = "NO COMMENTS FOUND";
        listElement.appendChild(noCommentsMessage);
    }
}

async function handleDeleteComment(commentId) {
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

    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        if (response.ok) {
            // Refresh the page after successful delete
            location.reload();
        } else {
            const errorData = await response.json();
            console.error("Failed to delete comment:", errorData.error);
        }
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

// Handle the "Add Comment" button click
document.getElementById("addCommentButton").addEventListener("click", async () => {
    const commentInput = document.getElementById("commentInput");
    const content = commentInput.value.trim();
    if (content === "") return;

    const postId = localStorage.getItem('selectedPostId');
    if (!postId) {
        console.error("No post ID found");
        return;
    }

    const jwtToken = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(jwtToken);
    const userId = decodedToken.id;

    const newComment = {
        post_id: postId,
        user_id: userId,
        content: content,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/comments/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(newComment),
        });

        if (response.ok) {
            // Refresh the page after adding the comment
            location.reload();
        } else {
            const errorData = await response.json();
            console.error("Failed to add comment:", errorData.error);
        }
    } catch (error) {
        console.error("Error adding comment:", error);
    }
});

function goBack() {
    window.history.back();
}

