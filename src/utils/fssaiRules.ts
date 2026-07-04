/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, ComplianceRule, RuleResult, ComplianceReport } from '../types';

export const FSSAI_RULE_CATALOG: ComplianceRule[] = [
  // CATEGORY 1: MANDATORY DECLARATIONS
  {
    ruleId: 'MAND_PROD_NAME',
    category: 'Mandatory Declarations',
    title: 'Product Name presence',
    description: 'Every packaged food must have the common name of the product on the front of the pack.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.1.1',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.productName || product.productName.trim() === '') {
        return {
          status: 'FAIL',
          evidence: 'Product name was not detected on the label.',
          suggestedFix: 'Place a clear, legible name of the food product on the principal display panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Product name detected: "${product.productName}"`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MAND_BRAND_NAME',
    category: 'Mandatory Declarations',
    title: 'Brand / Trade Name presence',
    description: 'Brand or trade name must be displayed on the label.',
    severity: 'WARNING',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.1',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.brandName || product.brandName.trim() === '') {
        return {
          status: 'WARNING',
          evidence: 'Brand/trade name was not clearly detected on the label.',
          suggestedFix: 'Ensure your brand logo or trade name is clearly visible on the front panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Brand name detected: "${product.brandName}"`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MAND_INGREDIENTS',
    category: 'Ingredient Declaration',
    title: 'List of Ingredients presence',
    description: 'A complete list of ingredients must be declared, headed by a suitable title like "Ingredients:".',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.2',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.ingredients || product.ingredients.length === 0) {
        return {
          status: 'FAIL',
          evidence: 'No ingredients list was detected on the packaging.',
          suggestedFix: 'Add a list of ingredients in descending order of weight or volume at the time of manufacture.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Detected ${product.ingredients.length} ingredients: ${product.ingredients.slice(0, 5).join(', ')}${product.ingredients.length > 5 ? '...' : ''}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MAND_NET_QTY',
    category: 'Mandatory Declarations',
    title: 'Net Quantity presence',
    description: 'Net quantity of the food must be declared in metric system units (g, kg, ml, L).',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.5',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.netQuantity || product.netQuantity.trim() === '') {
        return {
          status: 'FAIL',
          evidence: 'Net quantity was not detected on the label.',
          suggestedFix: 'Declare net quantity on the front panel or near the pricing/batch panel (e.g., "Net Quantity: 400 g").'
        };
      }
      const hasUnit = /[gG]|[kK][gG]|[mM][lL]|[lL]/.test(product.netQuantity);
      if (!hasUnit) {
        return {
          status: 'WARNING',
          evidence: `Net quantity detected ("${product.netQuantity}") but might be missing metric units.`,
          suggestedFix: 'Ensure net quantity is declared using standard metric units like g, kg, ml, or L.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Net quantity detected: "${product.netQuantity}"`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MAND_MANUF_DETAILS',
    category: 'Mandatory Declarations',
    title: 'Manufacturer Details presence',
    description: 'The name and complete address of the manufacturer or packer must be stated.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.6',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.manufacturerDetails || product.manufacturerDetails.trim() === '') {
        return {
          status: 'FAIL',
          evidence: 'Manufacturer or packer name and address are missing.',
          suggestedFix: 'Add "Manufactured by: [Name], [Full physical address including PIN code]".'
        };
      }
      return {
        status: 'PASS',
        evidence: `Manufacturer details detected: "${product.manufacturerDetails.slice(0, 60)}${product.manufacturerDetails.length > 60 ? '...' : ''}"`,
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 2: FSSAI LICENSE & LOGO
  {
    ruleId: 'FSSAI_LICENSE_PRESENCE',
    category: 'FSSAI Licenses',
    title: 'FSSAI Logo and License presence',
    description: 'The FSSAI logo and 14-digit license number must be displayed on the label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.7.1',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.fssaiLicense || product.fssaiLicense.trim() === '') {
        return {
          status: 'FAIL',
          evidence: 'No FSSAI logo or 14-digit license number was detected.',
          suggestedFix: 'Add the FSSAI logo followed by your 14-digit FSSAI license number (e.g., "Lic. No. XXXXXXXXXXXXXX").'
        };
      }
      return {
        status: 'PASS',
        evidence: `FSSAI license number found: "${product.fssaiLicense}"`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'FSSAI_LICENSE_FORMAT',
    category: 'FSSAI Licenses',
    title: 'FSSAI License 14-digit format',
    description: 'The FSSAI license number must be a valid 14-digit numerical format.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.7.1',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.fssaiLicense || product.fssaiLicense.trim() === '') {
        return {
          status: 'NOT_APPLICABLE',
          evidence: 'No license present to check format.',
          suggestedFix: ''
        };
      }
      // Remove spaces, hyphens, and letters to check the numbers
      const digitsOnly = product.fssaiLicense.replace(/\D/g, '');
      if (digitsOnly.length !== 14) {
        return {
          status: 'FAIL',
          evidence: `FSSAI License detected ("${product.fssaiLicense}") contains ${digitsOnly.length} digits. It must be exactly 14 digits.`,
          suggestedFix: 'Verify and print the exact 14-digit FSSAI license number without omitting any digits.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Valid 14-digit FSSAI license format: ${digitsOnly}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'FSSAI_LICENSE_PREFIX',
    category: 'FSSAI Licenses',
    title: 'FSSAI License Prefix validation',
    description: 'FSSAI license numbers must start with a valid standard prefix (1 or 2).',
    severity: 'WARNING',
    citation: 'FSS (Registration and Licensing of Food Businesses) Regulations, 2011',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.fssaiLicense) {
        return { status: 'NOT_APPLICABLE', evidence: 'No license present.', suggestedFix: '' };
      }
      const digitsOnly = product.fssaiLicense.replace(/\D/g, '');
      if (digitsOnly.length === 14) {
        const firstDigit = digitsOnly[0];
        if (firstDigit !== '1' && firstDigit !== '2') {
          return {
            status: 'WARNING',
            evidence: `The license starts with "${firstDigit}". Standard Indian FSSAI licenses typically start with "1" (Central/Manufacturing) or "2" (State/Retail).`,
            suggestedFix: 'Double check the printed FSSAI license number digit-by-digit against your registration certificate.'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'FSSAI license prefix is standard.',
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 3: VEG / NON-VEG SYMBOLS
  {
    ruleId: 'VEG_NONVEG_PRESENCE',
    category: 'Veg / Non-Veg Symbols',
    title: 'Veg / Non-Veg symbol presence',
    description: 'Every packaged food must display a symbol indicating whether it is Vegetarian (Veg) or Non-Vegetarian (Non-Veg).',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.4',
    validate: (product: CanonicalProduct): RuleResult => {
      if (product.isVeg === null) {
        return {
          status: 'FAIL',
          evidence: 'No indicator of Vegetarian or Non-Vegetarian status was found.',
          suggestedFix: 'Incorporate the FSSAI Veg (green circle inside green square) or Non-Veg (brown triangle inside brown square) symbol on the front panel.'
        };
      }
      if (!product.hasVegLogo) {
        return {
          status: 'WARNING',
          evidence: `Product is declared as ${product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} in text, but the standard graphical logo was not detected in the image scan.`,
          suggestedFix: 'Make sure the official FSSAI graphical symbol (green circle / brown triangle) is clearly printed, colored, and unobstructed.'
        };
      }
      return {
        status: 'PASS',
        evidence: `FSSAI ${product.isVeg ? 'Vegetarian (Green Circle)' : 'Non-Vegetarian (Brown Triangle)'} symbol detected successfully.`,
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 4: NUTRITION LABELLING (MANDATORY FIELDS)
  {
    ruleId: 'NUTR_TABLE_PRESENCE',
    category: 'Nutrition Labelling',
    title: 'Nutrition Information Table presence',
    description: 'Nutritional facts must be declared per 100g or 100ml, and per serving of the food.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3',
    validate: (product: CanonicalProduct): RuleResult => {
      const keys = Object.keys(product.nutrition);
      if (keys.length === 0) {
        return {
          status: 'FAIL',
          evidence: 'No nutritional facts table or values were detected on the label.',
          suggestedFix: 'Provide a structured nutritional declaration panel containing Energy, Protein, Carbohydrates, Total Sugar, Added Sugar, Fats, and Sodium.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Nutritional facts table detected with ${keys.length} parameters.`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_ENERGY',
    category: 'Nutrition Labelling',
    title: 'Energy value declaration',
    description: 'Energy value in kcal must be declared on every label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.a',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.energy || product.nutrition.energy.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Energy (Calories) is missing from the nutrition declaration.',
          suggestedFix: 'Add Energy in kcal (kilocalories) to the nutrition facts table (e.g. "Energy: 420 kcal").'
        };
      }
      return {
        status: 'PASS',
        evidence: `Energy declared: ${product.nutrition.energy.value} ${product.nutrition.energy.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_PROTEIN',
    category: 'Nutrition Labelling',
    title: 'Protein declaration',
    description: 'Protein content in grams (g) must be declared on the label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.b',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.protein || product.nutrition.protein.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Protein content is missing from the nutrition declaration.',
          suggestedFix: 'Declare Protein content in grams (g) in your nutritional table.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Protein declared: ${product.nutrition.protein.value} ${product.nutrition.protein.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_CARBS',
    category: 'Nutrition Labelling',
    title: 'Carbohydrates declaration',
    description: 'Carbohydrate content in grams (g) must be declared on the label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.b',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.carbs || product.nutrition.carbs.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Carbohydrates are missing from the nutrition declaration.',
          suggestedFix: 'Add Carbohydrates in grams (g) to your nutritional facts panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Carbohydrates declared: ${product.nutrition.carbs.value} ${product.nutrition.carbs.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_TOTAL_SUGARS',
    category: 'Nutrition Labelling',
    title: 'Total Sugars declaration',
    description: 'Total sugars in grams (g) must be declared on the nutrition label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.b',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.totalSugars || product.nutrition.totalSugars.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Total Sugars content is missing from the nutrition declaration.',
          suggestedFix: 'Add "Total Sugars" under Carbohydrates in the nutritional facts panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Total Sugars declared: ${product.nutrition.totalSugars.value} ${product.nutrition.totalSugars.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_ADDED_SUGARS',
    category: 'Nutrition Labelling',
    title: 'Added Sugars declaration',
    description: 'Added Sugars in grams (g) must be separately declared on the label (mandatory under the latest FSSAI amendments).',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) First Amendment Regulations, 2020',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.addedSugars || product.nutrition.addedSugars.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Added Sugars is missing. Added Sugars must be declared separately from Total Sugars under FSSAI rules.',
          suggestedFix: 'Add a line item "Added Sugars" inside the Sugars subsection of your nutritional facts panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Added Sugars declared: ${product.nutrition.addedSugars.value} ${product.nutrition.addedSugars.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_FAT',
    category: 'Nutrition Labelling',
    title: 'Total Fat declaration',
    description: 'Total fat in grams (g) must be declared on the label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.b',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.totalFat || product.nutrition.totalFat.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Total Fat is missing from the nutrition declaration.',
          suggestedFix: 'Add "Total Fat" (g) to your nutrition facts table.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Total Fat declared: ${product.nutrition.totalFat.value} ${product.nutrition.totalFat.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_SAT_FAT',
    category: 'Nutrition Labelling',
    title: 'Saturated Fat declaration',
    description: 'Saturated fat content in grams (g) must be declared under the Total Fat section.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.c',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.saturatedFat || product.nutrition.saturatedFat.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Saturated Fat is missing from the nutrition declaration.',
          suggestedFix: 'Add a sub-item "Saturated Fat" under the "Total Fat" heading.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Saturated Fat declared: ${product.nutrition.saturatedFat.value} ${product.nutrition.saturatedFat.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_TRANS_FAT',
    category: 'Nutrition Labelling',
    title: 'Trans Fat declaration',
    description: 'Trans fat content in grams (g) must be declared under the Total Fat section.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.c',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.transFat || product.nutrition.transFat.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Trans Fat is missing from the nutrition declaration.',
          suggestedFix: 'Add a sub-item "Trans Fat" under the "Total Fat" heading.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Trans Fat declared: ${product.nutrition.transFat.value} ${product.nutrition.transFat.unit}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'NUTR_SODIUM',
    category: 'Nutrition Labelling',
    title: 'Sodium declaration',
    description: 'Sodium content in milligrams (mg) must be declared on the nutrition label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.d',
    validate: (product: CanonicalProduct): RuleResult => {
      if (Object.keys(product.nutrition).length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No table.', suggestedFix: '' };
      if (!product.nutrition.sodium || product.nutrition.sodium.value === undefined) {
        return {
          status: 'FAIL',
          evidence: 'Sodium is missing from the nutrition declaration.',
          suggestedFix: 'Add Sodium content in milligrams (mg) to the nutritional facts panel.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Sodium declared: ${product.nutrition.sodium.value} ${product.nutrition.sodium.unit}`,
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 5: DATE MARKING & BATCH NUMBER
  {
    ruleId: 'DATE_MANUF_PRESENCE',
    category: 'Date Marking',
    title: 'Manufacture Date presence',
    description: 'Date of manufacture or packing must be declared on all packaged food.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.8.1',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.dateMarking || !product.dateMarking.manufactureDate) {
        return {
          status: 'FAIL',
          evidence: 'Date of manufacture / packaging was not detected.',
          suggestedFix: 'Print a clear manufacture or packing date on the pack (e.g. "Mfg Date: 12/2025" or "Packed on: 15/01/2026").'
        };
      }
      return {
        status: 'PASS',
        evidence: `Manufacture date detected: "${product.dateMarking.manufactureDate}"`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'DATE_EXPIRY_PRESENCE',
    category: 'Date Marking',
    title: 'Expiry / Best Before date presence',
    description: 'Every label must display either the Expiry Date (Use By) or Best Before date.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.8.2',
    validate: (product: CanonicalProduct): RuleResult => {
      const bestBefore = product.dateMarking?.bestBefore;
      const expiry = product.dateMarking?.expiryDate;
      if (!bestBefore && !expiry) {
        return {
          status: 'FAIL',
          evidence: 'Neither Expiry Date nor Best Before date was detected.',
          suggestedFix: 'Provide a "Best Before" date (e.g., "Best Before 6 months from packaging") or an "Expiry / Use By" date.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Shelf life indicator detected: ${bestBefore ? `Best Before "${bestBefore}"` : ''} ${expiry ? `Expiry Date "${expiry}"` : ''}`,
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'DATE_FORMAT',
    category: 'Date Marking',
    title: 'Date format compliance',
    description: 'FSSAI mandates standard date formats for manufacture and expiry declarations (DD/MM/YYYY or MM/YYYY).',
    severity: 'WARNING',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.8',
    validate: (product: CanonicalProduct): RuleResult => {
      const datesToTest = [
        product.dateMarking?.manufactureDate,
        product.dateMarking?.expiryDate,
        product.dateMarking?.bestBefore
      ].filter(Boolean) as string[];

      if (datesToTest.length === 0) return { status: 'NOT_APPLICABLE', evidence: 'No dates present to test.', suggestedFix: '' };

      const formatRegex = /^(0[1-9]|[12][0-9]|3[01])[\/\.\-](0[1-9]|1[012])[\/\.\-]\d{4}$|^(0[1-9]|1[012])[\/\.\-]\d{4}$|^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/;
      const allValid = datesToTest.every(dateStr => formatRegex.test(dateStr.trim()) || dateStr.toLowerCase().includes('month'));

      if (!allValid) {
        return {
          status: 'WARNING',
          evidence: `One or more detected dates ("${datesToTest.join(', ')}") do not clearly match standard DD/MM/YYYY or MM/YYYY numerical formats.`,
          suggestedFix: 'Ensure dates are printed clearly in standard numerical formats like "DD/MM/YYYY" or "MM/YYYY", or simple verbal formats like "Best before 6 months from manufacture".'
        };
      }
      return {
        status: 'PASS',
        evidence: 'Detected date formats conform to standard readability.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MAND_BATCH_NUM',
    category: 'Mandatory Declarations',
    title: 'Batch or Lot Number presence',
    description: 'A batch number, lot number, or code reference is mandatory for traceability.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.5.3',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.batchNumber || product.batchNumber.trim() === '') {
        return {
          status: 'FAIL',
          evidence: 'Batch number or lot identifier was not detected.',
          suggestedFix: 'Print a clear batch or lot identifier on the pack (e.g., "Batch No: B1024" or "Lot Code: L345").'
        };
      }
      return {
        status: 'PASS',
        evidence: `Batch number detected: "${product.batchNumber}"`,
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 6: STORAGE INSTRUCTIONS
  {
    ruleId: 'MAND_STORAGE_INSTR',
    category: 'Storage Instructions',
    title: 'Storage Instructions presence',
    description: 'Specific storage instructions must be declared if the shelf life depends on them.',
    severity: 'WARNING',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.8.5',
    validate: (product: CanonicalProduct): RuleResult => {
      if (!product.storageInstructions || product.storageInstructions.trim() === '') {
        return {
          status: 'WARNING',
          evidence: 'No specific storage guidelines were detected.',
          suggestedFix: 'Add standard storage text like "Store in a cool, dry place away from direct sunlight" to protect the food quality.'
        };
      }
      return {
        status: 'PASS',
        evidence: `Storage instructions detected: "${product.storageInstructions}"`,
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 7: SPECIAL WARNINGS & INGREDIENT RULES
  {
    ruleId: 'ALLERGEN_WARNING',
    category: 'Special Declarations',
    title: 'Allergen Information check',
    description: 'Allergens listed in regulations must be highlighted or declared separately (e.g. "Contains: Wheat, Soy").',
    severity: 'WARNING',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.2.3',
    validate: (product: CanonicalProduct): RuleResult => {
      const commonAllergens = ['wheat', 'gluten', 'soy', 'soya', 'milk', 'peanut', 'almond', 'cashew', 'nuts', 'egg', 'fish', 'sesame'];
      const ingredientsText = product.ingredients.join(' ').toLowerCase();
      const hasAllergensInIngredients = commonAllergens.some(allergen => ingredientsText.includes(allergen));

      if (hasAllergensInIngredients) {
        if (!product.allergenInfo || product.allergenInfo.trim() === '') {
          return {
            status: 'WARNING',
            evidence: 'Ingredients list contains potential allergens (e.g. wheat, milk, soy) but no dedicated Allergen Warning statement was detected.',
            suggestedFix: 'Add a dedicated allergen box/statement right under the ingredients list, e.g., "Allergen Warning: Contains Wheat and Milk. Produced in a facility that also processes nuts."'
          };
        }
        return {
          status: 'PASS',
          evidence: `Dedicated allergen statement detected: "${product.allergenInfo}"`,
          suggestedFix: ''
        };
      }
      return {
        status: 'PASS',
        evidence: 'No common allergens found in ingredients list, or no separate statement is required.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'MSG_WARNING_CHECK',
    category: 'Special Declarations',
    title: 'Monosodium Glutamate (MSG) declaration',
    description: 'If Monosodium Glutamate is added, a specific warning/declaration is required under FSSAI rules.',
    severity: 'WARNING',
    citation: 'FSS (Packaging and Labelling) Regulations, 2011 - Clause 2.4.4.12',
    validate: (product: CanonicalProduct): RuleResult => {
      const ingredientsText = product.ingredients.join(' ').toLowerCase();
      const hasMSG = ingredientsText.includes('msg') || ingredientsText.includes('monosodium glutamate') || ingredientsText.includes('ins 621');

      if (hasMSG) {
        const msgDeclarationDetected = product.ingredients.some(i => i.toLowerCase().includes('added msg') || ingredientsText.includes('contains glutamate'));
        if (!msgDeclarationDetected) {
          return {
            status: 'WARNING',
            evidence: 'Monosodium Glutamate (MSG / INS 621) is listed in ingredients, but the standard safety disclaimer is missing.',
            suggestedFix: 'Print: "CONTAINS ADDED MONOSODIUM GLUTAMATE. NOT RECOMMENDED FOR INFANTS AND CHILDREN BELOW 12 MONTHS."'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'No undeclared MSG MSG issues found.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'SWEETENER_WARNING_CHECK',
    category: 'Special Declarations',
    title: 'Artificial Sweetener declaration',
    description: 'Products containing artificial sweeteners must carry warning labels specifying names and limit statements.',
    severity: 'FAIL',
    citation: 'FSS (Packaging and Labelling) Regulations, 2011 - Clause 2.4.4.2',
    validate: (product: CanonicalProduct): RuleResult => {
      const sweeteners = ['aspartame', 'sucralose', 'acesulfame', 'neotame', 'saccharin', 'ins 950', 'ins 951', 'ins 955', 'steviol', 'ins 960'];
      const ingredientsText = product.ingredients.join(' ').toLowerCase();
      const hasSweetener = sweeteners.some(sw => ingredientsText.includes(sw));

      if (hasSweetener) {
        const warningDetected = ingredientsText.includes('contains artificial sweetener') || ingredientsText.includes('not recommended for children');
        if (!warningDetected) {
          return {
            status: 'FAIL',
            evidence: 'Detected artificial sweeteners in ingredients, but the mandatory front-of-pack sweetener warning is missing.',
            suggestedFix: 'Add the mandatory label statement: "CONTAINS ARTIFICIAL SWEETENER AND FOR CALORIE CONSCIOUS" on the front panel.'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'No undeclared artificial sweeteners detected.',
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 8: HIGH FAT, SUGAR, SALT (HFSS) PRE-EMPTIVE WARNINGS
  {
    ruleId: 'HFSS_HIGH_SUGAR',
    category: 'Food Category Requirements',
    title: 'HFSS - High Added Sugar Evaluation',
    description: 'FSSAI recommends limiting foods where added sugar contributes to more than 10% of total energy.',
    severity: 'WARNING',
    citation: 'FSSAI Dietary Guidelines and HFSS Food Consultation Draft',
    validate: (product: CanonicalProduct): RuleResult => {
      const addedSugar = product.nutrition.addedSugars?.value;
      const energy = product.nutrition.energy?.value;

      if (addedSugar !== undefined && energy !== undefined && energy > 0) {
        // Sugar is 4 kcal/gram
        const sugarCalories = addedSugar * 4;
        const sugarPercentage = (sugarCalories / energy) * 100;

        if (sugarPercentage > 10) {
          return {
            status: 'WARNING',
            evidence: `Added Sugar (${addedSugar}g = ${sugarCalories.toFixed(0)} kcal) represents ${sugarPercentage.toFixed(1)}% of total Energy (${energy} kcal), which exceeds the FSSAI recommended HFSS threshold of 10%.`,
            suggestedFix: 'Consider reformulating to reduce added sugar content or clearly display high-sugar information to consumers.'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'Added sugar is within recommended FSSAI threshold boundaries.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'HFSS_HIGH_SODIUM',
    category: 'Food Category Requirements',
    title: 'HFSS - High Sodium Evaluation',
    description: 'Packaged foods with sodium exceeding 1mg per kcal are classified as high sodium under FSSAI HFSS definitions.',
    severity: 'WARNING',
    citation: 'FSSAI Guidelines for High Fat, Sugar and Salt (HFSS) Foods',
    validate: (product: CanonicalProduct): RuleResult => {
      const sodium = product.nutrition.sodium?.value;
      const energy = product.nutrition.energy?.value;

      if (sodium !== undefined && energy !== undefined && energy > 0) {
        const ratio = sodium / energy;
        if (ratio > 1.0) {
          return {
            status: 'WARNING',
            evidence: `Sodium content (${sodium} mg) compared to Energy (${energy} kcal) is ${ratio.toFixed(2)} mg/kcal. This exceeds the HFSS risk ratio of 1.0.`,
            suggestedFix: 'Recommend reducing sodium content or adding a salt-intake warning indicator on the packaging.'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'Sodium content is within recommended nutritional ratio guidelines.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'HFSS_HIGH_TRANS_FAT',
    category: 'Food Category Requirements',
    title: 'HFSS - Trans Fat limits',
    description: 'FSSAI mandates that industrial trans fats must be limited to less than 2% by weight of total fat.',
    severity: 'WARNING',
    citation: 'FSS (Prohibition and Restrictions on Sales) Second Amendment Regulations, 2021',
    validate: (product: CanonicalProduct): RuleResult => {
      const transFat = product.nutrition.transFat?.value;
      const totalFat = product.nutrition.totalFat?.value;

      if (transFat !== undefined && totalFat !== undefined && totalFat > 0) {
        const transFatPercent = (transFat / totalFat) * 100;
        if (transFatPercent > 2.0 && transFat > 0.1) {
          return {
            status: 'WARNING',
            evidence: `Trans fat (${transFat}g) represents ${transFatPercent.toFixed(1)}% of total fat (${totalFat}g), which exceeds the 2.0% threshold.`,
            suggestedFix: 'Eliminate partially hydrogenated oils from ingredients to reduce industrial trans fat to conform to India\'s Trans Fat Free goals.'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'Trans Fat is within the standard 2% fat limit or not detected.',
        suggestedFix: ''
      };
    }
  },

  // CATEGORY 9: IMPORT LABELLING & COUNTRY OF ORIGIN
  {
    ruleId: 'IMPORT_ORIGIN_PRESENCE',
    category: 'Import Labelling',
    title: 'Country of Origin presence',
    description: 'Imported food products must declare the Country of Origin on the label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.6.2',
    validate: (product: CanonicalProduct): RuleResult => {
      if (product.importerDetails && product.importerDetails.trim() !== '') {
        const originDetected = /origin|product of|made in/i.test(product.importerDetails + ' ' + product.manufacturerDetails);
        if (!originDetected) {
          return {
            status: 'FAIL',
            evidence: 'Product has Importer Details but no explicit "Country of Origin" was detected.',
            suggestedFix: 'Declare the exact origin of the food item, e.g., "Country of Origin: Switzerland" or "Product of Malaysia".'
          };
        }
      }
      return {
        status: 'PASS',
        evidence: 'Country of Origin is declared or product is of domestic manufacture.',
        suggestedFix: ''
      };
    }
  },
  {
    ruleId: 'IMPORT_DETAILS_PRESENCE',
    category: 'Import Labelling',
    title: 'Importer Address and FSSAI license',
    description: 'The name, address, and FSSAI license number of the importer must be declared on a sticker or the printed label.',
    severity: 'FAIL',
    citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.6.2',
    validate: (product: CanonicalProduct): RuleResult => {
      const isImported = /imported|importer|imported by/i.test(product.manufacturerDetails + ' ' + product.importerDetails);
      if (isImported && (!product.importerDetails || product.importerDetails.trim() === '')) {
        return {
          status: 'FAIL',
          evidence: 'Product indicators suggest it is imported, but Importer Details (Name, Address) are missing.',
          suggestedFix: 'Affix a standard importer sticker or print: "Imported and Marketed by: [Importer Name], [Full Physical Address] under FSSAI License No. [14-digits]."'
        };
      }
      return {
        status: 'PASS',
        evidence: 'Importer details are present or not required.',
        suggestedFix: ''
      };
    }
  }
];

export function runFssaiComplianceEngine(product: CanonicalProduct): ComplianceReport['deterministicFindings'] {
  const findings: ComplianceReport['deterministicFindings'] = [];

  for (const rule of FSSAI_RULE_CATALOG) {
    const result = rule.validate(product);
    if (result.status !== 'NOT_APPLICABLE') {
      findings.push({
        ruleId: rule.ruleId,
        category: rule.category,
        title: rule.title,
        status: result.status === 'PASS' ? 'PASS' : result.status,
        severity: rule.severity,
        evidence: result.evidence,
        suggestedFix: result.suggestedFix,
        citation: rule.citation
      });
    }
  }

  return findings;
}

export function calculateComplianceScore(findings: ComplianceReport['deterministicFindings']): number {
  if (findings.length === 0) return 100;

  const totalRules = findings.length;
  const passedRules = findings.filter(f => f.status === 'PASS').length;
  const failedRules = findings.filter(f => f.status === 'FAIL').length;
  const warningRules = findings.filter(f => f.status === 'WARNING').length;

  // FAIL deducts 15 points, WARNING deducts 5 points
  let score = 100 - (failedRules * 15) - (warningRules * 5);
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
}
