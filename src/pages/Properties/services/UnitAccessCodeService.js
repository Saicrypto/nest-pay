
import { supabase } from "../../../lib/supabase";

const UnitAccessCodeService = {
  async generateCode(unitId, rentStartDate) {
    const { data, error } = await supabase.functions.invoke(
      "manage-unit-access-code",
      {
        body: {
          unit_id: unitId,
          rent_start_date: rentStartDate,
        },
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || "Unable to generate access code.");
    }

    return data;
  },
};

export default UnitAccessCodeService;
