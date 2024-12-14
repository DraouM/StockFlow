const UtilityHelpers = {
  // Format number to 2 decimal places and add thousands separator
  formatNumber(number) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  // Parse a number from a formatted string (removes non-numeric chars except decimal)
  parseNumber(str) {
    const cleanStr = str.replace(/[^\d.-]/g, "");
    const number = parseFloat(cleanStr);
    return isNaN(number) ? 0 : number;
  },

  // Validate if string contains only numbers, spaces, ampersand
  isValidQuantityFormat(str) {
    return /^\d+(?:\s*&\s*\d+)?$/.test(str.trim());
  },

  // Validate if string is a valid positive number
  isValidPrice(str) {
    const number = this.parseNumber(str);
    return number >= 0;
  },

  // Convert sub-units back to quantity string
  convertSubUnitsToQuantity(subUnits, quantityUnit) {
    if (!subUnits) return 0;
    if (quantityUnit == 1) return subUnits;

    const units = Math.floor(subUnits / quantityUnit);
    const remainingSubUnits = subUnits % quantityUnit;

    // If we only have sub-units (less than one full unit)
    if (units === 0) {
      return `0 & ${remainingSubUnits}`;
    }

    // If we have exact units (no remaining sub-units)
    if (remainingSubUnits === 0) {
      return `${units}`;
    }

    // If we have both units and sub-units
    return `${units} & ${remainingSubUnits}`;
  },

  // Calculate total sub-units from quantity string
  calculateTotalSubUnits(quantityStr, quantityUnit) {
    const cleaned = quantityStr.trim().replace(/\s+/g, " ");

    if (cleaned.includes("&")) {
      const [units, subUnits] = cleaned.split("&").map((part) => {
        const num = parseInt(part.trim(), 10);
        return isNaN(num) ? 0 : num;
      });

      return units * quantityUnit + subUnits;
    }

    const units = parseInt(cleaned, 10);
    return isNaN(units) ? 0 : units * quantityUnit;
  },
};

// Export both objects
export { UtilityHelpers };
