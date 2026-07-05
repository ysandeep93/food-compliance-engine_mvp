/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, ComplianceReport } from '../types';

const makeCanonical = (oldData: any): CanonicalProduct => {
  return {
    productName: { value: oldData.productName, confidence: 0.99, source: 'gemini' },
    brand: { value: oldData.brandName, confidence: 0.99, source: 'gemini' },
    ingredients: { value: oldData.ingredients, confidence: 0.99, source: 'gemini' },
    nutrition: { value: oldData.nutrition, confidence: 0.99, source: 'gemini' },
    claims: { value: oldData.claims, confidence: 0.99, source: 'gemini' },
    manufacturer: { value: oldData.manufacturerDetails, confidence: 0.99, source: 'gemini' },
    importer: { value: oldData.importerDetails, confidence: 0.99, source: 'gemini' },
    fssaiLicenses: { value: oldData.fssaiLicense, confidence: 0.99, source: 'gemini' },
    logos: {
      value: {
        isVeg: oldData.isVeg,
        hasVegLogo: oldData.hasVegLogo,
        extractedLogos: oldData.extractedLogos,
      },
      confidence: 0.99,
      source: 'gemini'
    },
    dates: {
      value: {
        manufactureDate: oldData.dateMarking?.manufactureDate || '',
        bestBefore: oldData.dateMarking?.bestBefore || '',
        expiryDate: oldData.dateMarking?.expiryDate || '',
      },
      confidence: 0.99,
      source: 'gemini'
    },
    storageInstructions: { value: oldData.storageInstructions, confidence: 0.99, source: 'gemini' },
    warnings: {
      value: {
        batchNumber: oldData.batchNumber || '',
        allergenInfo: oldData.allergenInfo || '',
        netQuantity: oldData.netQuantity || '',
      },
      confidence: 0.99,
      source: 'gemini'
    }
  };
};

