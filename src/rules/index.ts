/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding, RawRuleFinding, ComplianceReport } from '../types';
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

export function getRuleSeverity(ruleId: string): 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO' {
  switch (ruleId) {
    // CRITICAL
    case 'MAND_PROD_NAME':
    case 'DATE_EXPIRY_PRESENCE':
    case 'FSSAI_LICENSE_PRESENCE':
    case 'FSSAI_LICENSE_FORMAT':
      return 'CRITICAL';

    // MAJOR
    case 'MAND_BRAND_NAME':
    case 'MAND_NET_QTY':
    case 'MAND_MANUF_DETAILS':
    case 'DATE_MANUF_PRESENCE':
    case 'MAND_BATCH_NUM':
    case 'IMPORT_ORIGIN_PRESENCE':
    case 'IMPORT_DETAILS_PRESENCE':
    case 'VEG_NONVEG_PRESENCE':
    case 'MAND_INGREDIENTS':
    case 'NUTR_TABLE_PRESENCE':
    case 'NUTR_ENERGY':
    case 'NUTR_PROTEIN':
    case 'NUTR_CARBS':
    case 'NUTR_TOTAL_SUGARS':
    case 'NUTR_FAT':
    case 'NUTR_SAT_FAT':
    case 'NUTR_TRANS_FAT':
    case 'NUTR_SODIUM':
      return 'MAJOR';

    // MINOR
    case 'DATE_FORMAT':
    case 'MAND_STORAGE_INSTR':
    case 'FSSAI_LICENSE_PREFIX':
    case 'ALLERGEN_WARNING':
    case 'MSG_WARNING_CHECK':
    case 'SWEETENER_WARNING_CHECK':
    case 'HFSS_HIGH_SUGAR':
    case 'HFSS_HIGH_SODIUM':
    case 'HFSS_HIGH_TRANS_FAT':
    case 'NUTR_ADDED_SUGARS':
      return 'MINOR';

    default:
      return 'INFO';
  }
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
      const rawResult = rule(product);
      if (rawResult !== null) {
        const catalogRule = getRuleFromCatalog(rawResult.ruleId);
        if (catalogRule && catalogRule.requiredField) {
          const firstPart = catalogRule.requiredField.split('.')[0];
          const extractedField = (product as any)[firstPart];
          
          if (extractedField && typeof extractedField === 'object') {
            const conf = extractedField.confidence;
            if (conf !== undefined && conf < threshold) {
              if (!rawResult.passed) {
                const val = extractedField.value;
                const isValueMissing = 
                  val === null || 
                  val === undefined || 
                  (typeof val === 'string' && val.trim() === '') ||
                  (Array.isArray(val) && val.length === 0) ||
                  (typeof val === 'object' && Object.keys(val).length === 0);

                const evidenceLower = (rawResult.evidence || '').toLowerCase();
                const isMissingEvidence = 
                  evidenceLower.includes('missing') || 
                  evidenceLower.includes('not detected') || 
                  evidenceLower.includes('not found') ||
                  evidenceLower.includes('not clearly detected') ||
                  evidenceLower.includes('neither expiry date nor best before');

                if (isValueMissing || isMissingEvidence) {
                  rawResult.evidence = "Unable to Verify";
                  rawResult.message = "Unable to Verify due to low extraction confidence.";
                  rawResult.suggestedFix = "Re-upload a clearer image of the label with better lighting and resolution.";
                }
              }
            }
          }
        }

        // Determine the evaluation status (PASS, FAIL, WARNING, NOT_APPLICABLE)
        let status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
        if (rawResult.status) {
          status = rawResult.status;
        } else {
          status = rawResult.passed ? 'PASS' : (rawResult.severity === 'WARNING' ? 'WARNING' : 'FAIL');
        }

        // Determine business importance / severity (CRITICAL, MAJOR, MINOR, INFO)
        let severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
        const rawSev = rawResult.severity;
        if (rawSev && ['CRITICAL', 'MAJOR', 'MINOR', 'INFO'].includes(rawSev)) {
          severity = rawSev as 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
        } else {
          severity = getRuleSeverity(rawResult.ruleId);
        }

        const normalizedResult: RuleFinding = {
          ruleId: rawResult.ruleId,
          title: rawResult.title,
          passed: rawResult.passed,
          status,
          severity,
          evidence: rawResult.evidence,
          message: rawResult.message,
          suggestedFix: rawResult.suggestedFix,
          citation: rawResult.citation
        };

        findings.push(normalizedResult);
      }
    }
  }

  return findings;
}

export function runFssaiComplianceEngine(product: CanonicalProduct, threshold: number = 0.70): ComplianceReport['deterministicFindings'] {
  const findings: ComplianceReport['deterministicFindings'] = [];
  const rawFindings = runAllRules(product, threshold);

  for (const finding of rawFindings) {
    findings.push({
      ruleId: finding.ruleId,
      category: RULE_CATEGORIES[finding.ruleId] || 'General',
      title: finding.title,
      status: finding.status,
      severity: finding.severity,
      evidence: finding.evidence,
      suggestedFix: finding.suggestedFix,
      citation: finding.citation
    });
  }

  return findings;
}

export function calculateComplianceScore(findings: ComplianceReport['deterministicFindings']): number {
  if (findings.length === 0) return 100;

  const failedRules = findings.filter(f => f.status === 'FAIL').length;
  const warningRules = findings.filter(f => f.status === 'WARNING').length;

  // FAIL deducts 15 points, WARNING deducts 5 points
  let score = 100 - (failedRules * 15) - (warningRules * 5);
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
}

