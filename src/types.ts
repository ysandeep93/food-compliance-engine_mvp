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

export interface ExtractedField<T> {
  value: T;
  confidence: number;
  source: string;
}

export interface LogoData {
  isVeg: boolean | null; // true = Veg, false = Non-Veg, null = undetected
  hasVegLogo: boolean;
  extractedLogos: string[]; // e.g. ["FSSAI", "Veg", "Non-Veg", "Jaivik Bharat"]
}

export interface WarningData {
  batchNumber: string;
  allergenInfo: string;
  netQuantity: string;
}

export interface CanonicalProduct {
  productName: ExtractedField<string>;
  brand: ExtractedField<string>;
  ingredients: ExtractedField<string[]>;
  nutrition: ExtractedField<NutritionData>;
  claims: ExtractedField<string[]>;
  manufacturer: ExtractedField<string>;
  importer: ExtractedField<string>;
  fssaiLicenses: ExtractedField<string>;
  logos: ExtractedField<LogoData>;
  dates: ExtractedField<DateMarking>;
  storageInstructions: ExtractedField<string>;
  warnings: ExtractedField<WarningData>;
}

export interface RuleResult {
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  evidence: string;
  suggestedFix: string;
  details?: string;
}

export interface RuleFinding {
  ruleId: string;
  title: string;
  passed: boolean;
  severity: 'FAIL' | 'WARNING';
  evidence: string;
  message: string;
  suggestedFix: string;
  citation: string;
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
  explanation?: string;
  consumerFriendlySummary?: string;
  suggestedFixes?: string[];
}