export const SAMPLE_COMPLIANCE_REPORTS: ComplianceReport[] = [
  {
    id: 'sample-maggi',
    timestamp: '2026-07-04T05:30:00Z',
    productName: 'Instant Noodles with Masala Tastemaker',
    brandName: 'Maggi',
    overallScore: 65,
    confidenceScore: 98,
    productData: makeCanonical({
      productName: 'Instant Noodles with Masala Tastemaker',
      brandName: 'Maggi',
      fssaiLicense: '10012011000168',
      ingredients: [
        'Wheat flour (Atta)',
        'Palm oil',
        'Salt',
        'Wheat gluten',
        'Mineral (Calcium carbonate)',
        'Gelling agent (INS 508)',
        'Acidity regulators (INS 501(i), INS 500(i))',
        'Humectant (INS 451(i))',
        'Spices and condiments (Onion powder, Coriander, Turmeric, Garlic powder, Cumin, Aniseed, Ginger, Black pepper, Fenugreek, Nutmeg, Clove, Green cardamom, Amchur)',
        'Hydrolysed groundnut protein',
        'Noodle powder',
        'Sugar',
        'Starch',
        'Flavor enhancer (INS 635)',
        'Monosodium Glutamate (INS 621)',
        'Acidity regulator (INS 330)',
        'Color (INS 150d)'
      ],
      isVeg: true,
      hasVegLogo: true,
      nutrition: {
        energy: { value: 427, unit: 'kcal' },
        protein: { value: 8.0, unit: 'g' },
        carbs: { value: 63.5, unit: 'g' },
        totalSugars: { value: 2.2, unit: 'g' },
        addedSugars: { value: 1.1, unit: 'g' },
        totalFat: { value: 15.7, unit: 'g' },
        saturatedFat: { value: 6.8, unit: 'g' },
        transFat: { value: 0.12, unit: 'g' },
        sodium: { value: 1250, unit: 'mg' }
      },
      netQuantity: '70 g',
      manufacturerDetails: 'Nestlé India Limited, 100/101, World Trade Centre, Barakhamba Lane, New Delhi - 110001',
      importerDetails: '',
      batchNumber: 'MAG4052A',
      dateMarking: {
        manufactureDate: '10/05/2026',
        bestBefore: '9 months from packaging',
        expiryDate: ''
      },
      storageInstructions: 'Store in a cool, dry and hygienic place to protect from insects, pests and strong odours.',
      claims: ['100% safe', 'Made with choice spices', 'Goodness of Calcium'],
      allergenInfo: 'Contains Wheat and Peanut. May contain Milk, Oats, Soy and Mustard.',
      extractedLogos: ['FSSAI', 'Veg']
    }),
    deterministicFindings: [
      {
        ruleId: 'MAND_PROD_NAME',
        category: 'Mandatory Declarations',
        title: 'Product Name presence',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'Product name detected: "Instant Noodles with Masala Tastemaker"',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.1.1'
      },
      {
        ruleId: 'FSSAI_LICENSE_FORMAT',
        category: 'FSSAI Licenses',
        title: 'FSSAI License 14-digit format',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'Valid 14-digit FSSAI license format: 10012011000168',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.7.1'
      },
      {
        ruleId: 'VEG_NONVEG_PRESENCE',
        category: 'Veg / Non-Veg Symbols',
        title: 'Veg / Non-Veg symbol presence',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'FSSAI Vegetarian (Green Circle) symbol detected successfully.',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.4'
      },
      {
        ruleId: 'NUTR_SODIUM',
        category: 'Nutrition Labelling',
        title: 'Sodium declaration',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'Sodium declared: 1250 mg',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.3.1.d'
      },
      {
        ruleId: 'HFSS_HIGH_SODIUM',
        category: 'Food Category Requirements',
        title: 'HFSS - High Sodium Evaluation',
        status: 'WARNING',
        severity: 'WARNING',
        evidence: 'Sodium content (1250 mg) compared to Energy (427 kcal) is 2.93 mg/kcal. This exceeds the HFSS risk ratio of 1.0.',
        suggestedFix: 'Recommend reducing sodium content or adding a salt-intake warning indicator on the packaging.',
        citation: 'FSSAI Guidelines for High Fat, Sugar and Salt (HFSS) Foods'
      },
      {
        ruleId: 'MSG_WARNING_CHECK',
        category: 'Special Declarations',
        title: 'Monosodium Glutamate (MSG) declaration',
        status: 'WARNING',
        severity: 'WARNING',
        evidence: 'Monosodium Glutamate (MSG / INS 621) is listed in ingredients, but the standard safety disclaimer is missing.',
        suggestedFix: 'Print: "CONTAINS ADDED MONOSODIUM GLUTAMATE. NOT RECOMMENDED FOR INFANTS AND CHILDREN BELOW 12 MONTHS."',
        citation: 'FSS (Packaging and Labelling) Regulations, 2011 - Clause 2.4.4.12'
      }
    ],
    aiClaimFindings: [
      {
        claim: '100% safe',
        assessment: 'MISLEADING',
        reasoning: 'No packaged food product can be claimed as "100% safe" as safety depends on individual allergies, consumption rates, and storage conditions. FSSAI Advertising and Claims Regulations prohibit absolute statements of safety or quality without empirical scientific backing.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Regulation 4(3) General Principles',
        suggestedFix: 'Remove the absolute claim "100% safe". Use standard quality assurances instead.'
      },
      {
        claim: 'Goodness of Calcium',
        assessment: 'COMPLIANT',
        reasoning: 'Calcium carbonate is listed in the ingredients. If the product contains at least 15% of the RDA of Calcium per 100g, claiming "Goodness of Calcium" or "Source of Calcium" is permissible.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Schedule I (Nutrition Claims)',
        suggestedFix: 'Provide the exact Calcium percentage of recommended dietary allowance (%RDA) in the nutrition panel.'
      }
    ],
    ingredientExplanations: [
      {
        name: 'Gelling agent (INS 508)',
        purpose: 'Stabilizer / Thickener',
        safetyRating: 'SAFE',
        explanation: 'INS 508 is Potassium Chloride. It is a naturally occurring mineral salt used as a gelling agent and flavor enhancer. Completely safe for general consumption.'
      },
      {
        name: 'Monosodium Glutamate (INS 621)',
        purpose: 'Flavor Enhancer (MSG)',
        safetyRating: 'MODERATE',
        explanation: 'INS 621 (MSG) is added to provide a savory "umami" flavor. While recognized as safe by global food agencies, it can cause mild sensitivities in certain individuals and is legally not recommended for infants.'
      },
      {
        name: 'Color (INS 150d)',
        purpose: 'Artificial Caramel Color IV',
        safetyRating: 'MODERATE',
        explanation: 'Sulfite ammonia caramel, a synthetic dark brown coloring. Safe within standard daily intake limits set by FSSAI, but best consumed in moderation.'
      },
      {
        name: 'Palm oil',
        purpose: 'Frying medium / Fat source',
        safetyRating: 'MODERATE',
        explanation: 'Highly saturated fat vegetable oil. Excellent stability for high-heat frying of noodles, but high consumption contributes to saturated fat intake.'
      }
    ]
  },
  {
    id: 'sample-tropicana',
    timestamp: '2026-07-04T05:35:00Z',
    productName: '100% Mixed Fruit Juice',
    brandName: 'Tropicana',
    overallScore: 90,
    confidenceScore: 99,
    productData: makeCanonical({
      productName: '100% Mixed Fruit Juice',
      brandName: 'Tropicana',
      fssaiLicense: '10012022000254',
      ingredients: [
        'Water',
        'Mixed Fruit Concentrates (Apple juice concentrate, Orange juice concentrate, Guava puree, Apricot puree, Mango puree, Banana puree)',
        'Acidity Regulator (INS 330)',
        'Antioxidant (INS 300 / Vitamin C)',
        'Natural Flavors'
      ],
      isVeg: true,
      hasVegLogo: true,
      nutrition: {
        energy: { value: 48, unit: 'kcal' },
        protein: { value: 0.4, unit: 'g' },
        carbs: { value: 11.5, unit: 'g' },
        totalSugars: { value: 10.8, unit: 'g' },
        addedSugars: { value: 0.0, unit: 'g' },
        totalFat: { value: 0.0, unit: 'g' },
        saturatedFat: { value: 0.0, unit: 'g' },
        transFat: { value: 0.0, unit: 'g' },
        sodium: { value: 15, unit: 'mg' }
      },
      netQuantity: '1 L',
      manufacturerDetails: 'Varun Beverages Limited, Plot No. A-7, Jhandewalan, New Delhi - 110055',
      importerDetails: '',
      batchNumber: 'TRP99201',
      dateMarking: {
        manufactureDate: '01/06/2026',
        bestBefore: '6 months from manufacture',
        expiryDate: ''
      },
      storageInstructions: 'Refrigerate after opening and consume within 5 days.',
      claims: ['100% Mixed Fruit Juice', 'No Added Sugar', 'Rich in Vitamin C'],
      allergenInfo: 'Free from common allergens.',
      extractedLogos: ['FSSAI', 'Veg']
    }),
    deterministicFindings: [
      {
        ruleId: 'MAND_PROD_NAME',
        category: 'Mandatory Declarations',
        title: 'Product Name presence',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'Product name detected: "100% Mixed Fruit Juice"',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.1.1'
      },
      {
        ruleId: 'NUTR_ADDED_SUGARS',
        category: 'Nutrition Labelling',
        title: 'Added Sugars declaration',
        status: 'PASS',
        severity: 'FAIL',
        evidence: 'Added Sugars declared: 0.0 g',
        suggestedFix: '',
        citation: 'FSS (Labelling and Display) First Amendment Regulations, 2020'
      },
      {
        ruleId: 'HFSS_HIGH_SUGAR',
        category: 'Food Category Requirements',
        title: 'HFSS - High Added Sugar Evaluation',
        status: 'PASS',
        severity: 'WARNING',
        evidence: 'Added sugar is within recommended FSSAI threshold boundaries (0g added sugar).',
        suggestedFix: '',
        citation: 'FSSAI Dietary Guidelines and HFSS Food Consultation Draft'
      }
    ],
    aiClaimFindings: [
      {
        claim: '100% Mixed Fruit Juice',
        assessment: 'COMPLIANT',
        reasoning: 'The ingredients list contains water and concentrated mixed fruit juices/purees. Under FSSAI standards, reconstituted juices from concentrates can be labelled "100% mixed fruit juice" if no external sugars, syrups or non-fruit sweeteners are added.',
        citation: 'FSS (Standards of Food Products and Food Additives) Regulations, 2011',
        suggestedFix: ''
      },
      {
        claim: 'No Added Sugar',
        assessment: 'COMPLIANT',
        reasoning: 'The nutrition table lists Added Sugars as "0.0 g" and there are no sugar syrups, dextrose, or maltodextrin ingredients added. The sweetness is derived naturally from the fruits.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Claim Requirements',
        suggestedFix: ''
      }
    ],
    ingredientExplanations: [
      {
        name: 'Mixed Fruit Concentrates',
        purpose: 'Fruit Pulp & Reconstitution',
        safetyRating: 'SAFE',
        explanation: 'Concentrated natural fruit juices. Water is removed at source for logistics, then mixed back with drinking water. High nutritional values are largely maintained.'
      },
      {
        name: 'Antioxidant (INS 300)',
        purpose: 'Vitamin C / Preservation',
        safetyRating: 'SAFE',
        explanation: 'INS 300 is Ascorbic Acid (Vitamin C). It is added to prevent browning and loss of flavor, while naturally enriching the product with essential Vitamin C.'
      }
    ]
  },
  {
    id: 'sample-oreo',
    timestamp: '2026-07-04T05:40:00Z',
    productName: 'Oreo Chocolate Sandwich Cookies',
    brandName: 'Cadbury',
    overallScore: 50,
    confidenceScore: 97,
    productData: makeCanonical({
      productName: 'Oreo Chocolate Sandwich Cookies',
      brandName: 'Cadbury',
      fssaiLicense: '10014022002711',
      ingredients: [
        'Refined wheat flour (Maida)',
        'Sugar',
        'Fractionated Palm oil',
        'Cocoa solids (3.1%)',
        'Starch',
        'Invert sugar syrup',
        'Liquid Glucose',
        'Salt',
        'Raising agents (INS 500(ii), INS 503(ii))',
        'Emulsifier (INS 322(i))',
        'Added Flavors (Artificial Vanilla flavoring substance)'
      ],
      isVeg: true,
      hasVegLogo: true,
      nutrition: {
        energy: { value: 489, unit: 'kcal' },
        protein: { value: 5.3, unit: 'g' },
        carbs: { value: 71.2, unit: 'g' },
        totalSugars: { value: 38.5, unit: 'g' },
        addedSugars: { value: 32.4, unit: 'g' },
        totalFat: { value: 20.2, unit: 'g' },
        saturatedFat: { value: 9.9, unit: 'g' },
        transFat: { value: 0.05, unit: 'g' },
        sodium: { value: 412, unit: 'mg' }
      },
      netQuantity: '120g',
      manufacturerDetails: 'Mondelez India Foods Private Limited, Unit No. 2001-2002, 20th Floor, Tower 3, Wing C, Indiabulls Finance Centre, Parel, Mumbai - 400013',
      importerDetails: '',
      batchNumber: 'MON90141',
      dateMarking: {
        manufactureDate: '15/04/2026',
        bestBefore: '9 months from packaging',
        expiryDate: ''
      },
      storageInstructions: '',
      claims: ['Contains Cocoa rich filling', 'Playful family moment sweetener', 'Light & Crispy biscuit'],
      allergenInfo: 'Contains Wheat and Soy. Manufactured in a line that handles Milk.',
      extractedLogos: ['FSSAI', 'Veg']
    }),
    deterministicFindings: [
      {
        ruleId: 'MAND_STORAGE_INSTR',
        category: 'Storage Instructions',
        title: 'Storage Instructions presence',
        status: 'WARNING',
        severity: 'WARNING',
        evidence: 'No specific storage guidelines were detected.',
        suggestedFix: 'Add standard storage text like "Store in a cool, dry place away from direct sunlight" to protect the food quality.',
        citation: 'FSS (Labelling and Display) Regulations, 2020 - Clause 2.2.8.5'
      },
      {
        ruleId: 'HFSS_HIGH_SUGAR',
        category: 'Food Category Requirements',
        title: 'HFSS - High Added Sugar Evaluation',
        status: 'WARNING',
        severity: 'WARNING',
        evidence: 'Added Sugar (32.4g = 129.6 kcal) represents 26.5% of total Energy (489 kcal), which exceeds the FSSAI recommended HFSS threshold of 10%.',
        suggestedFix: 'Consider reformulating to reduce added sugar content or clearly display high-sugar information to consumers.',
        citation: 'FSSAI Dietary Guidelines and HFSS Food Consultation Draft'
      },
      {
        ruleId: 'HFSS_HIGH_SODIUM',
        category: 'Food Category Requirements',
        title: 'HFSS - High Sodium Evaluation',
        status: 'WARNING',
        severity: 'WARNING',
        evidence: 'Sodium content (412 mg) compared to Energy (489 kcal) is 0.84 mg/kcal. While within extreme danger limit, it represents high sodium for baked sweets.',
        suggestedFix: 'Consider lowering sodium during recipe formulation.',
        citation: 'FSSAI Guidelines for High Fat, Sugar and Salt (HFSS) Foods'
      }
    ],
    aiClaimFindings: [
      {
        claim: 'Playful family moment sweetener',
        assessment: 'WARNING',
        reasoning: 'The claim uses lifestyle imagery to associate high-sugar, high-calorie food as a generic "family sweetener". FSSAI regulations advise against marketing strategies that promote excessive consumption of HFSS foods by children or families under wellness-related titles.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Core Marketing restrictions',
        suggestedFix: 'Avoid associating sugar-laden confectionery as a daily family lifestyle sweetener.'
      }
    ],
    ingredientExplanations: [
      {
        name: 'Invert sugar syrup',
        purpose: 'Sweetener / Texture modifier',
        safetyRating: 'AVOID',
        explanation: 'Sugar syrup split into glucose and fructose. Absorbs faster in blood than standard sugar. Contributes significantly to dental cavities and spike in blood sugars.'
      },
      {
        name: 'Emulsifier (INS 322(i))',
        purpose: 'Emulsifier (Soy Lecithin)',
        safetyRating: 'SAFE',
        explanation: 'Derived from natural soybeans. It keeps oils and sugars from separating in the cookie cream, ensuring a smooth, uniform texture.'
      }
    ]
  }
];
