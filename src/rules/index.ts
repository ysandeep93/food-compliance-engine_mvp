/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding } from '../types';
import { mandatoryRules } from './mandatory';
import { ingredientsRules } from './ingredients';
import { nutritionRules } from './nutrition';
import { logosRules } from './logos';
import { licensesRules } from './licenses';
import { claimsRules } from './claims';

import mandatoryCatalog from '../ruleCatalog/mandatory.json';
import ingredientsCatalog from '../ruleCatalog/ingredients.json';
import nutritionCatalog from '../ruleCatalog/nutrition.json';
import claimsCatalog from '../ruleCatalog/claims.json';
import logosCatalog from '../ruleCatalog/logos.json';

export interface CatalogRule {
  id: string;
  title: string;
  category: string;
  applicability: string;
  requiredField: string;
  validationType: string;
  severity: 'FAIL' | 'WARNING';
  citation: string;
  suggestedFix: string;
}

const allCatalogRules: CatalogRule[] = [
  ...(mandatoryCatalog as any[]),
  ...(ingredientsCatalog as any[]),
  ...(nutritionCatalog as any[]),
  ...(claimsCatalog as any[]),
  ...(logosCatalog as any[])
];

export const RULE_CATALOG = new Map<string, CatalogRule>(
  allCatalogRules.map(rule => [rule.id, rule])
);

export function getRuleFromCatalog(id: string): CatalogRule {
  const rule = RULE_CATALOG.get(id);
  if (!rule) {
    return {
      id,
      title: id.replace(/_/g, ' '),
      category: 'General',
      applicability: 'All',
      requiredField: '',
      validationType: 'custom',
      severity: 'FAIL',
      citation: 'FSSAI Regulations',
      suggestedFix: 'Review and conform to standard FSSAI labelling practices.'
    };
  }
  return rule;
}

export const RULE_CATEGORIES: Record<string, string> = {};
for (const rule of allCatalogRules) {
  RULE_CATEGORIES[rule.id] = rule.category;
}

export function runAllRules(product: CanonicalProduct, threshold: number = 0.70): RuleFinding[] {
  const findings: RuleFinding[] = [];
  
  const allGroups = [
    mandatoryRules,
    ingredientsRules,
    nutritionRules,
    logosRules,
    licensesRules,
    claimsRules
  ];

  for (const group of allGroups) {
    for (const rule of group) {
      const result = rule(product);
      if (result !== null) {
        const catalogRule = getRuleFromCatalog(result.ruleId);
        if (catalogRule && catalogRule.requiredField) {
          const firstPart = catalogRule.requiredField.split('.')[0];
          const extractedField = (product as any)[firstPart];
          
          if (extractedField && typeof extractedField === 'object') {
            const conf = extractedField.confidence;
            if (conf !== undefined && conf < threshold) {
              if (!result.passed) {
                const val = extractedField.value;
                const isValueMissing = 
                  val === null || 
                  val === undefined || 
                  (typeof val === 'string' && val.trim() === '') ||
                  (Array.isArray(val) && val.length === 0) ||
                  (typeof val === 'object' && Object.keys(val).length === 0);

                const evidenceLower = (result.evidence || '').toLowerCase();
                const isMissingEvidence = 
                  evidenceLower.includes('missing') || 
                  evidenceLower.includes('not detected') || 
                  evidenceLower.includes('not found') ||
                  evidenceLower.includes('not clearly detected') ||
                  evidenceLower.includes('neither expiry date nor best before');

                if (isValueMissing || isMissingEvidence) {
                  result.evidence = "Unable to Verify";
                  result.message = "Unable to Verify due to low extraction confidence.";
                  result.suggestedFix = "Re-upload a clearer image of the label with better lighting and resolution.";
                }
              }
            }
          }
        }
        findings.push(result);
      }
    }
  }

  return findings;
}
