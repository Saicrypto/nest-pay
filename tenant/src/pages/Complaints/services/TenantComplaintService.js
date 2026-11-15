import { supabase } from "../../../lib/supabase";



const TenantComplaintService = {
  async raiseComplaint(deviceToken, title, description) {
    const { data, error } = await supabase.functions.invoke(
      "raise-tenant-complaint",
      {
        body: {
          device_token: deviceToken,
          title,
          description,
        },
      }
    );

    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || "Unable to submit complaint.");
    }

    return data.complaint;
  },

  async getComplaints(deviceToken) {
  const { data, error } = await supabase.functions.invoke(
    "raise-tenant-complaint",
    {
      body: {
        action: "list",
        device_token: deviceToken,
      },
    }
  );

  if (error) throw error;

  if (!data?.success) {
    throw new Error(data?.error || "Unable to load complaints.");
  }

  return data.complaints || [];
},
};

export default TenantComplaintService;