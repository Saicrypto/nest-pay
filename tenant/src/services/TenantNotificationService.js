
import { supabase } from "../../../src/lib/supabase";

const TenantNotificationService = {
  async getNotifications(deviceToken) {
    const { data, error } = await supabase.functions.invoke(
      "get-tenant-notifications",
      {
        body: { device_token: deviceToken },
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || "Unable to load notifications.");
    }

    return {
      notifications: data.notifications || [],
      unreadCount: data.unread_count || 0,
    };
  },

  async markAsRead(deviceToken, notificationId) {
    const { data, error } = await supabase.functions.invoke(
      "tenant-notifications",
      {
        body: {
          action: "mark_read",
          device_token: deviceToken,
          notification_id: notificationId,
        },
      }
    );

    if (error) throw error;
    if (!data?.success) {
      throw new Error(data?.error || "Unable to mark notification as read.");
    }

    return data;
  },

  async markAllAsRead(deviceToken) {
    const { data, error } = await supabase.functions.invoke(
      "tenant-notifications",
      {
        body: {
          action: "mark_all_read",
          device_token: deviceToken,
        },
      }
    );

    if (error) throw error;
    if (!data?.success) {
      throw new Error(data?.error || "Unable to mark notifications as read.");
    }

    return data;
  },
};

export default TenantNotificationService;
