// Carbon Footprint Calculator Utilities
// Based on standard Greenhouse Gas (GHG) Protocol emission factors

export const EMISSION_FACTORS = {
  transport: {
    petrol_suv: 0.28,      // kg CO2e per km
    petrol_car: 0.19,      // kg CO2e per km
    electric_car: 0.05,    // kg CO2e per km (grid charging average)
    metro_train: 0.04,     // kg CO2e per km
    bus: 0.08,             // kg CO2e per km
    bicycle_walk: 0.00,    // kg CO2e per km
  },
  food: {
    beef: 5.5,             // kg CO2e per meal
    poultry_pork: 1.5,     // kg CO2e per meal
    vegetarian: 0.6,       // kg CO2e per meal
    vegan: 0.3,            // kg CO2e per meal
  },
  energy: {
    coal_grid: 0.50,       // kg CO2e per kWh
    average_grid: 0.38,    // kg CO2e per kWh
    renewable: 0.02,       // kg CO2e per kWh
  },
  waste: {
    landfill: 1.2,         // kg CO2e per kg
    recycled: 0.1,         // kg CO2e per kg
  }
};

/**
 * Calculates emission for transit
 * @param {string} type - Transport type
 * @param {number} distance - Distance in km
 */
export const calculateTransport = (type, distance) => {
  const factor = EMISSION_FACTORS.transport[type] || 0.19;
  return Number((distance * factor).toFixed(2));
};

/**
 * Calculates emission for food
 * @param {string} type - Food type
 * @param {number} meals - Number of meals
 */
export const calculateFood = (type, meals = 1) => {
  const factor = EMISSION_FACTORS.food[type] || 0.6;
  return Number((meals * factor).toFixed(2));
};

/**
 * Calculates emission for energy/electricity
 * @param {string} type - Grid type
 * @param {number} kwh - Energy in kWh
 */
export const calculateEnergy = (type, kwh) => {
  const factor = EMISSION_FACTORS.energy[type] || 0.38;
  return Number((kwh * factor).toFixed(2));
};

/**
 * Calculates emission for waste
 * @param {string} type - Waste treatment type
 * @param {number} weight - Weight in kg
 */
export const calculateWaste = (type, weight) => {
  const factor = EMISSION_FACTORS.waste[type] || 1.2;
  return Number((weight * factor).toFixed(2));
};

/**
 * Project a user's annual carbon footprint and net-zero year based on lifestyle factors
 * @param {object} habits - Lifestyle habits object
 * @returns {object} { annualEmissions, netZeroYear }
 */
export const projectNetZero = (habits) => {
  // habits values:
  // transportKmPerWeek, transportType
  // mealsPerWeek (beef, poultry, vegetarian, vegan)
  // kwhPerMonth, renewablePercentage
  // wasteKgPerWeek, recyclingPercentage

  // 1. Transport
  const weeklyTransport = calculateTransport(habits.transportType, habits.transportKmPerWeek);
  const annualTransport = weeklyTransport * 52;

  // 2. Food
  const annualFood = (
    habits.beefMealsPerWeek * EMISSION_FACTORS.food.beef +
    habits.poultryMealsPerWeek * EMISSION_FACTORS.food.poultry_pork +
    habits.vegMealsPerWeek * EMISSION_FACTORS.food.vegetarian +
    habits.veganMealsPerWeek * EMISSION_FACTORS.food.vegan
  ) * 52;

  // 3. Energy
  const monthlyKwh = habits.kwhPerMonth;
  const renewableFraction = habits.renewablePercentage / 100;
  const standardFraction = 1 - renewableFraction;
  const averageEnergyFactor = (standardFraction * EMISSION_FACTORS.energy.average_grid) + (renewableFraction * EMISSION_FACTORS.energy.renewable);
  const annualEnergy = monthlyKwh * 12 * averageEnergyFactor;

  // 4. Waste
  const weeklyWaste = habits.wasteKgPerWeek;
  const recycledFraction = habits.recyclingPercentage / 100;
  const landfillFraction = 1 - recycledFraction;
  const averageWasteFactor = (landfillFraction * EMISSION_FACTORS.waste.landfill) + (recycledFraction * EMISSION_FACTORS.waste.recycled);
  const annualWaste = weeklyWaste * 52 * averageWasteFactor;

  const totalAnnual = Math.round(annualTransport + annualFood + annualEnergy + annualWaste);

  // Calculate Net Zero Target Year
  // Average target baseline is 2050. Better practices speed it up, worse slow it down.
  // Standard target is 2050 (based on ~8000 kg CO2e / year baseline per capita in developed countries).
  // Target = 2050 - (baseline_average - totalAnnual) * multiplier.
  const baseline = 8000; // 8 tonnes
  const diff = baseline - totalAnnual;
  
  // Each 500kg below baseline shaves off 1.5 years.
  // Maximum speed-up: target year 2028.
  let netZeroYear = 2050 - Math.round(diff * 0.003);
  if (netZeroYear < 2028) netZeroYear = 2028;
  if (netZeroYear > 2065) netZeroYear = 2065;

  return {
    annualTransport: Math.round(annualTransport),
    annualFood: Math.round(annualFood),
    annualEnergy: Math.round(annualEnergy),
    annualWaste: Math.round(annualWaste),
    totalAnnual,
    netZeroYear
  };
};
