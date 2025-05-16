document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('access_token')) return;

    const notificationIcon = document.getElementById('notification-icon');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationList = document.getElementById('notification-list');
    const unreadCount = document.getElementById('unread-count');
    const markAllReadBtn = document.getElementById('mark-all-read');

    // Fetch notifications
    const fetchNotifications = () => {
        axios.get('/notifications/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        })
            .then(response => {
                const notifications = response.data;
                unreadCount.textContent = notifications.length;
                unreadCount.classList.toggle('hidden', notifications.length === 0);

                notificationList.innerHTML = notifications.length ? notifications.map(notif => `
                    <div class="p-2 border-b cursor-pointer hover:bg-gray-100" data-id="${notif.id}">
                        <p class="text-sm">${notif.message}</p>
                        <p class="text-xs text-gray-500">${new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                `).join('') : '<p class="text-center text-sm">No new notifications.</p>';

                // Mark as read on click
                notificationList.querySelectorAll('div[data-id]').forEach(item => {
                    item.addEventListener('click', () => {
                        const notifId = item.getAttribute('data-id');
                        axios.patch(`/notifications/${notifId}/read/`, {}, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                        })
                            .then(() => fetchNotifications())
                            .catch(error => console.error('Error marking notification as read:', error));
                    });
                });
            })
            .catch(error => console.error('Error fetching notifications:', error));
    };

    // Toggle dropdown
    notificationIcon.addEventListener('click', () => {
        notificationDropdown.classList.toggle('hidden');
        if (!notificationDropdown.classList.contains('hidden')) {
            fetchNotifications();
        }
    });

    // Mark all as read
    markAllReadBtn.addEventListener('click', () => {
        axios.patch('/notifications/read-all/', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        })
            .then(() => fetchNotifications())
            .catch(error => console.error('Error marking all notifications as read:', error));
    });

    // Initial fetch
    fetchNotifications();
});