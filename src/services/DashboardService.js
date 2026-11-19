import PropertyService from "./PropertyService";
import UnitService from "./UnitService";

const DashboardService = {
  async getStats() {
    const [rawProperties, rawUnits] = await Promise.all([
      PropertyService.getMyProperties(),
      UnitService.getMyUnits(),
    ]);

    const properties = Array.isArray(rawProperties) ? rawProperties : [];
    const units = Array.isArray(rawUnits) ? rawUnits : [];

    let occupied = 0;
    let vacant = 0;
    let monthlyRent = 0;

    for (const unit of units) {
      if (unit?.occupancy_status === "occupied") {
        occupied += 1;
        const rent = Number(unit.monthly_rent);
        if (Number.isFinite(rent)) {
          monthlyRent += rent;
        }
      } else if (unit?.occupancy_status === "vacant") {
        vacant += 1;
      }
    }

    return {
      properties: properties.length,
      units: units.length,
      occupied,
      vacant,
      monthlyRent,
    };
  },
};

export default DashboardService;