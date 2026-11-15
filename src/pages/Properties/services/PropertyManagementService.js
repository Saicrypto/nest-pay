
import { supabase } from "../../../lib/supabase";

const PropertyManagementService = {
  // Get professional service providers for a property
  async getServiceProviders(propertyId) {
    const { data, error } = await supabase
      .from("property_service_providers")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a professional service provider
  async addServiceProvider(provider) {
    const { data, error } = await supabase
      .from("property_service_providers")
      .insert(provider)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a professional service provider
  async updateServiceProvider(id, updates) {
    const { data, error } = await supabase
      .from("property_service_providers")
      .update({
        ...updates,
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
    const { error } = await supabase
      .from("property_service_providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get daily utility providers
  async getUtilityProviders(propertyId) {
    const { data, error } = await supabase
      .from("property_utility_providers")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a daily utility provider
  async addUtilityProvider(provider) {
    const { data, error } = await supabase
      .from("property_utility_providers")
      .insert(provider)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a daily utility provider
  async updateUtilityProvider(id, updates) {
    const { data, error } = await supabase
      .from("property_utility_providers")
      .update({
        ...updates,
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
    const { error } = await supabase
      .from("property_utility_providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get complaints for a property
  async getPropertyComplaints(propertyId) {
    const { data, error } = await supabase
      .from("property_complaints")
      .select(`
        *,
        property_units(unit_name),
        tenants(full_name)
      `)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },


  // Update complaint status
  async updateComplaintStatus(id, status) {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }

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
