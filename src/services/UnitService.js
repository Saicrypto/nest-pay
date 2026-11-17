import { supabase } from "../lib/supabase";

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
      .order("unit_name", { ascending: true });

    if (error) throw error;

    return data;
  },

  async getUnitsByProperty(propertyId) {
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
      .order("unit_name", { ascending: true });

    if (error) throw error;

    return data;
  },

  async createUnit(propertyId, unitData) {
    const { data, error } = await supabase
      .from("property_units")
      .insert({
        property_id: propertyId,
        unit_name: unitData.unitName.trim(),
        floor_number:
          unitData.floorNumber === ""
            ? null
            : Number(unitData.floorNumber),
        square_feet:
          unitData.squareFeet !== "" && unitData.squareFeet != null
            ? Number(unitData.squareFeet)
            : null,
        bedrooms:
          unitData.bedrooms === ""
            ? null
            : Number(unitData.bedrooms),
        occupancy_status: "vacant",
        monthly_rent: Number(unitData.monthlyRent),
        security_deposit: Number(unitData.securityDeposit || 0),
        maintenance_amount: Number(unitData.maintenanceAmount || 0),
        rent_due_day: Number(unitData.rentDueDay),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateOccupancyStatus(unitId, status) {
    if (!["vacant", "occupied"].includes(status)) {
      throw new Error("Invalid occupancy status.");
    }

    const { data, error } = await supabase
      .from("property_units")
      .update({ occupancy_status: status })
      .eq("id", unitId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateUnit(unitId, unitData) {
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
      .single();

    if (fetchError) throw fetchError;

    // Update flat details
    const { data, error } = await supabase
      .from("property_units")
      .update({
        unit_name: unitData.unitName.trim(),
        floor_number:
          unitData.floorNumber === ""
            ? null
            : Number(unitData.floorNumber),
        square_feet:
          unitData.squareFeet !== "" && unitData.squareFeet != null
            ? Number(unitData.squareFeet)
            : null,
        bedrooms:
          unitData.bedrooms === ""
            ? null
            : Number(unitData.bedrooms),
        monthly_rent: Number(unitData.monthlyRent),
        security_deposit: Number(unitData.securityDeposit || 0),
        maintenance_amount: Number(unitData.maintenanceAmount || 0),
        rent_due_day: Number(unitData.rentDueDay),
      })
      .eq("id", unitId)
      .select()
      .single();

    if (error) throw error;

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
    const { error } = await supabase
      .from("property_units")
      .delete()
      .eq("id", unitId);

    if (error) throw error;
  },
};

export default UnitService;