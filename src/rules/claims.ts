/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalProduct, RawRuleFinding } from '../types';

// Deterministic rules specifically for claims.
// Currently claims analysis is performed semantically using the LLM.
// This file serves as an extensible module for future deterministic claim rules.

export const claimsRules: ((product: CanonicalProduct) => RawRuleFinding | null)[] = [];
