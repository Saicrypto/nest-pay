import { supabase } from "../../../lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

const UnitAccessCodeService = {
  async generateCode(unitId, rentStartDate) {
    if (typeof unitId !== "string" || !UUID_REGEX.test(unitId)) {
      throw new Error("Invalid unit ID.");
    }

    if (
      rentStartDate !== undefined &&
      rentStartDate !== null &&
      rentStartDate !== "" &&
      (typeof rentStartDate !== "string" || !DATE_REGEX.test(rentStartDate))
    ) {
      throw new Error("Invalid rent start date format (expected YYYY-MM-DD).");
    }

    const { data, error } = await supabase.functions.invoke(
      "manage-unit-access-code",
      {
        body: {
          unit_id: unitId,
          rent_start_date: rentStartDate || null,
        },
      }
    );

    if (error) {
      const message = await extractFunctionError(
        error,
        "Unable to generate access code."
      );
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to generate access code.");
    }

    return data;
  },
};

export default UnitAccessCodeService;