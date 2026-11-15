
import { supabase } from "../lib/supabase";

const TenantPropertyService = {
  async getPropertyServices(deviceToken) {
    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          device_token: deviceToken,
          action: "fetch",
        },
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || "Unable to load property services.");
    }

    return {
      serviceProviders: data.service_providers || [],
      utilityProviders: data.utility_providers || [],
      tenantContacts: data.tenant_contacts || [],
    };
  },

  async addCustomContact(deviceToken, contact) {
    const { data, error } = await supabase.functions.invoke(
      "get-tenant-property-services",
      {
        body: {
          device_token: deviceToken,
          action: "add_contact",
          ...contact,
        },
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || "Unable to save contact.");
    }

    return data.contact;
  },


async updateCustomContact(deviceToken, contact) {
  const { data, error } = await supabase.functions.invoke(
    "get-tenant-property-services",
    {
      body: {
        device_token: deviceToken,
        action: "update_contact",
        ...contact,
      },
    }
  );

  if (error) throw error;

  if (!data?.success) {
    throw new Error(data?.error || "Unable to update contact.");
  }

  return data.contact;
},

async deleteCustomContact(deviceToken, contactId) {
  const { data, error } = await supabase.functions.invoke(
    "get-tenant-property-services",
    {
      body: {
        device_token: deviceToken,
        action: "delete_contact",
        contact_id: contactId,
      },
    }
  );

  if (error) throw error;

  if (!data?.success) {
    throw new Error(data?.error || "Unable to delete contact.");
  }

  return data.deleted_id;
},


};

export default TenantPropertyService;
