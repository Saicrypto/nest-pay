
import { useEffect, useState } from "react";
import { LuBell, LuX } from "react-icons/lu";
import { supabase } from "../../../lib/supabase";
import { useUser } from "../../../context/UserContext";
import "../styles/NotificationBell.css";
import { createPortal } from "react-dom";

export default function NotificationBell() {
  const { user } = useUser();
const currentUserId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((item) => !item.is_read).length);
    } catch (err) {
      console.error("Owner notification error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_user_id", currentUserId);

    if (error) {
      console.error(error);
      return;
    }

    await loadNotifications();
  }

  async function handleMarkAllAsRead() {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", currentUserId)
      .eq("is_read", false);

    if (error) {
      console.error(error);
      return;
    }

    await loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, [currentUserId]);

  return (
    <div className="owner-notification-wrapper">
      <button
        type="button"
        className="owner-notification-button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications();
        }}
        aria-label="Notifications"
      >
        <LuBell />
        {unreadCount > 0 && (
          <span className="owner-notification-dot" />
        )}
      </button>

      {isOpen && (
        createPortal(
        <div className="owner-notification-overlay">
  <div className="owner-notification-header">
    <button
      type="button"
      className="owner-notification-back"
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
            <div className="owner-notification-list">
              {notifications.map((item) => (
                <article
                  key={item.id}
                  className={`owner-notification-item ${
                    !item.is_read ? "unread" : ""
                  }`}
                  onClick={() =>
                    !item.is_read && handleMarkAsRead(item.id)
                  }
                >
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                  <small>
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </article>
              ))}
            </div>
          )}
        </div>,
        document.body
      )
      )}
    </div>
  );
}
    
