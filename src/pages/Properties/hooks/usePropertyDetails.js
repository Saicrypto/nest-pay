
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import PropertyService from "../../../services/PropertyService";
import UnitService from "../../../services/UnitService";
import TenantService from "../../../services/TenantService";
import {
  getPropertyDetailsCache,
  setPropertyDetailsCache,
} from "../cache/propertyDetailsCache";


function sortUnits(units) {
  return [...units].sort((a, b) => {
    const nameA = a.unit_name.replace(/^flat\s*/i, "").trim();
    const nameB = b.unit_name.replace(/^flat\s*/i, "").trim();
    
    return nameA.localeCompare(nameB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

export default function usePropertyDetails() {
  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [units, setUnits] = useState([]);

  const [unitName, setUnitName] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [maintenanceAmount, setMaintenanceAmount] = useState("0");
  const [rentDueDay, setRentDueDay] = useState("5");
  const [editingUnitName, setEditingUnitName] = useState("");
const [editingFloorNumber, setEditingFloorNumber] = useState("");
const [editingBedrooms, setEditingBedrooms] = useState("");
const [editingMonthlyRent, setEditingMonthlyRent] = useState("");
const [editingSecurityDeposit, setEditingSecurityDeposit] = useState("");
const [editingMaintenanceAmount, setEditingMaintenanceAmount] = useState("0");
const [editingRentDueDay, setEditingRentDueDay] = useState("5");
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitError, setUnitError] = useState("");
  const [unitSuccess, setUnitSuccess] = useState("");
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
const [unitToDelete, setUnitToDelete] = useState(null);
const [deletingUnitId, setDeletingUnitId] = useState(null);
  const [tenantsByUnit, setTenantsByUnit] = useState({});
  const [showTenantFormFor, setShowTenantFormFor] = useState(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantError, setTenantError] = useState("");
  const [tenantSuccess, setTenantSuccess] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  const [occupancyConfirmation, setOccupancyConfirmation] = useState(null);
  const [deletingTenantUnitId, setDeletingTenantUnitId] = useState(null);

  useEffect(() => {
    if (!toastMessage) return;

    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToastMessage("");
    }, 5000);

    return () => clearTimeout(toastTimer.current);
  }, [toastMessage]);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  
useEffect(() => {
  let active = true;

  async function loadProperty() {
    setLoading(true);
    setError("");

    const cached = getPropertyDetailsCache(propertyId);

    if (cached) {
      setProperty(cached.property);
      setUnits(cached.units);
      setTenantsByUnit(cached.tenantsByUnit);
      setLoading(false);
      return;
    }

    try {
      const properties = await PropertyService.getMyProperties();
      const unitData = await UnitService.getUnitsByProperty(propertyId);

      const selectedProperty = properties.find(
        (item) => item.id === propertyId
      );

      if (!selectedProperty) {
        throw new Error(
          "Property not found or you don't have access to it."
        );
      }

      const sortedUnits = sortUnits(unitData);

      const tenantEntries = await Promise.all(
        sortedUnits.map(async (unit) => [
          unit.id,
          await TenantService.getTenantsByUnit(unit.id),
        ])
      );

      const tenantData = Object.fromEntries(tenantEntries);

      if (active) {
        setProperty(selectedProperty);
        setUnits(sortedUnits);
        setTenantsByUnit(tenantData);

        setPropertyDetailsCache(propertyId, {
          property: selectedProperty,
          units: sortedUnits,
          tenantsByUnit: tenantData,
        });
      }
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load property.");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadProperty();

  return () => {
    active = false;
  };
}, [propertyId]);


async function handleUpdateUnit(event, unitId, unitData) {
  event.preventDefault();

  setSavingUnit(true);
  setUnitError("");
  setUnitSuccess("");

  try {
    const updatedUnit = await UnitService.updateUnit(unitId, unitData);

    setUnits((current) => {
      const updatedUnits = sortUnits(
        current.map((unit) =>
          unit.id === unitId ? { ...unit, ...updatedUnit } : unit
        )
      );

      const cached = getPropertyDetailsCache(propertyId);

      if (cached) {
        setPropertyDetailsCache(propertyId, {
          ...cached,
          units: updatedUnits,
        });
      }

      return updatedUnits;
    });

    setEditingUnit(null);
    setUnitSuccess("Flat updated successfully!");
  } catch (err) {
    setUnitError(err.message || "Unable to update flat.");
  } finally {
    setSavingUnit(false);
  }
}

  async function handleCreateUnit(event) {
    event.preventDefault();
    setSavingUnit(true);
    setUnitError("");
    setUnitSuccess("");

    try {
      const newUnit = await UnitService.createUnit(propertyId, {
        unitName,
        floorNumber,
        bedrooms,
        monthlyRent,
        securityDeposit,
        maintenanceAmount,
        rentDueDay,
      });

     setUnits((current) => {
  const updatedUnits = sortUnits([...current, newUnit]);

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      units: updatedUnits,
    });
  }

  return updatedUnits;
});
      setUnitSuccess("Unit added successfully!");
      setShowUnitForm(false);

      setUnitName("");
      setFloorNumber("");
      setBedrooms("");
      setMonthlyRent("");
      setSecurityDeposit("");
      setMaintenanceAmount("0");
      setRentDueDay("5");
    } catch (err) {
      if (err.code === "23505") {
        setToastMessage(
          `${unitName.trim()} on Floor ${
            floorNumber === "" ? "unspecified floor" : floorNumber
          } already exists in this property.`
        );
      } else {
        setUnitError(err.message || "Unable to add unit.");
      }
    } finally {
      setSavingUnit(false);
    }
  }

function handleEditUnit(unit) {
  setEditingUnit(unit);

  setEditingUnitName(unit.unit_name || "");
  setEditingFloorNumber(
    unit.floor_number == null ? "" : String(unit.floor_number)
  );
  setEditingBedrooms(
    unit.bedrooms == null ? "" : String(unit.bedrooms)
  );
  setEditingMonthlyRent(
    unit.monthly_rent == null ? "" : String(unit.monthly_rent)
  );
  setEditingSecurityDeposit(
    unit.security_deposit == null ? "" : String(unit.security_deposit)
  );
  setEditingMaintenanceAmount(
    unit.maintenance_amount == null ? "0" : String(unit.maintenance_amount)
  );
  setEditingRentDueDay(
    unit.rent_due_day == null ? "5" : String(unit.rent_due_day)
  );

  setUnitError("");
  setUnitSuccess("");
  setUnitToDelete(null);
}



function handleRequestDeleteUnit(unit) {
  setUnitToDelete(unit);
  setUnitError("");
  setUnitSuccess("");
}

async function handleConfirmDeleteUnit() {
  if (!unitToDelete || deletingUnitId) return;

  const unitId = unitToDelete.id;

  setDeletingUnitId(unitId);
  setUnitError("");
  setUnitSuccess("");

  try {
    await UnitService.deleteUnit(unitId);

    setUnits((current) => {
      const updatedUnits = current.filter((unit) => unit.id !== unitId);

      const cached = getPropertyDetailsCache(propertyId);

      if (cached) {
        const updatedTenantsByUnit = { ...cached.tenantsByUnit };
        delete updatedTenantsByUnit[unitId];

        setPropertyDetailsCache(propertyId, {
          ...cached,
          units: updatedUnits,
          tenantsByUnit: updatedTenantsByUnit,
        });
      }

      return updatedUnits;
    });

    setTenantsByUnit((current) => {
      const updatedTenants = { ...current };
      delete updatedTenants[unitId];
      return updatedTenants;
    });

    setUnitToDelete(null);
    setEditingUnit(null);
    setShowTenantFormFor((current) =>
      current === unitId ? null : current
    );
    setUnitSuccess("Flat deleted successfully.");
  } catch (err) {
    setUnitError(
      err.message ||
        "Unable to delete this flat. Check whether it has linked tenants or payment records."
    );
  } finally {
    setDeletingUnitId(null);
  }
}

async function handleOccupancyChange(unitId, newStatus) {
  setUnitError("");
  setUnitSuccess("");

  const unit = units.find((item) => item.id === unitId);

  if (
    unit?.occupancy_status === "occupied" &&
    newStatus === "vacant"
  ) {
    setOccupancyConfirmation({ unitId });
    return;
  }

  try {
    const updatedUnit = await UnitService.updateOccupancyStatus(
      unitId,
      newStatus
    );

   setUnits((current) => {
  const updatedUnits = current.map((item) =>
    item.id === unitId ? { ...item, ...updatedUnit } : item
  );

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      units: updatedUnits,
    });
  }

  return updatedUnits;
});

    setUnitSuccess("Occupancy status updated successfully!");
  } catch (err) {
    setUnitError(err.message || "Unable to update occupancy status.");
  }
}

