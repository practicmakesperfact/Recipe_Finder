const API_BASE_URL = "http://127.0.0.1:8000/api";  // Backend API URL
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwNzQzOTI2LCJpYXQiOjE3NDA3NDM2MjYsImp0aSI6ImUwNDUwNDJkNDUzODQ5NThiMDgxMGRmMGFmNTEwNTJjIiwidXNlcl9pZCI6MX0.K6yM4OLAfu6mS1B2CpKeH6LbNbabWzB4lbuz-oR1_34";  // Replace with a valid token


// Fetch Unread Notifications
async function fetchNotifications() {
    const token = localStorage.getItem("authToken");
    console.log("Debug:Retrieved Token:", token);
    if(!token){
        console.error("No token found in localStorage.");
        return;

    }

    try {
        const response = await fetch(`${API_BASE_URL}/notifications/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch notifications.");

        const notifications = await response.json();
        updateNotificationUI(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

// Update UI with Notifications
function updateNotificationUI(notifications) {
    const notificationBadge = document.getElementById("notificationBadge");
    const notificationList = document.getElementById("notificationList");

    // clear privious notifications (except mark all as read button)

    notificationList.innerHTML = '<li class="mark-all-read" onclick="markAllAsRead()">Mark All as Read</li>';

    if (notifications.length > 0) {
                notificationBadge.style.display = "inline";
                notificationBadge.textContent = notifications.length;

                notifications.forEach(notification => {
                    const li = document.createElement("li");

                    // add an icon based on notification type
                let icon = ""; 
                if(notification.message.includes('liked')){
                    icon =`<span class = "notification-icon-like">👍</span>`;
                }else if(notification.message.includes('disliked')){
                    icon =`<span class = "notification-icon-dislike">👎</span>`;
                } else{
                    icon =`<span class = "notification-icon-comment">💬</span>`;
                }
                    li.innerHTML = `${icon} ${notification.message}`;
                    li.onclick = ()=>markNotificationAsRead(notification.id, li);
                    notificationList.appendChild(li);
                });
            } 
     else {    
            notificationBadge.style.display = "none";
            notificationList.innerHTML += "<li>No new notifications</li>";
        }
}
// Toggle Notification Dropdown with animation
function toggleDropdown() {
    const dropdown = document.getElementById("notificationDropdown");

    if(dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
        setTimeout(()=>{
        dropdown.style.display = "none";
        }, 300);

    }else{
        dropdown.style.display = "block";
        setTimeout(() => {
            dropdown.classList.add("show");
        }, 10);
        
    }
    
}

// Mark a Single Notification as Read
async function markNotificationAsRead(notificationId, element) {
    try {
        await fetch(`${API_BASE_URL}/notifications/${notificationId}/read/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_read: true })
        });

        element.remove();
        fetchNotifications();
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
}

// Mark All Notifications as Read
async function markAllAsRead() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
         if(response.ok){
              fetchNotifications();
         }
        
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
}

// Fetch notifications when page loads
fetchNotifications();
