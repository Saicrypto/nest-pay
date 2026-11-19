import { useCallback, useEffect, useRef, useState } from "react";
import { LuBell, LuX } from "react-icons/lu";
import { useTenant } from "../../context/TenantContext";
import TenantNotificationService from "../../services/TenantNotificationService";
import "./NotificationBell.css";

function formatTimestamp(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const { deviceToken } = useTenant();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(() => new Set());

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!deviceToken) {
      setNotifications([]);
      setUnreadCount(0);
      setError("");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const result = await TenantNotificationService.getNotifications(
        deviceToken
      );

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      const list = Array.isArray(result?.notifications)
        ? result.notifications
        : [];
      const count = Number.isFinite(Number(result?.unreadCount))
        ? Math.max(0, Number(result.unreadCount))
        : list.filter((item) => !item?.is_read).length;

      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      console.error("Notification loading error:", err);
      setError(err?.message || "Unable to load notifications.");
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [deviceToken]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function handleMarkAsRead(notificationId) {
    if (!deviceToken || !notificationId || updatingIds.has(notificationId)) {
      return;
    }

    setUpdatingIds((prev) => new Set(prev).add(notificationId));
    setError("");

    // Optimistically mark as read
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await TenantNotificationService.markAsRead(deviceToken, notificationId);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) {
        setError(err?.message || "Unable to update notification.");
        await loadNotifications();
      }
    } finally {
      if (mountedRef.current) {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    }
  }

  async function handleMarkAllAsRead() {
    if (!deviceToken || markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistically mark all as read
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true }))
    );
    setUnreadCount(0);

    try {
      await TenantNotificationService.markAllAsRead(deviceToken);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        setError(err?.message || "Unable to update notifications.");
      }
    } finally {
      if (mountedRef.current) {
        setMarkingAll(false);
      }
    }
  }

  function handleTogglePanel() {
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        loadNotifications();
      }
      return nextOpen;
    });
  }

  return (
    <div className="tenant-notification-wrapper">
      <button
        type="button"
        className="tenant-notification-button"
        onClick={handleTogglePanel}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <LuBell aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="tenant-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="tenant-notification-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <div className="tenant-notification-panel-header">
            <button
              type="button"
              className="tenant-notification-back"
              onClick={() => setIsOpen(false)}
            >
              <LuX aria-hidden="true" />
              <span>Back</span>
            </button>

            <h3>Notifications</h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
              >
                {markingAll ? "Updating..." : "Mark all as read"}
              </button>
            )}
          </div>

          {loading && notifications.length === 0 ? (
            <p>Loading notifications...</p>
          ) : error && notifications.length === 0 ? (
            <p role="alert">{error}</p>
          ) : notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <>
              {error && (
                <p className="tenant-notification-error" role="alert">
                  {error}
                </p>
              )}
              <div className="tenant-notification-list">
                {notifications.map((notification) => {
                  const isUnread = !notification.is_read;
                  const timestamp = formatTimestamp(notification.created_at);

                  return (
                    <article
                      key={notification.id}
                      className={`tenant-notification-item ${
                        isUnread ? "unread" : ""
                      }`}
                      onClick={() =>
                        isUnread && handleMarkAsRead(notification.id)
                      }
                      style={{
                        cursor: isUnread ? "pointer" : "default",
                      }}
                    >
                      <h4>{notification.title || "Notification"}</h4>
                      {notification.message && <p>{notification.message}</p>}
                      {timestamp && <small>{timestamp}</small>}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}