import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuBell, LuX } from "react-icons/lu";
import { supabase } from "../../../lib/supabase";
import { useUser } from "../../../context/UserContext";
import "../styles/NotificationBell.css";
import { createPortal } from "react-dom";

export default function NotificationBell() {
  const { user } = useUser();
  const navigate = useNavigate();
  const currentUserId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*, property_units(property_id)")
        .eq("recipient_user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const list = data || [];
      setNotifications(list);
      setUnreadCount(list.filter((item) => !item.is_read).length);
    } catch (err) {
      console.error("Owner notification error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  async function handleMarkAsRead(id) {
    if (!currentUserId) return;

    // Optimistically update UI to avoid an extra full SELECT round-trip
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_user_id", currentUserId);

    if (updateError) {
      console.error("Mark as read failed:", updateError);
      await loadNotifications();
    }
  }

  async function handleNotificationClick(item) {
    if (!item.is_read) {
      await handleMarkAsRead(item.id);
    }

    // Only route to complaints if this notification is complaint-related (or untyped legacy)
    const isComplaintNotification =
      !item.type ||
      item.type.toLowerCase().includes("complaint") ||
      Boolean(item.related_complaint_id);

    if (!isComplaintNotification) {
      return;
    }

    let propertyId = item.property_units?.property_id;

    // 1. Primary path: resolve property_id from related_unit_id
    if (!propertyId && item.related_unit_id) {
      const { data, error: unitError } = await supabase
        .from("property_units")
        .select("property_id")
        .eq("id", item.related_unit_id)
        .maybeSingle();

      if (unitError) {
        console.error("Error resolving property from unit:", unitError);
      } else {
        propertyId = data?.property_id;
      }
    }

    // 2. Fallback for older notifications where related_unit_id was null
    if (!propertyId && currentUserId) {
      const { data } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", currentUserId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      propertyId = data?.id;
    }

    if (propertyId) {
      setIsOpen(false);
      navigate(`/properties/${propertyId}/complaints`);
    }
  }

  async function handleMarkAllAsRead() {
    if (!currentUserId || markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_user_id", currentUserId)
        .eq("is_read", false);

      if (updateError) throw updateError;
    } catch (err) {
      console.error("Mark all as read failed:", err);
      await loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  }

  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      return;
    }

    loadNotifications();
  }, [currentUserId, loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="owner-notification-wrapper">
      <button
        type="button"
        className="owner-notification-button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) loadNotifications();
        }}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <LuBell />
        {unreadCount > 0 && <span className="owner-notification-dot" />}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="owner-notification-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
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
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                >
                  {markingAll ? "Marking..." : "Mark all as read"}
                </button>
              )}
            </div>

            {loading ? (
              <p>Loading notifications...</p>
            ) : error ? (
              <p role="alert">{error}</p>
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
                    onClick={() => handleNotificationClick(item)}
                  >
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                    <small>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : ""}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}