async function handleConfirmVacate() {
  if (!occupancyConfirmation || deletingTenantUnitId) return;

  const unitId = occupancyConfirmation.unitId;

  setDeletingTenantUnitId(unitId);
  setUnitError("");
  setUnitSuccess("");

  try {
    await TenantService.vacateUnitAndDeleteTenants(unitId);

setTenantsByUnit((current) => {
  const updatedTenants = {
    ...current,
    [unitId]: [],
  };

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      tenantsByUnit: updatedTenants,
    });
  }

  return updatedTenants;
});

setUnits((current) => {
  const updatedUnits = current.map((unit) =>
    unit.id === unitId
      ? { ...unit, occupancy_status: "vacant" }
      : unit
  );

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      units: updatedUnits,
    });
  }

  return updatedUnits;
});

    setOccupancyConfirmation(null);
    setUnitSuccess("Tenant details removed. Unit is now vacant.");
  } catch (err) {
    setUnitError(
      err.message || "Unable to vacate this unit. Please try again."
    );
  } finally {
    setDeletingTenantUnitId(null);
  }
}



  async function loadTenantsForUnit(unitId) {
    try {
      const tenantData = await TenantService.getTenantsByUnit(unitId);

      setTenantsByUnit((current) => ({
        ...current,
        [unitId]: tenantData,
      }));
    } catch (err) {
      setTenantError(err.message || "Unable to load tenants.");
    }
  }

  function handleTenantFormToggle(unitId) {
    const isOpening = showTenantFormFor !== unitId;

    setShowTenantFormFor(isOpening ? unitId : null);
    setTenantError("");
    setTenantSuccess("");

    if (isOpening && tenantsByUnit[unitId] === undefined) {
      loadTenantsForUnit(unitId);
    }
  }


  async function handleCreateTenant(event, unitId) {
    event.preventDefault();
    setSavingTenant(true);
    setTenantError("");
    setTenantSuccess("");

    try {
      const newTenant = await TenantService.createTenant(unitId, {
        fullName: tenantName,
        phone: tenantPhone,
        email: tenantEmail,
      });


setTenantsByUnit((current) => {
  const updatedTenants = {
    ...current,
    [unitId]: [newTenant, ...(current[unitId] || [])],
  };

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      tenantsByUnit: updatedTenants,
    });
  }

  return updatedTenants;
});

