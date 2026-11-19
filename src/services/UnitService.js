import { supabase } from "../lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertValidUuid(id, label = "ID") {
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new Error(`Invalid ${label}.`);
  }
}

function parseOptionalNonNegativeInt(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Numeric unit fields cannot be negative.");
  }
  return Math.floor(parsed);
}

function parseNonNegativeAmount(value, fieldLabel) {
  if (value === "" || value == null) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${fieldLabel}.`);
  }
  return parsed;
}

function normalizeUnitPayload(unitData = {}) {
  const unitName = String(unitData.unitName ?? "").trim();
  if (!unitName) {
    throw new Error("Flat / unit name is required.");
  }

  const monthlyRent = Number(unitData.monthlyRent);
  if (!Number.isFinite(monthlyRent) || monthlyRent <= 0) {
    throw new Error("Monthly rent must be greater than 0.");
  }

  const rentDueDay = Number(unitData.rentDueDay);
  if (!Number.isInteger(rentDueDay) || rentDueDay < 1 || rentDueDay > 31) {
    throw new Error("Rent due day must be between 1 and 31.");
  }

  const floorNumber =
    unitData.floorNumber !== "" && unitData.floorNumber != null
      ? Number(unitData.floorNumber)
      : null;

  if (floorNumber !== null && !Number.isFinite(floorNumber)) {
    throw new Error("Invalid floor number.");
  }

  return {
    unit_name: unitName,
    floor_number: floorNumber,
    square_feet: parseOptionalNonNegativeInt(unitData.squareFeet),
    bedrooms: parseOptionalNonNegativeInt(unitData.bedrooms),
    monthly_rent: monthlyRent,
    security_deposit: parseNonNegativeAmount(
      unitData.securityDeposit,
      "security deposit"
    ),
    maintenance_amount: parseNonNegativeAmount(
      unitData.maintenanceAmount,
      "maintenance amount"
    ),
    rent_due_day: rentDueDay,
  };
}

const UnitService = {
  async getMyUnits() {
    const { data, error } = await supabase
      .from("property_units")
      .select(`
        id,
        property_id,
        unit_name,
        floor_number,
        square_feet,
        bedrooms,
        occupancy_status,
        monthly_rent,
        security_deposit,
        maintenance_amount,
        rent_due_day
      `)
      .order("unit_name", { ascending: true })
      .limit(500);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUnitsByProperty(propertyId) {
    assertValidUuid(propertyId, "property ID");

    const { data, error } = await supabase
      .from("property_units")
      .select(`
        id,
        property_id,
        unit_name,
        floor_number,
        square_feet,
        bedrooms,
        occupancy_status,
        monthly_rent,
        security_deposit,
        maintenance_amount,
        rent_due_day
      `)
      .eq("property_id", propertyId)
      .order("unit_name", { ascending: true })
      .limit(500);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createUnit(propertyId, unitData) {
    assertValidUuid(propertyId, "property ID");
    const payload = normalizeUnitPayload(unitData);

    const { data, error } = await supabase
      .from("property_units")
      .insert({
        property_id: propertyId,
        occupancy_status: "vacant",
        ...payload,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

async updateOccupancyStatus(unitId, status) {
    assertValidUuid(unitId, "unit ID");

    if (!["vacant", "occupied"].includes(status)) {
      throw new Error("Invalid occupancy status.");
    }

    if (status === "vacant") {
      const { data, error } = await supabase.functions.invoke("vacate-unit", {
        body: { unit_id: unitId },
      });

      if (error) {
        let message = error.message || "Unable to mark flat as vacant.";
        try {
          if (error?.context && typeof error.context.json === "function") {
            const payload = await error.context.json();
            if (payload?.error) message = payload.error;
          }
        } catch {
          // Keep fallback message
        }
        throw new Error(message);
      }

      if (!data?.success || !data?.unit) {
        throw new Error(data?.error || "Unable to mark flat as vacant.");
      }

      return data.unit;
    }

    const { data, error } = await supabase
      .from("property_units")
      .update({ occupancy_status: status })
      .eq("id", unitId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Flat not found or permission denied.");
    return data;
  },

  async updateUnit(unitId, unitData) {
    assertValidUuid(unitId, "unit ID");
    const payload = normalizeUnitPayload(unitData);

    // Get existing values before updating
    const { data: oldUnit, error: fetchError } = await supabase
      .from("property_units")
      .select(`
        unit_name,
        floor_number,
        square_feet,
        bedrooms,
        monthly_rent,
        security_deposit,
        maintenance_amount,
        rent_due_day
      `)
      .eq("id", unitId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!oldUnit) throw new Error("Flat not found or permission denied.");

    // Update flat details
    const { data, error } = await supabase
      .from("property_units")
      .update(payload)
      .eq("id", unitId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Unable to update flat details.");

    // Send notification with specific changes
    const { error: notificationError } = await supabase.rpc(
      "notify_tenant_unit_updated",
      {
        p_unit_id: unitId,
        p_old_values: oldUnit,
      }
    );

    if (notificationError) {
      console.error("Tenant unit notification error:", notificationError);
    }

    return data;
  },

  async deleteUnit(unitId) {
    assertValidUuid(unitId, "unit ID");

    const { error } = await supabase
      .from("property_units")
      .delete()
      .eq("id", unitId);

    if (error) throw error;
  },
};

export default UnitService;