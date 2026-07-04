/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NutritionItem {
  value: number;
  unit: string;
  rawValue?: string;
}

export interface NutritionData {
  energy?: NutritionItem;
  protein?: NutritionItem;
  carbs?: NutritionItem;
  totalSugars?: NutritionItem;
  addedSugars?: NutritionItem;
  totalFat?: NutritionItem;
  saturatedFat?: NutritionItem;
  transFat?: NutritionItem;
  sodium?: NutritionItem;
}

export interface DateMarking {
  manufactureDate?: string;
  bestBefore?: string;
  expiryDate?: string;
  rawValue?: string;
}

export interface CanonicalProduct {
  productName: string;
  brandName: string;
  fssaiLicense: string;
  ingredients: string[];
  isVeg: boolean | null; // true = Veg, false = Non-Veg, null = undetected
  hasVegLogo: boolean;
  nutrition: NutritionData;
  netQuantity: string;
  manufacturerDetails: string;
  importerDetails: string;
  batchNumber: string;
  dateMarking: DateMarking;
  storageInstructions: string;
  claims: string[];
  allergenInfo: string;
  extractedLogos: string[]; // e.g. ["FSSAI", "Veg", "Non-Veg", "Jaivik Bharat"]
}

export interface RuleResult {
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  evidence: string;
  suggestedFix: string;
  details?: string;
}

export interface ComplianceRule {
  ruleId: string;
  category: string;
  title: string;
  description: string;
  severity: 'FAIL' | 'WARNING';
  citation: string;
  validate: (product: CanonicalProduct) => RuleResult;
}

export interface AIClaimAnalysis {
  claim: string;
  assessment: 'COMPLIANT' | 'MISLEADING' | 'WARNING' | 'UNSUBSTANTIATED';
  reasoning: string;
  citation: string;
  suggestedFix: string;
}

export interface IngredientExplanation {
  name: string;
  purpose: string;
  safetyRating: 'SAFE' | 'MODERATE' | 'AVOID' | 'INFO';
  explanation: string;
}

export interface ComplianceReport {
  id: string;
  timestamp: string;
  productName: string;
  brandName: string;
  overallScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  productData: CanonicalProduct;
  deterministicFindings: {
    ruleId: string;
    category: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    severity: 'FAIL' | 'WARNING';
    evidence: string;
    suggestedFix: string;
    citation: string;
  }[];
  aiClaimFindings: AIClaimAnalysis[];
  ingredientExplanations: IngredientExplanation[];
}
