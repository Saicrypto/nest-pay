
import PropertyService from "./PropertyService";
import UnitService from "./UnitService";

const DashboardService = {
  async getStats() {
    const [properties, units] = await Promise.all([
      PropertyService.getMyProperties(),
      UnitService.getMyUnits(),
    ]);

    const occupied = units.filter(
      (unit) => unit.occupancy_status === "occupied"
    ).length;

    const vacant = units.filter(
      (unit) => unit.occupancy_status === "vacant"
    ).length;

    const monthlyRent = units
      .filter((unit) => unit.occupancy_status === "occupied")
      .reduce((total, unit) => total + Number(unit.monthly_rent || 0), 0);

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
