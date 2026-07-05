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

export function runAllRules(product: CanonicalProduct): RuleFinding[] {
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
        findings.push(result);
      }
    }
  }

  return findings;
}
