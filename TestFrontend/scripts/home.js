function goToProfile() {
    window.location.href = "../pages/profile.html";
}

function handleUsernameClick(id, userId,username) {
  console.log("Username clicked");

  if (id === userId) {
      // Redirect to profile.html if the clicked user is the current user
      window.location.href = "../pages/profile.html";
  } else {
      // Save the selected username to localStorage
      localStorage.setItem("viewUsername", username);
      // Redirect to viewUserProfile.html
      window.location.href = "../pages/viewUserProfile.html";
  }
}

function logout() {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "../pages/login.html";
        return;
    }

    fetch("http://localhost:3000/api/users/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem("jwtToken");
            window.location.href = "../pages/login.html";
        } else {
            console.error("Failed to log out");
        }
    })
    .catch(error => console.error("Error logging out:", error));
}

document.addEventListener("DOMContentLoaded", async () => {

  const addIcon = document.getElementById("addIcon");

  addIcon.addEventListener("click", () => {
    window.location.href = "../pages/connect.html";
  });

  const jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) {
    window.location.href = "../pages/login.html"; // Redirect to login if no token
    return;
  }

  // Ensure jwtDecode is defined
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
   const backToTopButton = document.getElementById("backToTopButton");
    const profileContent = document.querySelector(".profile-content");

backToTopButton.addEventListener("click", () => {
    profileContent.scrollTo({
        top: 0,
        behavior: "smooth" // Smooth scroll to top
    });
});

  try {
    // Decode JWT to get user ID
    const decodedToken = jwtDecode(jwtToken);
    console.log("Decoded Token:", decodedToken);
    const userId = decodedToken.id; // Assuming the token contains an 'id' field

    
    //get posts
    const userPostsContainer = document.getElementById("userPostsContainer");
    const likedPosts = new Set(JSON.parse(localStorage.getItem("likedPosts")) || []);
    try {
      const postsResponse = await fetch(
        `http://localhost:3000/api/posts/following/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      const postsData = await postsResponse.json();

      if (postsResponse.ok && postsData.length > 0) {
        for (const post of postsData) {
            const userResponse = await fetch(`http://localhost:3000/api/users/${post.user_id}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              });
              const userData = await userResponse.json();
    
              const postCard = document.createElement("div");
              postCard.classList.add("post-card");
    
              // Create user info section
              const userInfoDiv = document.createElement("div");
              userInfoDiv.classList.add("user-info");
              userInfoDiv.innerHTML = `
                <img  src="http://localhost:3000/uploads/profiles/${userData.profile_picture}" alt="Profile Picture" style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%;
                display: inline-block;
                object-fit: cover;">
                <span class="username" style="
                display: block;
                font-weight: bold;
                margin-top: 10px;
                color: #000000;
                cursor:pointer;
                " onclick="handleUsernameClick('${userData.id}', '${userId}','${userData.username}')">${userData.username}</span>
              `;
              // Add user info section to post card
              postCard.appendChild(userInfoDiv);
    
          
          //get like count and comments count
          const [likesResponse, commentsResponse] = await Promise.all([
            fetch(`http://localhost:3000/api/likes/post/${post.id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }),
            fetch(`http://localhost:3000/api/comments/${post.id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            })
        ]);
          
            const likesData = await likesResponse.json();
            const commentsData = await commentsResponse.json();

            const likeButton = document.createElement("button");
            likeButton.classList.add("like-button");
            likeButton.dataset.postId = post.id;
            likeButton.innerHTML = '<span class="heart-icon">&#9829;</span>'; // Unicode heart symbol
      
            // Set button color based on liked posts
            if (likedPosts.has(post.id)) {
              likeButton.classList.add("liked");
            }
      
            likeButton.addEventListener("click", async () => {
              const isLiked = likeButton.classList.contains("liked");
      
              if (isLiked) {
                await fetch(`http://localhost:3000/api/likes/`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                  },
                  body: JSON.stringify({ user_id: userId, post_id: post.id }),
                });
                likeButton.classList.remove("liked");
                likedPosts.delete(post.id); // Update local liked posts
              } else {
                await fetch(`http://localhost:3000/api/likes/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                  },
                  body: JSON.stringify({ user_id: userId, post_id: post.id }),
                });
                likeButton.classList.add("liked");
                likedPosts.add(post.id); // Update local liked posts
              }
              
              // Update the like count
              const likeCountElement = document.querySelector(`#likeCount_${post.id} .count-number`);
              if (isLiked) {
                likeCountElement.innerText = parseInt(likeCountElement.innerText) - 1;
              } else {
                likeCountElement.innerText = parseInt(likeCountElement.innerText) + 1;
              }
      
              // Update local storage
              localStorage.setItem("likedPosts", JSON.stringify(Array.from(likedPosts)));
            });
          postCard.innerHTML += `
                    <button class="view-post-info-button" title="Post Info"><i class="fas fa-info-circle"></i></button>
                    <h2 class="post-title">${
                      post.title
                    }</h2><h3 class="post-location"> / ${post.location}</h3>
                    ${
                      post.photo
                        ? `<img src="http://localhost:3000/uploads/posts/${post.photo}" alt="Post Image">`
                        : ""
                    }
                    <p>${post.content}</p>
                    <div class="tags">${post.tags
                      .split("/")
                      .map((tag) => `#${tag}`)
                      .join(" ")}</div>
                    <div class="counts-container">
                    <span class="like-count" id="likeCount_${post.id}">
                    Likes: <span class="count-number">${likesData.likeCount}</span>
                    </span>
                    <span class="comment-count" id="commentCount_${post.id}">
                    Comments: <span class="count-number">${commentsData.commentCount}</span>
                     </span>
                    </div>
                    <small style="font-style: italic;">Posted on ${new Date(
                      post.created_at
                    ).toLocaleDateString()}</small><br>
                `;
                postCard.appendChild(likeButton);        
                userPostsContainer.appendChild(postCard);
                
                 // Add event listener for view post info button
                const viewPostInfoButton = postCard.querySelector('.view-post-info-button');
                viewPostInfoButton.addEventListener('click', (function(postId) {
                return function() {
                localStorage.setItem('selectedPostId', postId); // Store postId in localStorage
                window.location.href = '../pages/postInfo.html';
              };
              })(post.id));
        };
            const noMorePostsMessage = document.createElement("h1");
            noMorePostsMessage.classList.add("no-posts");
            noMorePostsMessage.innerText = "No More Posts Available";
            userPostsContainer.appendChild(noMorePostsMessage);

      } else {
        userPostsContainer.innerHTML = `<h1 class="no-posts">No Posts Available</h1>`;
      }
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
