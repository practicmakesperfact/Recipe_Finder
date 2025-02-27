const API_BASE_URL = "http://127.0.0.1:8000/api";  // Backend API URL
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwNTUzMjI5LCJpYXQiOjE3NDA1NTI5MjksImp0aSI6IjI2YjQ5YjYzMDRhZjQ2NDFiMmExYTdmMjgxZTk5Yzg0IiwidXNlcl9pZCI6MX0.3NXXwqG9RHqZo16VEiWuiYAmCzzroB_Tz2iyFwRhncw";  // Replace with a valid token

// Fetch Unread Notifications
async function fetchNotifications() {
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

    notificationList.innerHTML = '<li class="mark-all-read" onclick="markAllAsRead()">Mark All as Read</li>';

    if (notifications.length > 0) {
        notificationBadge.style.display = "inline";
        notificationBadge.textContent = notifications.length;

        notifications.forEach(notification => {
            const li = document.createElement("li");
            li.textContent = notification.message;
            li.onclick = () => markNotificationAsRead(notification.id, li);
            notificationList.appendChild(li);
        });
    } else {
        notificationBadge.style.display = "none";
        notificationList.innerHTML += "<li>No new notifications</li>";
    }
}

// Toggle Notification Dropdown
function toggleDropdown() {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
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
        await fetch(`${API_BASE_URL}/notifications/read-all/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        fetchNotifications();
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
}

// Fetch notifications when page loads
fetchNotifications();
