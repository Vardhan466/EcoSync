// Smart Natural Language Parsing simulator for EcoSync Carbon Ledger

import { calculateTransport, calculateFood, calculateEnergy, calculateWaste } from './carbonCalculator';

// Dictionary mapping input keywords to specific categories and sub-types
const KEYWORDS = {
  transport: [
    { keys: ['suv', 'truck', 'petrol suv', 'diesel suv'], type: 'petrol_suv', name: 'Petrol SUV' },
    { keys: ['car', 'drove', 'drive', 'petrol car', 'gas car'], type: 'petrol_car', name: 'Petrol Car' },
    { keys: ['electric car', 'ev', 'tesla', 'electric vehicle'], type: 'electric_car', name: 'Electric Car' },
    { keys: ['subway', 'metro', 'train', 'tube', 'rail', 'commuted by subway', 'commuted by train'], type: 'metro_train', name: 'Metro / Train' },
    { keys: ['bus', 'shuttle'], type: 'bus', name: 'Bus' },
    { keys: ['bike', 'bicycle', 'walk', 'walked', 'cycled', 'foot'], type: 'bicycle_walk', name: 'Active Transit' },
  ],
  food: [
    { keys: ['beef', 'steak', 'hamburger', 'burger', 'lamb', 'red meat'], type: 'beef', name: 'Beef Meal' },
    { keys: ['chicken', 'poultry', 'pork', 'turkey', 'fish', 'seafood', 'meat'], type: 'poultry_pork', name: 'Meat/Poultry Meal' },
    { keys: ['vegetarian', 'veg', 'pasta', 'cheese', 'egg', 'dairy'], type: 'vegetarian', name: 'Vegetarian Meal' },
    { keys: ['vegan', 'salad', 'tofu', 'plant-based', 'plantbased', 'fruit'], type: 'vegan', name: 'Vegan Meal' },
  ],
  energy: [
    { keys: ['solar', 'wind', 'renewable', 'clean power'], type: 'renewable', name: 'Renewable Electricity' },
    { keys: ['coal', 'fossil'], type: 'coal_grid', name: 'Coal Power' },
    { keys: ['grid', 'electricity', 'kwh', 'power', 'used', 'bill'], type: 'average_grid', name: 'Grid Electricity' },
  ],
  waste: [
    { keys: ['recycle', 'recycled', 'compost', 'composted', 'cardboard', 'plastic bottle'], type: 'recycled', name: 'Recycled Waste' },
    { keys: ['waste', 'garbage', 'trash', 'landfill', 'bag'], type: 'landfill', name: 'Landfill Waste' }
  ]
};

/**
 * Parses a natural language sentence and extracts carbon ledger details
 * @param {string} text - User input string (e.g. "I commuted 15km by metro and ate a vegetarian salad")
 * @returns {Array<object>} List of extracted transactions
 */
