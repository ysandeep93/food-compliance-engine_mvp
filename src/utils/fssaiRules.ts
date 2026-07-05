/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, ComplianceReport } from '../types';
import { runAllRules, RULE_CATEGORIES } from '../rules';

export function runFssaiComplianceEngine(product: CanonicalProduct, threshold: number = 0.70): ComplianceReport['deterministicFindings'] {
  const findings: ComplianceReport['deterministicFindings'] = [];
  const rawFindings = runAllRules(product, threshold);

  for (const finding of rawFindings) {
    findings.push({
      ruleId: finding.ruleId,
      category: RULE_CATEGORIES[finding.ruleId] || 'General',
      title: finding.title,
      status: finding.passed ? 'PASS' : finding.severity,
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
