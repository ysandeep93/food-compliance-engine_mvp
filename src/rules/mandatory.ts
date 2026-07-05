/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RuleFinding } from '../types';
import { getRuleFromCatalog } from './index';

export const MAND_PROD_NAME = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_PROD_NAME');
  const val = product.productName?.value;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Product name was not detected on the label.',
      message: 'Every packaged food must have the common name of the product on the front of the pack.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Product name detected: "${val}"`,
    message: 'Every packaged food must have the common name of the product on the front of the pack.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MAND_BRAND_NAME = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_BRAND_NAME');
  const val = product.brand?.value;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Brand/trade name was not clearly detected on the label.',
      message: 'Brand or trade name must be displayed on the label.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Brand name detected: "${val}"`,
    message: 'Brand or trade name must be displayed on the label.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MAND_NET_QTY = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_NET_QTY');
  const val = product.warnings?.value?.netQuantity;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Net quantity was not detected on the label.',
      message: 'Net quantity of the food must be declared in metric system units (g, kg, ml, L).',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  const hasUnit = /[gG]|[kK][gG]|[mM][lL]|[lL]/.test(val);
  if (!hasUnit) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: 'WARNING',
      evidence: `Net quantity detected ("${val}") but might be missing metric units.`,
      message: 'Net quantity of the food must be declared in metric system units (g, kg, ml, L).',
      suggestedFix: 'Ensure net quantity is declared using standard metric units like g, kg, ml, or L.',
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Net quantity detected: "${val}"`,
    message: 'Net quantity of the food must be declared in metric system units (g, kg, ml, L).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MAND_MANUF_DETAILS = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_MANUF_DETAILS');
  const val = product.manufacturer?.value;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Manufacturer or packer name and address are missing.',
      message: 'The name and complete address of the manufacturer or packer must be stated.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Manufacturer details detected: "${val.slice(0, 60)}${val.length > 60 ? '...' : ''}"`,
    message: 'The name and complete address of the manufacturer or packer must be stated.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const DATE_MANUF_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('DATE_MANUF_PRESENCE');
  const datesVal = product.dates?.value;
  if (!datesVal || !datesVal.manufactureDate) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Date of manufacture / packaging was not detected.',
      message: 'Date of manufacture or packing must be declared on all packaged food.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Manufacture date detected: "${datesVal.manufactureDate}"`,
    message: 'Date of manufacture or packing must be declared on all packaged food.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const DATE_EXPIRY_PRESENCE = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('DATE_EXPIRY_PRESENCE');
  const datesVal = product.dates?.value;
  const bestBefore = datesVal?.bestBefore;
  const expiry = datesVal?.expiryDate;
  if (!bestBefore && !expiry) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Neither Expiry Date nor Best Before date was detected.',
      message: 'Every label must display either the Expiry Date (Use By) or Best Before date.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Shelf life indicator detected: ${bestBefore ? `Best Before "${bestBefore}"` : ''} ${expiry ? `Expiry Date "${expiry}"` : ''}`,
    message: 'Every label must display either the Expiry Date (Use By) or Best Before date.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const DATE_FORMAT = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('DATE_FORMAT');
  const datesVal = product.dates?.value;
  const datesToTest = [
    datesVal?.manufactureDate,
    datesVal?.expiryDate,
    datesVal?.bestBefore
  ].filter(Boolean) as string[];

  if (datesToTest.length === 0) return null;

  const formatRegex = /^(0[1-9]|[12][0-9]|3[01])[\/\.\-](0[1-9]|1[012])[\/\.\-]\d{4}$|^(0[1-9]|1[012])[\/\.\-]\d{4}$|^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/;
  const allValid = datesToTest.every(dateStr => formatRegex.test(dateStr.trim()) || dateStr.toLowerCase().includes('month'));

  if (!allValid) {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: `One or more detected dates ("${datesToTest.join(', ')}") do not clearly match standard DD/MM/YYYY or MM/YYYY numerical formats.`,
      message: 'FSSAI mandates standard date formats for manufacture and expiry declarations (DD/MM/YYYY or MM/YYYY).',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: 'Detected date formats conform to standard readability.',
    message: 'FSSAI mandates standard date formats for manufacture and expiry declarations (DD/MM/YYYY or MM/YYYY).',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MAND_BATCH_NUM = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_BATCH_NUM');
  const val = product.warnings?.value?.batchNumber;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'Batch number or lot identifier was not detected.',
      message: 'A batch number, lot number, or code reference is mandatory for traceability.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Batch number detected: "${val}"`,
    message: 'A batch number, lot number, or code reference is mandatory for traceability.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const MAND_STORAGE_INSTR = (product: CanonicalProduct): RuleFinding | null => {
  const meta = getRuleFromCatalog('MAND_STORAGE_INSTR');
  const val = product.storageInstructions?.value;
  if (!val || val.trim() === '') {
    return {
      ruleId: meta.id,
      title: meta.title,
      passed: false,
      severity: meta.severity,
      evidence: 'No specific storage guidelines were detected.',
      message: 'Specific storage instructions must be declared if the shelf life depends on them.',
      suggestedFix: meta.suggestedFix,
      citation: meta.citation
    };
  }
  return {
    ruleId: meta.id,
    title: meta.title,
    passed: true,
    severity: meta.severity,
    evidence: `Storage instructions detected: "${val}"`,
    message: 'Specific storage instructions must be declared if the shelf life depends on them.',
    suggestedFix: '',
    citation: meta.citation
  };
};

export const mandatoryRules = [
  MAND_PROD_NAME,
  MAND_BRAND_NAME,
  MAND_NET_QTY,
  MAND_MANUF_DETAILS,
  DATE_MANUF_PRESENCE,
  DATE_EXPIRY_PRESENCE,
  DATE_FORMAT,
  MAND_BATCH_NUM,
  MAND_STORAGE_INSTR
];
