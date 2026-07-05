/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const FSSAI_LICENSE_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_PRESENCE');
  const val = product.fssaiLicenses?.value;
  if (!val || val.trim() === '') {
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
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `FSSAI license number found: "${val}"`,
    message: 'The FSSAI logo and 14-digit license number must be displayed on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const FSSAI_LICENSE_FORMAT = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_FORMAT');
  const val = product.fssaiLicenses?.value;
  if (!val || val.trim() === '') return null; // NOT_APPLICABLE status is handled by returning null

  const digitsOnly = val.replace(/\D/g, '');
  if (digitsOnly.length !== 14) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: `FSSAI License detected ("${val}") contains ${digitsOnly.length} digits. It must be exactly 14 digits.`,
      message: 'The FSSAI license number must be a valid 14-digit numerical format.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Valid 14-digit FSSAI license format: ${digitsOnly}`,
    message: 'The FSSAI license number must be a valid 14-digit numerical format.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const FSSAI_LICENSE_PREFIX = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('FSSAI_LICENSE_PREFIX');
  const val = product.fssaiLicenses?.value;
  if (!val) return null; // NOT_APPLICABLE status is handled by returning null

  const digitsOnly = val.replace(/\D/g, '');
  if (digitsOnly.length === 14) {
    const firstDigit = digitsOnly[0];
    if (firstDigit !== '1' && firstDigit !== '2') {
      return {
        ruleId: meta.id,
        title: meta.title,
        passed: false,
        severity: meta.severity,
        evidence: `The license starts with "${firstDigit}". Standard Indian FSSAI licenses typically start with "1" (Central/Manufacturing) or "2" (State/Retail).`,
        message: 'FSSAI license numbers must start with a valid standard prefix (1 or 2).',
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
    evidence: 'FSSAI license prefix is standard.',
    message: 'FSSAI license numbers must start with a valid standard prefix (1 or 2).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const IMPORT_ORIGIN_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
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

export const IMPORT_DETAILS_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
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