export const parseNaturalLanguage = (text) => {
  if (!text || text.trim() === '') return [];

  const lowerText = text.toLowerCase();
  const transactions = [];

  // Match numbers in the sentence
  const numberPattern = /(\d+(\.\d+)?)\s*(km|kms|kilometers|kilometer|miles|mile|mi|kwh|kwhs|kg|kgs|kilograms|kilogram|lbs|pound|pounds|meals|meal)?/g;
  const numbersFound = [];
  let match;
  while ((match = numberPattern.exec(lowerText)) !== null) {
    numbersFound.push({
      value: parseFloat(match[1]),
      unit: match[3] || '',
      index: match.index,
      fullText: match[0]
    });
  }

  // Helper: check proximity of keywords to the found numbers
  const getClosestNumber = (keywordIndex, defaultValue = 1) => {
    if (numbersFound.length === 0) return defaultValue;
    
    // Find number closest to the keyword position
    let closest = numbersFound[0];
    let minDistance = Math.abs(numbersFound[0].index - keywordIndex);

    for (let i = 1; i < numbersFound.length; i++) {
      const distance = Math.abs(numbersFound[i].index - keywordIndex);
      if (distance < minDistance) {
        minDistance = distance;
        closest = numbersFound[i];
      }
    }
    return closest.value;
  };

  // Helper: check unit compatibility
  const getUnitForCategory = (category, parsedUnit) => {
    if (category === 'transport') {
      if (['miles', 'mile', 'mi'].includes(parsedUnit)) return 'mi';
      return 'km';
    }
    if (category === 'food') return 'meals';
    if (category === 'energy') return 'kWh';
    if (category === 'waste') {
      if (['lbs', 'pound', 'pounds'].includes(parsedUnit)) return 'lbs';
      return 'kg';
    }
    return '';
  };

  // 1. Check Transport keywords
  KEYWORDS.transport.forEach(item => {
    item.keys.forEach(key => {
      const idx = lowerText.indexOf(key);
      if (idx !== -1) {
        // Find if we have a distance close by
        let rawVal = getClosestNumber(idx, 10); // default to 10km if none specified
        let unit = 'km';
        
        // Find if the closest number had a unit
        const closestNum = numbersFound.find(n => Math.abs(n.index - idx) < 20);
        if (closestNum) {
          rawVal = closestNum.value;
          const parsedUnit = getUnitForCategory('transport', closestNum.unit);
          if (parsedUnit === 'mi') {
            rawVal = rawVal * 1.60934; // Convert miles to km
            unit = 'km';
          }
        }
        
        const co2e = calculateTransport(item.type, rawVal);
        transactions.push({
          id: 't-' + Math.random().toString(36).substr(2, 9),
          category: 'transport',
          subType: item.type,
          label: `${item.name} (${Math.round(rawVal)} km)`,
          value: Math.round(rawVal),
          unit: 'km',
          co2e,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // 2. Check Food keywords
  KEYWORDS.food.forEach(item => {
    item.keys.forEach(key => {
      const idx = lowerText.indexOf(key);
      if (idx !== -1) {
        // Check for count (e.g. "2 burgers", "3 meals")
        let rawVal = 1; // default to 1 meal
        const closestNum = numbersFound.find(n => Math.abs(n.index - idx) < 15);
        if (closestNum && (closestNum.unit === 'meals' || closestNum.unit === 'meal' || !closestNum.unit)) {
          rawVal = closestNum.value;
        }

        const co2e = calculateFood(item.type, rawVal);
        transactions.push({
          id: 'f-' + Math.random().toString(36).substr(2, 9),
          category: 'food',
          subType: item.type,
          label: `${item.name} (${rawVal}x)`,
          value: rawVal,
          unit: 'meals',
          co2e,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // 3. Check Energy keywords
  KEYWORDS.energy.forEach(item => {
    item.keys.forEach(key => {
      const idx = lowerText.indexOf(key);
      if (idx !== -1) {
        let rawVal = 15; // default 15 kWh
        const closestNum = numbersFound.find(n => Math.abs(n.index - idx) < 25);
        if (closestNum) {
          rawVal = closestNum.value;
        }

        const co2e = calculateEnergy(item.type, rawVal);
        transactions.push({
          id: 'e-' + Math.random().toString(36).substr(2, 9),
          category: 'energy',
          subType: item.type,
          label: `${item.name} (${rawVal} kWh)`,
          value: rawVal,
          unit: 'kWh',
          co2e,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // 4. Check Waste keywords
  KEYWORDS.waste.forEach(item => {
    item.keys.forEach(key => {
      const idx = lowerText.indexOf(key);
      if (idx !== -1) {
        let rawVal = 2; // default 2 kg
        let unit = 'kg';
        const closestNum = numbersFound.find(n => Math.abs(n.index - idx) < 20);
        if (closestNum) {
          rawVal = closestNum.value;
          const parsedUnit = getUnitForCategory('waste', closestNum.unit);
          if (parsedUnit === 'lbs') {
            rawVal = rawVal * 0.453592; // Convert lbs to kg
          }
        }

        const co2e = calculateWaste(item.type, rawVal);
        transactions.push({
          id: 'w-' + Math.random().toString(36).substr(2, 9),
          category: 'waste',
          subType: item.type,
          label: `${item.name} (${rawVal.toFixed(1)} kg)`,
          value: parseFloat(rawVal.toFixed(1)),
          unit: 'kg',
          co2e,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Deduplicate transactions of the exact same subType to avoid double matches (e.g. "car" and "drove" matching the same thing)
  const uniqueTransactions = [];
  const seenSubTypes = new Set();
  
  transactions.forEach(tx => {
    const key = `${tx.category}-${tx.subType}`;
    if (!seenSubTypes.has(key)) {
      seenSubTypes.add(key);
      uniqueTransactions.push(tx);
    }
  });

  return uniqueTransactions;
};