setUnits((current) => {
  const updatedUnits = current.map((unit) =>
    unit.id === unitId
      ? { ...unit, occupancy_status: "occupied" }
      : unit
  );

  const cached = getPropertyDetailsCache(propertyId);

  if (cached) {
    setPropertyDetailsCache(propertyId, {
      ...cached,
      units: updatedUnits,
    });
  }

  return updatedUnits;
});


      setTenantSuccess("Tenant added successfully!");
      setShowTenantFormFor(null);
      setTenantName("");
      setTenantPhone("");
      setTenantEmail("");
    } catch (err) {
      setTenantError(err.message || "Unable to add tenant.");
    } finally {
      setSavingTenant(false);
    }
  }

  function handleUnitNameChange(value) {
    const cleanedValue = value.replace(/^flat\s*/i, "");
    setUnitName(cleanedValue ? `Flat ${cleanedValue}` : "");
  }

  function closeDuplicateToast() {
    clearTimeout(toastTimer.current);
    setToastMessage("");
  }

  return {
    propertyId,
    property,
    loading,
    error,
    units,
    unitName,
    setUnitName: handleUnitNameChange,
    floorNumber,
    setFloorNumber,
    bedrooms,
    setBedrooms,
    monthlyRent,
    setMonthlyRent,
    securityDeposit,
    setSecurityDeposit,
    maintenanceAmount,
    setMaintenanceAmount,
    rentDueDay,
    setRentDueDay,
    savingUnit,
    unitError,
    unitSuccess,
    showUnitForm,
    setShowUnitForm,
    tenantsByUnit,
    showTenantFormFor,
    tenantName,
    setTenantName,
    tenantPhone,
    setTenantPhone,
    tenantEmail,
    setTenantEmail,
    savingTenant,
    tenantError,
    tenantSuccess,
    toastMessage,
    closeDuplicateToast,
    handleCreateUnit,
    handleOccupancyChange,
    handleTenantFormToggle,
    handleCreateTenant,
    occupancyConfirmation,
    setOccupancyConfirmation,
    deletingTenantUnitId,
    handleConfirmVacate,
    editingUnit,
setEditingUnit,
unitToDelete,
setUnitToDelete,
deletingUnitId,
editingUnitName,
setEditingUnitName,
editingFloorNumber,
setEditingFloorNumber,
editingBedrooms,
setEditingBedrooms,
editingMonthlyRent,
setEditingMonthlyRent,
editingSecurityDeposit,
setEditingSecurityDeposit,
editingMaintenanceAmount,
setEditingMaintenanceAmount,
editingRentDueDay,
setEditingRentDueDay,
handleEditUnit,
handleUpdateUnit,
handleRequestDeleteUnit,
handleConfirmDeleteUnit,

  };
}
