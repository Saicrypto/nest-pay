import { supabase } from "../../../lib/supabase";

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 2000;

function assertDeviceToken(deviceToken) {
  if (typeof deviceToken !== "string" || !deviceToken.trim()) {
    throw new Error("Your session has expired. Please log in again.");
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

const TenantComplaintService = {
  async raiseComplaint(deviceToken, title, description) {
    assertDeviceToken(deviceToken);

    const cleanTitle = String(title ?? "").trim();
    const cleanDescription = String(description ?? "").trim();

    if (!cleanTitle || !cleanDescription) {
      throw new Error("Please select an issue and enter a description.");
    }

    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      throw new Error(`Issue title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
    }

    if (cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    const { data, error } = await supabase.functions.invoke(
      "raise-tenant-complaint",
      {
        body: {
          device_token: deviceToken.trim(),
          title: cleanTitle,
          description: cleanDescription,
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to submit complaint."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to submit complaint.");
    }

    return data.complaint;
  },

  async getComplaints(deviceToken) {
    assertDeviceToken(deviceToken);

    const { data, error } = await supabase.functions.invoke(
      "raise-tenant-complaint",
      {
        body: {
          action: "list",
          device_token: deviceToken.trim(),
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to load complaints."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to load complaints.");
    }

    return Array.isArray(data.complaints) ? data.complaints : [];
  },
};

export default TenantComplaintService;