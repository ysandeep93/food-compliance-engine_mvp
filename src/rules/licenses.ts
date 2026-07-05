/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RawRuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const FSSAI_LICENSE_PRESENCE = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_PRESENCE');
  const licenses = product.fssaiLicenses?.value || [];
  const validLicenses = licenses.filter(l => l.number && l.number.trim() !== '');

  if (validLicenses.length === 0) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'No FSSAI logo or 14-digit license number was detected.',
      message: 'The FSSAI logo and 14-digit license number must be displayed on the label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }

  const evidenceText = validLicenses.length === 1
    ? `FSSAI license number found: "${validLicenses[0].number}"`
    : `FSSAI licenses found: ${validLicenses.map(l => `"${l.number}" (${l.type})`).join(', ')}`;

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: evidenceText,
    message: 'The FSSAI logo and 14-digit license number must be displayed on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const FSSAI_LICENSE_FORMAT = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_FORMAT');
  const licenses = product.fssaiLicenses?.value || [];
  if (licenses.length === 0) return null; // NOT_APPLICABLE status is handled by returning null

  const failures: { license: any; digitsOnly: string }[] = [];
  const passes: { license: any; digitsOnly: string }[] = [];

  for (const license of licenses) {
    if (!license.number || license.number.trim() === '') continue;
    const digitsOnly = license.number.replace(/\D/g, '');
    if (digitsOnly.length !== 14) {
      failures.push({ license, digitsOnly });
    } else {
      passes.push({ license, digitsOnly });
    }
  }

  // If we only have empty strings, return null
  if (failures.length === 0 && passes.length === 0) return null;

  if (failures.length > 0) {
    const evidenceText = licenses.length === 1
      ? `FSSAI License detected ("${failures[0].license.number}") contains ${failures[0].digitsOnly.length} digits. It must be exactly 14 digits.`
      : `FSSAI License format check failed. Invalid licenses: ${failures.map(f => `"${f.license.number}" (${f.license.type}, contains ${f.digitsOnly.length} digits)`).join(', ')}`;

    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: evidenceText,
      message: 'The FSSAI license number must be a valid 14-digit numerical format.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }

  const evidenceText = licenses.length === 1
    ? `Valid 14-digit FSSAI license format: ${passes[0].digitsOnly}`
    : `Valid FSSAI license formats: ${passes.map(p => `${p.digitsOnly} (${p.license.type})`).join(', ')}`;

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: evidenceText,
    message: 'The FSSAI license number must be a valid 14-digit numerical format.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const FSSAI_LICENSE_PREFIX = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_PREFIX');
  const licenses = product.fssaiLicenses?.value || [];
  if (licenses.length === 0) return null; // NOT_APPLICABLE status is handled by returning null

  const failures: { license: any; firstDigit: string }[] = [];
  const hasValidFormatCount = licenses.filter(l => l.number && l.number.replace(/\D/g, '').length === 14).length;

  for (const license of licenses) {
    if (!license.number) continue;
    const digitsOnly = license.number.replace(/\D/g, '');
    if (digitsOnly.length === 14) {
      const firstDigit = digitsOnly[0];
      if (firstDigit !== '1' && firstDigit !== '2') {
        failures.push({ license, firstDigit });
      }
    }
  }

  if (hasValidFormatCount === 0) return null;

  if (failures.length > 0) {
    const evidenceText = licenses.length === 1
      ? `The license starts with "${failures[0].firstDigit}". Standard Indian FSSAI licenses typically start with "1" (Central/Manufacturing) or "2" (State/Retail).`
      : `FSSAI license prefix check failed. Invalid licenses: ${failures.map(f => `"${f.license.number}" (${f.license.type}, starts with "${f.firstDigit}")`).join(', ')}`;

    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: evidenceText,
      message: 'FSSAI license numbers must start with a valid standard prefix (1 or 2).',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }

  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'FSSAI license prefix is standard.',
    message: 'FSSAI license numbers must start with a valid standard prefix (1 or 2).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const IMPORT_ORIGIN_PRESENCE = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('IMPORT_ORIGIN_PRESENCE');
  const importerVal = product.importer?.value;
  const manufVal = product.manufacturer?.value;
  if (importerVal && importerVal.trim() !== '') {
    const originDetected = /origin|product of|made in/i.test(importerVal + ' ' + manufVal);
    if (!originDetected) {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: 'Product has Importer Details but no explicit "Country of Origin" was detected.',
        message: 'Imported food products must declare the Country of Origin on the label.',
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
    evidence: 'Country of Origin is declared or product is of domestic manufacture.',
    message: 'Imported food products must declare the Country of Origin on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const IMPORT_DETAILS_PRESENCE = (product: CanonicalProduct): RawRuleFinding | null => {
  const meta = getRuleFromCatalog('IMPORT_DETAILS_PRESENCE');
  const importerVal = product.importer?.value;
  const manufVal = product.manufacturer?.value;
  const isImported = /imported|importer|imported by/i.test(manufVal + ' ' + importerVal);
  if (isImported && (!importerVal || importerVal.trim() === '')) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Product indicators suggest it is imported, but Importer Details (Name, Address) are missing.',
      message: 'The name, address, and FSSAI license number of the importer must be declared on a sticker or the printed label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'Importer details are present or not required.',
    message: 'The name, address, and FSSAI license number of the importer must be declared on a sticker or the printed label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const licensesRules = [
  FSSAI_LICENSE_PRESENCE,
  FSSAI_LICENSE_FORMAT,
  FSSAI_LICENSE_PREFIX,
  IMPORT_ORIGIN_PRESENCE,
  IMPORT_DETAILS_PRESENCE
];
