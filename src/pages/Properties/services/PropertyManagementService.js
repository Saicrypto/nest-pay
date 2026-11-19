import { supabase } from "../../../lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_COMPLAINT_STATUSES = new Set([
  "submitted",
  "in_progress",
  "resolved",
  "closed",
]);

function assertValidUuid(id, label = "ID") {
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new Error(`Invalid ${label}.`);
  }
}

function pickProviderFields(input = {}) {
  return {
    ...(input.service_name !== undefined && {
      service_name: String(input.service_name).trim(),
    }),
    ...(input.contact_person !== undefined && {
      contact_person: String(input.contact_person).trim(),
    }),
    ...(input.phone !== undefined && {
      phone: String(input.phone).trim(),
    }),
    ...(input.description !== undefined && {
      description: String(input.description).trim(),
    }),
  };
}

function pickUtilityFields(input = {}) {
  return {
    ...(input.utility_name !== undefined && {
      utility_name: String(input.utility_name).trim(),
    }),
    ...(input.contact_person !== undefined && {
      contact_person: String(input.contact_person).trim(),
    }),
    ...(input.phone !== undefined && {
      phone: String(input.phone).trim(),
    }),
    ...(input.description !== undefined && {
      description: String(input.description).trim(),
    }),
  };
}

const PropertyManagementService = {
  // Get professional service providers for a property
  async getServiceProviders(propertyId) {
    assertValidUuid(propertyId, "property ID");

    const { data, error } = await supabase
      .from("property_service_providers")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },

  // Add a professional service provider
  async addServiceProvider(provider) {
    assertValidUuid(provider?.property_id, "property ID");

    const payload = {
      ...pickProviderFields(provider),
      property_id: provider.property_id,
    };

    const { data, error } = await supabase
      .from("property_service_providers")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a professional service provider
  async updateServiceProvider(id, updates) {
    assertValidUuid(id, "service provider ID");

    const { data, error } = await supabase
      .from("property_service_providers")
      .update({
        ...pickProviderFields(updates),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a professional service provider
  async deleteServiceProvider(id) {
    assertValidUuid(id, "service provider ID");

    const { error } = await supabase
      .from("property_service_providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get daily utility providers
  async getUtilityProviders(propertyId) {
    assertValidUuid(propertyId, "property ID");

    const { data, error } = await supabase
      .from("property_utility_providers")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },

  // Add a daily utility provider
  async addUtilityProvider(provider) {
    assertValidUuid(provider?.property_id, "property ID");

    const payload = {
      ...pickUtilityFields(provider),
      property_id: provider.property_id,
    };

    const { data, error } = await supabase
      .from("property_utility_providers")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a daily utility provider
  async updateUtilityProvider(id, updates) {
    assertValidUuid(id, "utility provider ID");

    const { data, error } = await supabase
      .from("property_utility_providers")
      .update({
        ...pickUtilityFields(updates),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a daily utility provider
  async deleteUtilityProvider(id) {
    assertValidUuid(id, "utility provider ID");

    const { error } = await supabase
      .from("property_utility_providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get complaints for a property
  async getPropertyComplaints(propertyId) {
    assertValidUuid(propertyId, "property ID");

    const { data, error } = await supabase
      .from("property_complaints")
      .select(`
        *,
        property_units(unit_name),
        tenants(full_name)
      `)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },

  // Update complaint status
  async updateComplaintStatus(id, status) {
    assertValidUuid(id, "complaint ID");

    if (!ALLOWED_COMPLAINT_STATUSES.has(status)) {
      throw new Error("Invalid complaint status.");
    }

    const updates = {
      status,
      updated_at: new Date().toISOString(),
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("property_complaints")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Notify tenant only when complaint is resolved
    if (status === "resolved") {
      const { error: notificationError } = await supabase.rpc(
        "notify_tenant_complaint_resolved",
        {
          p_complaint_id: data.id,
        }
      );

      if (notificationError) {
        console.error("Tenant notification error:", notificationError);
      }
    }

    return data;
  },
};

export default PropertyManagementService;