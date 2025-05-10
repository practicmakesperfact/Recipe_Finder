
fetch("http://127.0.0.1:8000/api/token/",{
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({username:'RecipeFinder',password:'RecipeFinder'})
})
.then(response=>response.json())
.then(data=>{
    if(data.access && data.refresh){
        localStorage.setItem("authToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        console.log("access Token and Refresh Token saved to localStorage.");
    }else{
        console.error("Login failed:No tokens recived.");
    }
})
.catch(error=>{
    console.error("Login failed:", error);
});
// Fetch Unread Notifications
async function fetchNotifications() {
    let token = localStorage.getItem("authToken");
    console.log("Debug:Retrieved Token:", token);

    if(!token){
        console.error("No token found in localStorage. Trying to refresh...");
       const refreshed = await refreshAuthToken();
        token = localStorage.getItem("authToken");

        if(!refreshed || !token){
            console.error('Failed to refresh token. Stopping retries.');
            return;
        }    
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        // if unauthorized (401) , stop retrying
       if (response.status === 401) {
        console.warn('Token expired. Refreshing...');
        if(retrycount >=1 ){
            console.error('Token refresh failed. Stopping further API calls.');
            return;
        }
        await refreshAuthToken();
        return fetchNotifications(retrycount+1);
      
       }
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


//Handel Expired tokens (auto refresh )

async function refreshAuthToken(){
    const refreshToken = localStorage.getItem("refreshToken");
    if(!refreshToken){
     console.error("no refresh token available. user needs to log in again.");
     return false;
    }
    try{
     const response = await fetch(`${API_BASE_URL}/token/refresh/`,{
         method:"POST",
         headers:{
             "Content-Type":"application/json"
         },
         body:JSON.stringify({ refresh: refreshToken })
     });
     const data = await response.json();
 
     if(data.access){
         localStorage.setItem("authToken", data.access);
         console.log("Token refreshed successfully.");
         return true;
     }else{
         console.error("Failed to refresh token:", data);
         localStorage.removeItem("authToken");
         localStorage.removeItem("refreshToken");
         return false;
     }
    }catch(error){
     console.error("Error refreshing token:", error);
     return false;
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
    let token = localStorage.getItem("authToken");
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_read: true })
        });
       if (response.ok){
        element.remove();
        fetchNotifications();
       }else{
        console.error("Failed to mark notification as read.");
       }       
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
}

// Mark All Notifications as Read
async function markAllAsRead() {
    let token = localStorage.getItem("authToken");
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
         if(response.ok){
              await fetchNotifications();
         }
        
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
}

// Fetch notifications when page loads
fetchNotifications();
