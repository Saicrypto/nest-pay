
import { supabase } from "../lib/supabase";

const PropertyService = {
  async getMyProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, property_name, property_type, address, city, state, pincode, total_units, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  },

  async createProperty(propertyData) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Please sign in before adding a property.");
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        property_name: propertyData.propertyName.trim(),
        property_type: propertyData.propertyType,
        address: propertyData.address.trim() || null,
        city: propertyData.city.trim() || null,
        state: propertyData.state.trim() || null,
        pincode: propertyData.pincode.trim() || null,
        total_units: Number(propertyData.totalUnits),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateProperty(propertyId, propertyData) {
    const { data, error } = await supabase
      .from("properties")
      .update({
        property_name: propertyData.propertyName.trim(),
        property_type: propertyData.propertyType,
        address: propertyData.address.trim() || null,
        city: propertyData.city.trim() || null,
        state: propertyData.state.trim() || null,
        pincode: propertyData.pincode.trim() || null,
        total_units: Number(propertyData.totalUnits),
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteProperty(propertyId) {
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) throw error;
  },

};

export default PropertyService;
