import { supabase } from "../../../src/lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertDeviceToken(deviceToken) {
  if (typeof deviceToken !== "string" || !deviceToken.trim()) {
    throw new Error("Tenant session expired. Please log in again.");
  }
}

function assertValidUuid(id, label = "ID") {
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new Error(`Invalid ${label}.`);
  }
}

async function extractFunctionError(error, fallbackMessage) {
  try {
    if (error?.context && typeof error.context.json === "function") {
      const payload = await error.context.json();
      if (payload?.error) return payload.error;
    }
  } catch {
    // Ignore JSON parse failures and fall back to error.message
  }
  return error?.message || fallbackMessage;
}

const TenantNotificationService = {
  async getNotifications(deviceToken) {
    assertDeviceToken(deviceToken);

    const { data, error } = await supabase.functions.invoke(
      "get-tenant-notifications",
      {
        body: { device_token: deviceToken.trim() },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to load notifications."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to load notifications.");
    }

    const notifications = Array.isArray(data.notifications)
      ? data.notifications
      : [];
    const parsedUnread = Number(data.unread_count);

    return {
      notifications,
      unreadCount:
        Number.isFinite(parsedUnread) && parsedUnread >= 0
          ? Math.floor(parsedUnread)
          : 0,
    };
  },

  async markAsRead(deviceToken, notificationId) {
    assertDeviceToken(deviceToken);
    assertValidUuid(notificationId, "notification ID");

    const { data, error } = await supabase.functions.invoke(
      "tenant-notifications",
      {
        body: {
          action: "mark_read",
          device_token: deviceToken.trim(),
          notification_id: notificationId,
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to mark notification as read."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to mark notification as read.");
    }

    return data;
  },

  async markAllAsRead(deviceToken) {
    assertDeviceToken(deviceToken);

    const { data, error } = await supabase.functions.invoke(
      "tenant-notifications",
      {
        body: {
          action: "mark_all_read",
          device_token: deviceToken.trim(),
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to mark notifications as read."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to mark notifications as read.");
    }

    return data;
  },
};

export default TenantNotificationService;