
import { useEffect, useState } from "react";
import { LuBell, LuX } from "react-icons/lu";
import { useTenant } from "../../context/TenantContext";
import TenantNotificationService from "../../services/TenantNotificationService";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { deviceToken } = useTenant();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    if (!deviceToken) return;

    try {
      setLoading(true);
      setError("");

      const result = await TenantNotificationService.getNotifications(
        deviceToken
      );

      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error("Notification loading error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId) {
    try {
      await TenantNotificationService.markAsRead(
        deviceToken,
        notificationId
      );
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError("Unable to update notification.");
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await TenantNotificationService.markAllAsRead(deviceToken);
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError("Unable to update notifications.");
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [deviceToken]);

  return (
    <div className="tenant-notification-wrapper">
      <button
        type="button"
        className="tenant-notification-button"
        onClick={() => {
             
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications();
        }}
        aria-label="Notifications"
      >
        <LuBell />
        {unreadCount > 0 && (
          <span className="tenant-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="tenant-notification-overlay">
<div className="tenant-notification-panel-header">
  <button
    type="button"
    className="tenant-notification-back"
    onClick={() => setIsOpen(false)}
  >
    <LuX />
    <span>Back</span>
  </button>

  <h3>Notifications</h3>

  {unreadCount > 0 && (
    <button type="button" onClick={handleMarkAllAsRead}>
      Mark all as read
    </button>
  )}
</div>

          {loading ? (
            <p>Loading notifications...</p>
          ) : error ? (
            <p>{error}</p>
          ) : notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <div className="tenant-notification-list">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`tenant-notification-item ${
                    !notification.is_read ? "unread" : ""
                  }`}
                  onClick={() =>
                    !notification.is_read &&
                    handleMarkAsRead(notification.id)
                  }
                  style={{
                    cursor: notification.is_read ? "default" : "pointer",
                  }}
                >
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
