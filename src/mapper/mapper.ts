/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, FssaiLicense } from '../types';
import { GeminiExtractionResponse } from '../models/providers/gemini';

interface FssaiRawInput {
  number?: string | number;
  licenseNumber?: string | number;
  license?: string | number;
  type?: string;
  licenseType?: string;
}

/**
 * Parses raw FSSAI license inputs into the structured FssaiLicense[] format.
 * Extremely robust to support arrays, strings, legacy formats, and context-based type inference.
 */
export function parseFssaiLicenses(data: unknown): FssaiLicense[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item: unknown): FssaiLicense => {
      if (typeof item === 'object' && item !== null) {
        const rawItem = item as FssaiRawInput;
        const num = String(rawItem.number || rawItem.licenseNumber || rawItem.license || '').trim();
        const t = String(rawItem.type || rawItem.licenseType || 'unknown').toLowerCase().trim();
        let typeVal: 'manufacturer' | 'importer' | 'marketer' | 'unknown' = 'unknown';
        if (['manufacturer', 'importer', 'marketer', 'unknown'].includes(t)) {
          typeVal = t as 'manufacturer' | 'importer' | 'marketer' | 'unknown';
        }
        return { number: num, type: typeVal };
      } else if (typeof item === 'string') {
        const cleaned = item.replace(/\D/g, '');
        let detectedType: 'manufacturer' | 'importer' | 'marketer' | 'unknown' = 'unknown';
        const lower = item.toLowerCase();
        if (lower.includes('manuf') || lower.includes('pack')) detectedType = 'manufacturer';
        else if (lower.includes('import')) detectedType = 'importer';
        else if (lower.includes('market')) detectedType = 'marketer';
        return { number: cleaned || item, type: detectedType };
      }
      return { number: '', type: 'unknown' };
    }).filter(item => item.number !== '');
  }

  if (typeof data === 'string') {
    const licenseRegex = /\b\d{14}\b/g;
    const matches = data.match(licenseRegex);
    if (matches && matches.length > 0) {
      return matches.map((num) => {
        let typeVal: 'manufacturer' | 'importer' | 'marketer' | 'unknown' = 'unknown';
        const lowerData = data.toLowerCase();
        const indexOfNum = lowerData.indexOf(num);
        const context = lowerData.substring(Math.max(0, indexOfNum - 40), indexOfNum);
        if (context.includes('manuf') || context.includes('mpfg') || context.includes('pack')) {
          typeVal = 'manufacturer';
        } else if (context.includes('import')) {
          typeVal = 'importer';
        } else if (context.includes('market') || context.includes('brand')) {
          typeVal = 'marketer';
        }
        return { number: num, type: typeVal };
      });
    }

    const cleaned = data.replace(/\D/g, '');
    if (cleaned.length > 0) {
      return [{ number: cleaned, type: 'unknown' }];
    }
    return [{ number: data.trim(), type: 'unknown' }];
  }

  return [];
}

/**
 * Maps raw Gemini AI extraction results into the standardized CanonicalProduct model.
 * Each property conforms to the ExtractedField structure, containing value, confidence, and source.
 */
