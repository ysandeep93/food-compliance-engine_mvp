/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RawRuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const NUTR_TABLE_PRESENCE = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_TABLE_PRESENCE');
  const nutritionVal = product.nutrition?.value;
  const keys = nutritionVal ? Object.keys(nutritionVal) : [];
  if (keys.length === 0) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'No nutritional facts table or values were detected on the label.',
      message: 'Nutritional facts must be declared per 100g or 100ml, and per serving of the food.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Nutritional facts table detected with ${keys.length} parameters.`,
    message: 'Nutritional facts must be declared per 100g or 100ml, and per serving of the food.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_ENERGY = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_ENERGY');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.energy || nutritionVal.energy.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Energy (Calories) is missing from the nutrition declaration.',
      message: 'Energy value in kcal must be declared on every label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Energy declared: ${nutritionVal.energy.value} ${nutritionVal.energy.unit}`,
    message: 'Energy value in kcal must be declared on every label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_PROTEIN = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_PROTEIN');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.protein || nutritionVal.protein.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Protein content is missing from the nutrition declaration.',
      message: 'Protein content in grams (g) must be declared on the label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Protein declared: ${nutritionVal.protein.value} ${nutritionVal.protein.unit}`,
    message: 'Protein content in grams (g) must be declared on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_CARBS = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_CARBS');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.carbs || nutritionVal.carbs.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Carbohydrates are missing from the nutrition declaration.',
      message: 'Carbohydrate content in grams (g) must be declared on the label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Carbohydrates declared: ${nutritionVal.carbs.value} ${nutritionVal.carbs.unit}`,
    message: 'Carbohydrate content in grams (g) must be declared on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_TOTAL_SUGARS = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_TOTAL_SUGARS');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.totalSugars || nutritionVal.totalSugars.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Total Sugars content is missing from the nutrition declaration.',
      message: 'Total sugars in grams (g) must be declared on the nutrition label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Total Sugars declared: ${nutritionVal.totalSugars.value} ${nutritionVal.totalSugars.unit}`,
    message: 'Total sugars in grams (g) must be declared on the nutrition label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_ADDED_SUGARS = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_ADDED_SUGARS');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.addedSugars || nutritionVal.addedSugars.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Added Sugars is missing. Added Sugars must be declared separately from Total Sugars under FSSAI rules.',
      message: 'Added Sugars in grams (g) must be separately declared on the label (mandatory under the latest FSSAI amendments).',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Added Sugars declared: ${nutritionVal.addedSugars.value} ${nutritionVal.addedSugars.unit}`,
    message: 'Added Sugars in grams (g) must be separately declared on the label (mandatory under the latest FSSAI amendments).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_FAT = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_FAT');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.totalFat || nutritionVal.totalFat.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Total Fat is missing from the nutrition declaration.',
      message: 'Total fat in grams (g) must be declared on the label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Total Fat declared: ${nutritionVal.totalFat.value} ${nutritionVal.totalFat.unit}`,
    message: 'Total fat in grams (g) must be declared on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_SAT_FAT = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_SAT_FAT');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.saturatedFat || nutritionVal.saturatedFat.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Saturated Fat is missing from the nutrition declaration.',
      message: 'Saturated fat content in grams (g) must be declared under the Total Fat section.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Saturated Fat declared: ${nutritionVal.saturatedFat.value} ${nutritionVal.saturatedFat.unit}`,
    message: 'Saturated fat content in grams (g) must be declared under the Total Fat section.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_TRANS_FAT = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_TRANS_FAT');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.transFat || nutritionVal.transFat.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Trans Fat is missing from the nutrition declaration.',
      message: 'Trans fat content in grams (g) must be declared under the Total Fat section.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Trans Fat declared: ${nutritionVal.transFat.value} ${nutritionVal.transFat.unit}`,
    message: 'Trans fat content in grams (g) must be declared under the Total Fat section.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const NUTR_SODIUM = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('NUTR_SODIUM');
  const nutritionVal = product.nutrition?.value;
  if (!nutritionVal || Object.keys(nutritionVal).length === 0) return null;
  if (!nutritionVal.sodium || nutritionVal.sodium.value === undefined) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Sodium is missing from the nutrition declaration.',
      message: 'Sodium content in milligrams (mg) must be declared on the nutrition label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Sodium declared: ${nutritionVal.sodium.value} ${nutritionVal.sodium.unit}`,
    message: 'Sodium content in milligrams (mg) must be declared on the nutrition label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const HFSS_HIGH_SUGAR = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('HFSS_HIGH_SUGAR');
  const nutritionVal = product.nutrition?.value;
  const addedSugar = nutritionVal?.addedSugars?.value;
  const energy = nutritionVal?.energy?.value;

  if (addedSugar !== undefined && energy !== undefined && energy > 0) {
    const sugarCalories = addedSugar * 4;
    const sugarPercentage = (sugarCalories / energy) * 100;

    if (sugarPercentage > 10) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: `Added Sugar (${addedSugar}g = ${sugarCalories.toFixed(0)} kcal) represents ${sugarPercentage.toFixed(1)}% of total Energy (${energy} kcal), which exceeds the FSSAI recommended HFSS threshold of 10%.`,
        message: 'FSSAI recommends limiting foods where added sugar contributes to more than 10% of total energy.',
        suggestedFix: meta.suggestedFix,
        citation: meta.citation
      };
    }
  }

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'Added sugar is within recommended FSSAI threshold boundaries.',
    message: 'FSSAI recommends limiting foods where added sugar contributes to more than 10% of total energy.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const HFSS_HIGH_SODIUM = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('HFSS_HIGH_SODIUM');
  const nutritionVal = product.nutrition?.value;
  const sodium = nutritionVal?.sodium?.value;
  const energy = nutritionVal?.energy?.value;

  if (sodium !== undefined && energy !== undefined && energy > 0) {
    const ratio = sodium / energy;
    if (ratio > 1.0) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: `Sodium content (${sodium} mg) compared to Energy (${energy} kcal) is ${ratio.toFixed(2)} mg/kcal. This exceeds the HFSS risk ratio of 1.0.`,
        message: 'Packaged foods with sodium exceeding 1mg per kcal are classified as high sodium under FSSAI HFSS definitions.',
        suggestedFix: meta.suggestedFix,
        citation: meta.citation
      };
    }
  }

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'Sodium content is within recommended nutritional ratio guidelines.',
    message: 'Packaged foods with sodium exceeding 1mg per kcal are classified as high sodium under FSSAI HFSS definitions.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const HFSS_HIGH_TRANS_FAT = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('HFSS_HIGH_TRANS_FAT');
  const nutritionVal = product.nutrition?.value;
  const transFat = nutritionVal?.transFat?.value;
  const totalFat = nutritionVal?.totalFat?.value;

  if (transFat !== undefined && totalFat !== undefined && totalFat > 0) {
    const transFatPercent = (transFat / totalFat) * 100;
    if (transFatPercent > 2.0 && transFat > 0.1) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: `Trans fat (${transFat}g) represents ${transFatPercent.toFixed(1)}% of total fat (${totalFat}g), which exceeds the 2.0% threshold.`,
        message: 'FSSAI mandates that industrial trans fats must be limited to less than 2% by weight of total fat.',
        suggestedFix: meta.suggestedFix,
        citation: meta.citation
      };
    }
  }

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'Trans Fat is within the standard 2% fat limit or not detected.',
    message: 'FSSAI mandates that industrial trans fats must be limited to less than 2% by weight of total fat.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const nutritionRules = [
  NUTR_TABLE_PRESENCE,
  NUTR_ENERGY,
  NUTR_PROTEIN,
  NUTR_CARBS,
  NUTR_TOTAL_SUGARS,
  NUTR_ADDED_SUGARS,
  NUTR_FAT,
  NUTR_SAT_FAT,
  NUTR_TRANS_FAT,
  NUTR_SODIUM,
  HFSS_HIGH_SUGAR,
  HFSS_HIGH_SODIUM,
  HFSS_HIGH_TRANS_FAT
];
