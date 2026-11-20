import { supabase } from "../lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertValidUuid(id, label = "property ID") {
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new Error(`Invalid ${label}.`);
  }
}

function normalizePropertyPayload(propertyData = {}) {
  const propertyName = String(propertyData.propertyName ?? "").trim();
  const propertyType = String(propertyData.propertyType ?? "").trim();

  if (!propertyName) {
    throw new Error("Property name is required.");
  }

  if (!propertyType) {
    throw new Error("Property type is required.");
  }

  const parsedUnits = Number(propertyData.totalUnits);
  const totalUnits =
    Number.isFinite(parsedUnits) && parsedUnits >= 0
      ? Math.floor(parsedUnits)
      : 0;

  return {
    property_name: propertyName,
    property_type: propertyType,
    address: String(propertyData.address ?? "").trim() || null,
    city: String(propertyData.city ?? "").trim() || null,
    state: String(propertyData.state ?? "").trim() || null,
    pincode: String(propertyData.pincode ?? "").trim() || null,
    total_units: totalUnits,
    watchman_phone: String(propertyData.watchmanPhone ?? "").trim() || null,
  };
}

const PropertyService = {
  async getMyProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, property_name, property_type, address, city, state, pincode, watchman_phone, created_at, property_units(count)"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
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

    const payload = normalizePropertyPayload(propertyData);

    const { data, error } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        ...payload,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateProperty(propertyId, propertyData) {
    assertValidUuid(propertyId);

    const payload = normalizePropertyPayload(propertyData);

    const { data, error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", propertyId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteProperty(propertyId) {
    assertValidUuid(propertyId);

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) throw error;
  },
};

export default PropertyService;