export function mapToCanonicalProduct(geminiData: GeminiExtractionResponse): CanonicalProduct {
  const source = 'gemini';

  const getFieldConfidence = (fieldName: string): number | undefined => {
    if (!geminiData) return undefined;
    // 1. Check if the field itself is an object with a confidence number property
    if (geminiData[fieldName] && typeof geminiData[fieldName] === 'object' && typeof geminiData[fieldName].confidence === 'number') {
      return geminiData[fieldName].confidence;
    }
    // 2. Check if there is a flat property like productName_confidence or productNameConfidence
    if (typeof geminiData[`${fieldName}_confidence`] === 'number') {
      return geminiData[`${fieldName}_confidence`];
    }
    if (typeof geminiData[`${fieldName}Confidence`] === 'number') {
      return geminiData[`${fieldName}Confidence`];
    }
    // 3. Fallback to global confidence if specified as a number in the root
    if (typeof geminiData.confidence === 'number') {
      return geminiData.confidence;
    }
    return undefined;
  };

  const getFieldRawText = (fieldName: string, fallback?: string): string | undefined => {
    if (!geminiData) return undefined;
    
    // Resolve actual field key or alias
    let val: any = undefined;
    if (fieldName === 'brand') {
      val = geminiData.brandName !== undefined ? geminiData.brandName : geminiData.brand;
    } else if (fieldName === 'dates') {
      val = geminiData.dateMarking !== undefined ? geminiData.dateMarking : geminiData.dates;
    } else if (fieldName === 'manufacturer') {
      val = geminiData.manufacturerDetails !== undefined ? geminiData.manufacturerDetails : geminiData.manufacturer;
    } else if (fieldName === 'importer') {
      val = geminiData.importerDetails !== undefined ? geminiData.importerDetails : geminiData.importer;
    } else if (fieldName === 'fssaiLicenses') {
      val = geminiData.fssaiLicenses !== undefined ? geminiData.fssaiLicenses : geminiData.fssaiLicense;
    } else {
      val = geminiData[fieldName];
    }

    // 1. Check nested rawText/rawValue/text properties with prefixes and aliases
    const possiblePrefixes = [fieldName];
    if (fieldName === 'brand') possiblePrefixes.push('brandName');
    if (fieldName === 'dates') possiblePrefixes.push('dateMarking');
    if (fieldName === 'manufacturer') possiblePrefixes.push('manufacturerDetails');
    if (fieldName === 'importer') possiblePrefixes.push('importerDetails');
    if (fieldName === 'fssaiLicenses') possiblePrefixes.push('fssaiLicense');

    for (const prefix of possiblePrefixes) {
      const pVal = geminiData[prefix];
      if (pVal && typeof pVal === 'object' && !Array.isArray(pVal)) {
        if (typeof pVal.rawText === 'string') return pVal.rawText;
        if (typeof pVal.rawValue === 'string') return pVal.rawValue;
        if (typeof pVal.text === 'string') return pVal.text;
      }
      if (typeof geminiData[`${prefix}RawText`] === 'string') {
        return geminiData[`${prefix}RawText`];
      }
      if (typeof geminiData[`${prefix}_rawText`] === 'string') {
        return geminiData[`${prefix}_rawText`];
      }
      if (typeof geminiData[`${prefix}RawValue`] === 'string') {
        return geminiData[`${prefix}RawValue`];
      }
      if (typeof geminiData[`${prefix}_rawValue`] === 'string') {
        return geminiData[`${prefix}_rawValue`];
      }
    }

    // 2. Check if val is defined and process its raw type
    if (val !== undefined && val !== null) {
      if (typeof val === 'string') {
        return val;
      }
      if (typeof val === 'number' || typeof val === 'boolean') {
        return String(val);
      }
      if (Array.isArray(val)) {
        const isSimpleArray = val.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean');
        if (isSimpleArray) {
          return val.join(', ');
        } else {
          return val.map(item => {
            if (item && typeof item === 'object') {
              return Object.entries(item)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            }
            return String(item);
          }).join(' | ');
        }
      }
      if (typeof val === 'object') {
        return Object.entries(val)
          .map(([k, v]) => {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
              const nested = Object.entries(v)
                .map(([nk, nv]) => `${nk}: ${nv}`)
                .join(', ');
              return `${k} (${nested})`;
            }
            return `${k}: ${v}`;
          })
          .join(', ');
      }
    }
    
    // 3. Fallback to passed fallback
    if (typeof fallback === 'string') {
      return fallback;
    }
    
    return undefined;
  };

  return {
    productName: {
      value: geminiData.productName || 'Unknown Product',
      rawText: getFieldRawText('productName', geminiData.productName),
      confidence: getFieldConfidence('productName'),
      source
    },
    brand: {
      value: geminiData.brandName || geminiData.brand || 'Unknown Brand',
      rawText: getFieldRawText('brand', geminiData.brandName || geminiData.brand),
      confidence: getFieldConfidence('brand'),
      source
    },
    ingredients: {
      value: geminiData.ingredients || [],
      rawText: getFieldRawText('ingredients', geminiData.ingredients ? geminiData.ingredients.join(', ') : undefined),
      confidence: getFieldConfidence('ingredients'),
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
      rawText: getFieldRawText('nutrition'),
      confidence: getFieldConfidence('nutrition'),
      source
    },
    claims: {
      value: geminiData.claims || [],
      rawText: getFieldRawText('claims', geminiData.claims ? geminiData.claims.join(', ') : undefined),
      confidence: getFieldConfidence('claims'),
      source
    },
    manufacturer: {
      value: geminiData.manufacturerDetails || geminiData.manufacturer || '',
      rawText: getFieldRawText('manufacturer', geminiData.manufacturerDetails || geminiData.manufacturer),
      confidence: getFieldConfidence('manufacturer'),
      source
    },
    importer: {
      value: geminiData.importerDetails || geminiData.importer || '',
      rawText: getFieldRawText('importer', geminiData.importerDetails || geminiData.importer),
      confidence: getFieldConfidence('importer'),
      source
    },
    fssaiLicenses: {
      value: parseFssaiLicenses(geminiData.fssaiLicenses || geminiData.fssaiLicense),
      rawText: getFieldRawText('fssaiLicenses', typeof geminiData.fssaiLicenses === 'string' ? geminiData.fssaiLicenses : undefined),
      confidence: getFieldConfidence('fssaiLicenses'),
      source
    },
    logos: {
      value: {
        isVeg: geminiData.isVeg !== undefined ? geminiData.isVeg : null,
        hasVegLogo: geminiData.hasVegLogo !== undefined ? !!geminiData.hasVegLogo : false,
        extractedLogos: geminiData.extractedLogos || geminiData.logos || [],
      },
      rawText: getFieldRawText('logos'),
      confidence: getFieldConfidence('logos'),
      source
    },
    dates: {
      value: {
        manufactureDate: geminiData.dateMarking?.manufactureDate || geminiData.dates?.manufactureDate || '',
        bestBefore: geminiData.dateMarking?.bestBefore || geminiData.dates?.bestBefore || '',
        expiryDate: geminiData.dateMarking?.expiryDate || geminiData.dates?.expiryDate || '',
      },
      rawText: getFieldRawText('dates'),
      confidence: getFieldConfidence('dates'),
      source
    },
    storageInstructions: {
      value: geminiData.storageInstructions || '',
      rawText: getFieldRawText('storageInstructions', geminiData.storageInstructions),
      confidence: getFieldConfidence('storageInstructions'),
      source
    },
    warnings: {
      value: {
        batchNumber: geminiData.batchNumber || '',
        allergenInfo: geminiData.allergenInfo || '',
        netQuantity: geminiData.netQuantity || '',
      },
      rawText: getFieldRawText('warnings'),
      confidence: getFieldConfidence('warnings'),
      source
    }
  };
}
