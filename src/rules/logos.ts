/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const VEG_NONVEG_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('VEG_NONVEG_PRESENCE');
  const logosVal = product.logos?.value;
  if (!logosVal || logosVal.isVeg === null) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'No indicator of Vegetarian or Non-Vegetarian status was found.',
      message: 'Every packaged food must display a symbol indicating whether it is Vegetarian (Veg) or Non-Vegetarian (Non-Veg).',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  if (!logosVal.hasVegLogo) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: 'WARNING',
      evidence: `Product is declared as ${logosVal.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} in text, but the standard graphical logo was not detected in the image scan.`,
      message: 'Every packaged food must display a symbol indicating whether it is Vegetarian (Veg) or Non-Vegetarian (Non-Veg).',
      suggestedFix: 'Make sure the official FSSAI graphical symbol (green circle / brown triangle) is clearly printed, colored, and unobstructed.',
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `FSSAI ${logosVal.isVeg ? 'Vegetarian (Green Circle)' : 'Non-Vegetarian (Brown Triangle)'} symbol detected successfully.`,
    message: 'Every packaged food must display a symbol indicating whether it is Vegetarian (Veg) or Non-Vegetarian (Non-Veg).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const logosRules = [
  VEG_NONVEG_PRESENCE
];
