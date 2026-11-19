import { supabase } from "../lib/supabase";

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

function normalizeContactPayload(contact = {}, { requireId = false } = {}) {
  const name = String(contact.name ?? contact.provider_name ?? "").trim();
  const phone = String(contact.phone ?? contact.phone_number ?? "").trim();
  const category = String(contact.category ?? contact.service_type ?? "").trim() || null;
  const notes = String(contact.notes ?? "").trim() || null;

  if (!name) {
    throw new Error("Contact name is required.");
  }

  if (!phone || !/^[+\d\s()-]{7,20}$/.test(phone)) {
    throw new Error("Please enter a valid phone number.");
  }

  const normalized = {
    ...contact,
    ...(contact.name !== undefined ? { name } : {}),
    ...(contact.provider_name !== undefined ? { provider_name: name } : {}),
    ...(contact.phone !== undefined ? { phone } : {}),
    ...(contact.phone_number !== undefined ? { phone_number: phone } : {}),
    ...(category !== null ? { category } : {}),
    ...(notes !== null ? { notes } : {}),
  };

  if (requireId) {
    const contactId = contact.id ?? contact.contact_id;
    assertValidUuid(contactId, "contact ID");
  }

  return normalized;
}

const TenantPropertyService = {
  async getPropertyServices(deviceToken) {
    assertDeviceToken(deviceToken);

    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          device_token: deviceToken.trim(),
          action: "fetch",
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to load property services."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to load property services.");
    }

    return {
      serviceProviders: Array.isArray(data.service_providers)
        ? data.service_providers
        : [],
      utilityProviders: Array.isArray(data.utility_providers)
        ? data.utility_providers
        : [],
      tenantContacts: Array.isArray(data.tenant_contacts)
        ? data.tenant_contacts
        : [],
    };
  },

  async addCustomContact(deviceToken, contact) {
    assertDeviceToken(deviceToken);
    const sanitizedContact = normalizeContactPayload(contact);

    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          ...sanitizedContact,
          device_token: deviceToken.trim(),
          action: "add_contact",
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to save contact."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to save contact.");
    }

    return data.contact;
  },

  async updateCustomContact(deviceToken, contact) {
    assertDeviceToken(deviceToken);
    const sanitizedContact = normalizeContactPayload(contact, {
      requireId: true,
    });

    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          ...sanitizedContact,
          device_token: deviceToken.trim(),
          action: "update_contact",
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to update contact."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to update contact.");
    }

    return data.contact;
  },

  async deleteCustomContact(deviceToken, contactId) {
    assertDeviceToken(deviceToken);
    assertValidUuid(contactId, "contact ID");

    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          device_token: deviceToken.trim(),
          action: "delete_contact",
          contact_id: contactId,
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to delete contact."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to delete contact.");
    }

    return data.deleted_id;
  },
};

export default TenantPropertyService;