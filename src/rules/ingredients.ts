/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const MAND_INGREDIENTS = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_INGREDIENTS');
  const val = product.ingredients?.value;
  if (!val || val.length === 0) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'No ingredients list was detected on the packaging.',
      message: 'A complete list of ingredients must be declared, headed by a suitable title like "Ingredients:".',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Detected ${val.length} ingredients: ${val.slice(0, 5).join(', ')}${val.length > 5 ? '...' : ''}`,
    message: 'A complete list of ingredients must be declared, headed by a suitable title like "Ingredients:".',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const ALLERGEN_WARNING = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('ALLERGEN_WARNING');
  const commonAllergens = ['wheat', 'gluten', 'soy', 'soya', 'milk', 'peanut', 'almond', 'cashew', 'nuts', 'egg', 'fish', 'sesame'];
  const ingredients = product.ingredients?.value || [];
  const ingredientsText = ingredients.join(' ').toLowerCase();
  const hasAllergensInIngredients = commonAllergens.some(allergen => ingredientsText.includes(allergen));

  if (hasAllergensInIngredients) {
    const allergenInfo = product.warnings?.value?.allergenInfo;
    if (!allergenInfo || allergenInfo.trim() === '') {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: 'Ingredients list contains potential allergens (e.g. wheat, milk, soy) but no dedicated Allergen Warning statement was detected.',
        message: 'Allergens listed in regulations must be highlighted or declared separately (e.g. "Contains: Wheat, Soy").',
        suggestedFix: meta.suggestedFix,
        citation: meta.citation
      };
    }
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: true,
      severity: meta.severity,
      evidence: `Dedicated allergen statement detected: "${allergenInfo}"`,
      message: 'Allergens listed in regulations must be highlighted or declared separately (e.g. "Contains: Wheat, Soy").',
      suggestedFix: '',
      citation: meta.citation
    };
  }

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'No common allergens found in ingredients list, or no separate statement is required.',
    message: 'Allergens listed in regulations must be highlighted or declared separately (e.g. "Contains: Wheat, Soy").',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MSG_WARNING_CHECK = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MSG_WARNING_CHECK');
  const ingredients = product.ingredients?.value || [];
  const ingredientsText = ingredients.join(' ').toLowerCase();
  const hasMSG = ingredientsText.includes('msg') || ingredientsText.includes('monosodium glutamate') || ingredientsText.includes('ins 621');

  if (hasMSG) {
    const msgDeclarationDetected = ingredients.some(i => i.toLowerCase().includes('added msg') || ingredientsText.includes('contains glutamate'));
    if (!msgDeclarationDetected) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: 'Monosodium Glutamate (MSG / INS 621) is listed in ingredients, but the standard safety disclaimer is missing.',
        message: 'If Monosodium Glutamate is added, a specific warning/declaration is required under FSSAI rules.',
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
    evidence: 'No undeclared MSG issues found.',
    message: 'If Monosodium Glutamate is added, a specific warning/declaration is required under FSSAI rules.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const SWEETENER_WARNING_CHECK = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('SWEETENER_WARNING_CHECK');
  const sweeteners = ['aspartame', 'sucralose', 'acesulfame', 'neotame', 'saccharin', 'ins 950', 'ins 951', 'ins 955', 'steviol', 'ins 960'];
  const ingredients = product.ingredients?.value || [];
  const ingredientsText = ingredients.join(' ').toLowerCase();
  const hasSweetener = sweeteners.some(sw => ingredientsText.includes(sw));

  if (hasSweetener) {
    const warningDetected = ingredientsText.includes('contains artificial sweetener') || ingredientsText.includes('not recommended for children');
    if (!warningDetected) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: 'Detected artificial sweeteners in ingredients, but the mandatory front-of-pack sweetener warning is missing.',
        message: 'Products containing artificial sweeteners must carry warning labels specifying names and limit statements.',
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
    evidence: 'No undeclared artificial sweeteners detected.',
    message: 'Products containing artificial sweeteners must carry warning labels specifying names and limit statements.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const ingredientsRules = [
  MAND_INGREDIENTS,
  ALLERGEN_WARNING,
  MSG_WARNING_CHECK,
  SWEETENER_WARNING_CHECK
];
