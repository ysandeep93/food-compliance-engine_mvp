/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeminiNutrient {
  value?: number;
  unit?: string;
  confidence?: number;
}

export interface GeminiNutrition {
  energy?: GeminiNutrient;
  protein?: GeminiNutrient;
  carbs?: GeminiNutrient;
  totalSugars?: GeminiNutrient;
  addedSugars?: GeminiNutrient;
  totalFat?: GeminiNutrient;
  saturatedFat?: GeminiNutrient;
  transFat?: GeminiNutrient;
  sodium?: GeminiNutrient;
  confidence?: number;
}

export interface GeminiDateMarking {
  manufactureDate?: string;
  bestBefore?: string;
  expiryDate?: string;
}

export interface GeminiExtractionResponse {
  productName?: string;
  brandName?: string;
  brand?: string;
  ingredients?: string[];
  nutrition?: GeminiNutrition;
  claims?: string[];
  manufacturerDetails?: string;
  manufacturer?: string;
  importerDetails?: string;
  importer?: string;
  fssaiLicenses?: any;
  fssaiLicense?: any;
  isVeg?: boolean | null;
  hasVegLogo?: boolean;
  extractedLogos?: string[];
  logos?: string[];
  dateMarking?: GeminiDateMarking;
  dates?: GeminiDateMarking;
  storageInstructions?: string;
  batchNumber?: string;
  allergenInfo?: string;
  netQuantity?: string;
  confidence?: number;
  [key: string]: any;
}
