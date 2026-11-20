import { supabase } from "../lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertValidUuid(id, label = "ID") {
  if (typeof id !== "string" || !UUID_REGEX.test(id.trim())) {
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
    // Keep fallback message
  }
  return error?.message || fallbackMessage;
}

function normalizeTenantInput(tenantData = {}) {
  const fullName = String(tenantData.fullName ?? "").trim();
  const phone = String(tenantData.phone ?? "").trim();
  const rawEmail = String(tenantData.email ?? "").trim();
  const email = rawEmail ? rawEmail.toLowerCase() : null;

  if (!fullName || fullName.length > 120) {
    throw new Error("Please enter a valid tenant full name.");
  }

  if (!phone || !/^[+\d\s()-]{7,20}$/.test(phone)) {
    throw new Error("Please enter a valid tenant phone number.");
  }

  if (email && (email.length > 160 || !EMAIL_REGEX.test(email))) {
    throw new Error("Please enter a valid email address.");
  }

  let moveInDate = null;
  if (tenantData.moveInDate) {
    const cleanDate = String(tenantData.moveInDate).trim();
    if (!DATE_REGEX.test(cleanDate)) {
      throw new Error("Invalid move-in date format.");
    }
    moveInDate = cleanDate;
  }

  return { fullName, phone, email, moveInDate };
}

const TenantService = {
  async getTenantsByUnit(unitId) {
    assertValidUuid(unitId, "unit ID");

    const { data, error } = await supabase
      .from("tenants")
      .select(`
        id,
        unit_id,
        full_name,
        phone,
        email,
        age,
        family_members,
        profession,
        tenant_status,
        created_at
      `)
      .eq("unit_id", unitId.trim())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createTenant(unitId, tenantData) {
    assertValidUuid(unitId, "unit ID");
    const cleanUnitId = unitId.trim();
    const { fullName, phone, email, moveInDate } =
      normalizeTenantInput(tenantData);

    // 1. Get the unit's actual monthly rent.
    const { data: unit, error: unitError } = await supabase
      .from("property_units")
      .select("id, monthly_rent")
      .eq("id", cleanUnitId)
      .maybeSingle();

    if (unitError || !unit) {
      throw new Error(
        unitError
          ? `Could not load the unit's rent: ${unitError.message}`
          : "Flat not found or permission denied."
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
        unit_id: cleanUnitId,
        full_name: fullName,
        phone,
        email,
        tenant_status: "active",
        move_in_date: moveInDate,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    try {
      // 3. Create the tenant's rent record for the current month.
      const now = new Date();
      const rentMonth = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        "01",
      ].join("-");

      const { error: rentError } = await supabase
        .from("rent_payments")
        .insert({
          unit_id: cleanUnitId,
          tenant_id: tenant.id,
          rent_month: rentMonth,
          rent_amount: rentAmount,
          status: "unpaid",
        });

      if (rentError) {
        throw new Error(
          `Could not create initial rent record: ${rentError.message}`
        );
      }

      // 4. Update the unit's occupancy status.
      const { error: occupancyError } = await supabase
        .from("property_units")
        .update({ occupancy_status: "occupied" })
        .eq("id", cleanUnitId);

      if (occupancyError) {
        throw new Error("Could not update unit occupancy status.");
      }

      return tenant;
    } catch (downstreamError) {
      // Best-effort rollback so no orphaned half-created tenant remains
      await supabase.from("rent_payments").delete().eq("tenant_id", tenant.id);
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw downstreamError;
    }
  },

  async updateTenant(tenantId, tenantData) {
    assertValidUuid(tenantId, "tenant ID");
    const { fullName, phone, email } = normalizeTenantInput(tenantData);

    const { data, error } = await supabase
      .from("tenants")
      .update({
        full_name: fullName,
        phone,
        email,
      })
      .eq("id", tenantId.trim())
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Tenant not found or permission denied.");
    return data;
  },

  async vacateUnitAndDeleteTenants(unitId) {
    assertValidUuid(unitId, "unit ID");

    const { data, error } = await supabase.functions.invoke("vacant-unit", {
      body: { unit_id: unitId.trim() },
    });

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to vacate this flat."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to vacate this flat.");
    }

    return data.unit ?? null;
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
        age,
        family_members,
        profession,
        tenant_status,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export default TenantService;