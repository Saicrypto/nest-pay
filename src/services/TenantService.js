import { supabase } from "../lib/supabase";

const TenantService = {
 
async getTenantsByUnit(unitId) {
  const { data, error } = await supabase
    .from("tenants")
    .select(`
      id,
      unit_id,
      full_name,
      phone,
      email,
      tenant_status,
      created_at
    `)
    .eq("unit_id", unitId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
},

  async createTenant(unitId, tenantData) {
    // 1. Get the unit's actual monthly rent.
    const { data: unit, error: unitError } = await supabase
      .from("property_units")
      .select("id, monthly_rent")
      .eq("id", unitId)
      .single();

    if (unitError) {
      throw new Error(
        `Could not load the unit's rent: ${unitError.message}`
      );
    }

    const rentAmount = Number(unit.monthly_rent);

    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      throw new Error(
        "This unit does not have a valid monthly rent. Set the rent before adding a tenant."
      );
    }

    // 2. Create the tenant.
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        unit_id: unitId,
        full_name: tenantData.fullName.trim(),
        phone: tenantData.phone.trim(),
        email: tenantData.email.trim() || null,
        tenant_status: "active",
        move_in_date: tenantData.moveInDate || null,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 3. Create the tenant's rent record for the current month.
    const now = new Date();
    const rentMonth = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      "01",
    ].join("-");

    const { data: rentPayment, error: rentError } = await supabase
      .from("rent_payments")
      .insert({
        unit_id: unitId,
        tenant_id: tenant.id,
        rent_month: rentMonth,
        rent_amount: rentAmount,
        status: "unpaid",
      })
      .select()
      .single();

    if (rentError) {
      console.error(
        "Tenant created, but rent record creation failed:",
        rentError
      );

      throw new Error(
        `The tenant was created, but their rent record could not be created. ${rentError.message} Please fix this before trying to create the tenant again.`
      );
    }

    // 4. Update the unit's occupancy status.
    const { error: occupancyError } = await supabase
      .from("property_units")
      .update({ occupancy_status: "occupied" })
      .eq("id", unitId);

    if (occupancyError) {
      console.error(
        "Tenant and rent record created, but unit status update failed:",
        occupancyError
      );

      throw new Error(
        "The tenant and rent record were created, but the unit occupancy status could not be updated."
      );
    }

    // Return the tenant as before.
    return tenant;
  },

  async updateTenant(tenantId, tenantData) {
  const { data, error } = await supabase
    .from("tenants")
    .update({
      full_name: tenantData.fullName.trim(),
      phone: tenantData.phone.trim(),
      email: tenantData.email.trim() || null,
    })
    .eq("id", tenantId)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async vacateUnitAndDeleteTenants(unitId) {
  const { error } = await supabase.rpc(
    "vacate_unit_and_delete_tenants",
    {
      p_unit_id: unitId,
    }
  );

  if (error) throw error;
},

async getMyTenants() {
  const { data, error } = await supabase
    .from("tenants")
    .select(`
      id,
      unit_id,
      full_name,
      phone,
      email,
      tenant_status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
},

};



export default TenantService;