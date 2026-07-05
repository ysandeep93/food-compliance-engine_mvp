/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct } from '../types';

/**
 * Maps raw Gemini AI extraction results into the standardized CanonicalProduct model.
 * Each property conforms to the ExtractedField structure, containing value, confidence, and source.
 */
export function mapToCanonicalProduct(geminiData: any): CanonicalProduct {
  const source = 'gemini';
  const confidence = 0.98; // Default high confidence for extracted fields

  return {
    productName: {
      value: geminiData.productName || 'Unknown Product',
      confidence,
      source
    },
    brand: {
      value: geminiData.brandName || geminiData.brand || 'Unknown Brand',
      confidence,
      source
    },
    ingredients: {
      value: geminiData.ingredients || [],
      confidence,
      source
    },
    nutrition: {
      value: {
        energy: geminiData.nutrition?.energy ? { value: Number(geminiData.nutrition.energy.value) || 0, unit: geminiData.nutrition.energy.unit || 'kcal' } : undefined,
        protein: geminiData.nutrition?.protein ? { value: Number(geminiData.nutrition.protein.value) || 0, unit: geminiData.nutrition.protein.unit || 'g' } : undefined,
        carbs: geminiData.nutrition?.carbs ? { value: Number(geminiData.nutrition.carbs.value) || 0, unit: geminiData.nutrition.carbs.unit || 'g' } : undefined,
        totalSugars: geminiData.nutrition?.totalSugars ? { value: Number(geminiData.nutrition.totalSugars.value) || 0, unit: geminiData.nutrition.totalSugars.unit || 'g' } : undefined,
        addedSugars: geminiData.nutrition?.addedSugars ? { value: Number(geminiData.nutrition.addedSugars.value) || 0, unit: geminiData.nutrition.addedSugars.unit || 'g' } : undefined,
        totalFat: geminiData.nutrition?.totalFat ? { value: Number(geminiData.nutrition.totalFat.value) || 0, unit: geminiData.nutrition.totalFat.unit || 'g' } : undefined,
        saturatedFat: geminiData.nutrition?.saturatedFat ? { value: Number(geminiData.nutrition.saturatedFat.value) || 0, unit: geminiData.nutrition.saturatedFat.unit || 'g' } : undefined,
        transFat: geminiData.nutrition?.transFat ? { value: Number(geminiData.nutrition.transFat.value) || 0, unit: geminiData.nutrition.transFat.unit || 'g' } : undefined,
        sodium: geminiData.nutrition?.sodium ? { value: Number(geminiData.nutrition.sodium.value) || 0, unit: geminiData.nutrition.sodium.unit || 'mg' } : undefined,
      },
      confidence,
      source
    },
    claims: {
      value: geminiData.claims || [],
      confidence,
      source
    },
    manufacturer: {
      value: geminiData.manufacturerDetails || geminiData.manufacturer || '',
      confidence,
      source
    },
    importer: {
      value: geminiData.importerDetails || geminiData.importer || '',
      confidence,
      source
    },
    fssaiLicenses: {
      value: geminiData.fssaiLicense || geminiData.fssaiLicenses || '',
      confidence,
      source
    },
    logos: {
      value: {
        isVeg: geminiData.isVeg !== undefined ? geminiData.isVeg : null,
        hasVegLogo: geminiData.hasVegLogo !== undefined ? !!geminiData.hasVegLogo : false,
        extractedLogos: geminiData.extractedLogos || geminiData.logos || [],
      },
      confidence,
      source
    },
    dates: {
      value: {
        manufactureDate: geminiData.dateMarking?.manufactureDate || geminiData.dates?.manufactureDate || '',
        bestBefore: geminiData.dateMarking?.bestBefore || geminiData.dates?.bestBefore || '',
        expiryDate: geminiData.dateMarking?.expiryDate || geminiData.dates?.expiryDate || '',
      },
      confidence,
      source
    },
    storageInstructions: {
      value: geminiData.storageInstructions || '',
      confidence,
      source
    },
    warnings: {
      value: {
        batchNumber: geminiData.batchNumber || '',
        allergenInfo: geminiData.allergenInfo || '',
        netQuantity: geminiData.netQuantity || '',
      },
      confidence,
      source
    }
  };
}
