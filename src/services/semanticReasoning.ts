/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { CanonicalProduct, AIClaimAnalysis, IngredientExplanation } from '../types';
import { getRuleFromCatalog } from '../rules';

export interface SemanticReasoningResult {
  explanation: string;
  consumerFriendlySummary: string;
  misleadingClaimAnalysis: AIClaimAnalysis[];
  ingredientExplanations: IngredientExplanation[];
  suggestedFixes: string[];
}

/**
 * Dynamically retrieves relevant FSSAI regulation excerpts based on the product and Rule Engine findings
 */
export function retrieveRegulationExcerpts(
  product: CanonicalProduct,
  findings: any[]
): { citation: string; title: string; category: string; description: string }[] {
  const excerpts: { citation: string; title: string; category: string; description: string }[] = [];

  // 1. Gather excerpts for failed / warning deterministic findings
  for (const finding of findings) {
    if (finding.status === 'FAIL' || finding.status === 'WARNING') {
      const rule = getRuleFromCatalog(finding.ruleId);
      excerpts.push({
        citation: finding.citation || rule.citation || 'FSSAI Regulations',
        title: finding.title || rule.title,
        category: finding.category || rule.category,
        description: `FSSAI mandates strict compliance for '${finding.title}'. The rule catalog indicates: "${rule.suggestedFix || 'Ensure label displays this accurately.'}". Current finding status: ${finding.status}. Evidence: ${finding.evidence}.`
      });
    }
  }

  // 2. Add standard FSSAI Advertising and Claims Regulation excerpt if product has claims
  const claimsVal = product.claims?.value || [];
  if (claimsVal.length > 0) {
    excerpts.push({
      citation: 'Food Safety and Standards (Advertising and Claims) Regulations, 2018',
      title: 'General Principles for Claims and Advertisements',
      category: 'Claims Audit',
      description: 'Claims must be truthful, unambiguous, and not mislead the consumer. Claims like "natural", "fresh", "pure", "original" must only be used as specified in Schedule V. Health claims, nutrition claims, and non-addition claims must have solid scientific evidence, and contain proper declarations of nutrients.'
    });
  }

  // 3. Add standard Food Additive labeling excerpt if ingredients mention additives
  const hasAdditives = product.ingredients?.value?.some(i => /INS|color|flavour|preservative|stabilizer|emulsifier/i.test(i)) || false;
  if (hasAdditives) {
    excerpts.push({
      citation: 'Food Safety and Standards (Labelling and Display) Regulations, 2020 - Additives Clause 2.2.2.2',
      title: 'Declaration of Food Additives',
      category: 'Additives Audit',
      description: 'Food additives must be declared by their class titles (e.g. Preservative, Colour, Emulsifier) followed by their specific names or international numerical identification (INS) systems. All added flavorings must be declared as natural, nature-identical, or artificial.'
    });
  }

  // 4. Add standard FSSAI HFSS labeling guidelines if nutrition table is present
  const hasNutrition = (product.nutrition?.value && Object.keys(product.nutrition.value).length > 0) || false;
  if (hasNutrition) {
    excerpts.push({
      citation: 'FSSAI High Fat, Sugar and Salt (HFSS) Policy & Advisories',
      title: 'Nutritional Thresholds and Threshold Warnings',
      category: 'HFSS Thresholds',
      description: 'Packaged foods with sodium exceeding 1mg per kcal, or where added sugar contributes more than 10% of total energy, or where trans-fats exceed 2% of total fat by weight, must be identified for potential HFSS warnings.'
    });
  }

  return excerpts;
}

/**
 * Runs the second AI service for semantic reasoning.
 * This service receives the Canonical Product, Rule Engine findings, and Retrieved regulation excerpts,
 * and performs semantic reasoning WITHOUT deciding deterministic compliance.
 */
export async function runSemanticReasoning(
  product: CanonicalProduct,
  findings: any[],
  excerpts: any[],
  ai: GoogleGenAI
): Promise<SemanticReasoningResult> {
  const systemInstruction = `
You are an expert FSSAI (Food Safety and Standards Authority of India) Legal & Semantic Compliance Officer.
Your sole job is to perform semantic reasoning, claim evaluation, additive decryption, and write explanations.

CRITICAL DIRECTIVES:
1. You MUST NEVER decide deterministic compliance or override the Rule Engine. The Rule Engine findings are objective, mathematically verified, and final. Do not attempt to recalculate scores or decide presence of mandatory dates/licenses.
2. Rely entirely on the provided:
   - Canonical Product Data (what is printed on the package)
   - Rule Engine Findings (pre-calculated violations & passes)
   - Retrieved Regulation Excerpts (applicable legal clauses)
3. For "misleadingClaimAnalysis": Evaluate voluntary packaging claims against the FSSAI (Advertising and Claims) Regulations, 2018. Classify them as COMPLIANT, MISLEADING, WARNING, or UNSUBSTANTIATED.
4. For "ingredientExplanations": Decrypt any food additives, stabilizers, emulsifiers, preservatives, or INS numbers listed in the ingredients. Provide their purpose, a safety rating, and a clear explanation.
5. For "explanation": Write a sophisticated, professional regulatory assessment explaining how the product's packaging stands legally, without overriding the deterministic checks.
6. For "consumerFriendlySummary": Translate the complex legal and nutrition jargon into a warm, humble, easy-to-understand summary for everyday consumers.
7. For "suggestedFixes": Provide high-level constructive recommendations for the brand on how to redesign the label or add warnings to align with best practices.
`;

  const promptInput = {
    canonicalProduct: product,
    ruleEngineFindings: findings,
    retrievedRegulationExcerpts: excerpts
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      explanation: {
        type: Type.STRING,
        description: 'An expert, detailed regulatory explanation of the overall FSSAI compliance status of the product, synthesizing the deterministic findings and regulations.'
      },
      consumerFriendlySummary: {
        type: Type.STRING,
        description: 'A warm, simple, highly readable consumer-friendly explanation of the health, safety, ingredients, and label readability of the product.'
      },
      misleadingClaimAnalysis: {
        type: Type.ARRAY,
        description: 'Analysis of each marketing claim against FSSAI Guidelines.',
        items: {
          type: Type.OBJECT,
          properties: {
            claim: { type: Type.STRING },
            assessment: { type: Type.STRING, description: "Must be 'COMPLIANT', 'MISLEADING', 'WARNING', or 'UNSUBSTANTIATED'" },
            reasoning: { type: Type.STRING },
            citation: { type: Type.STRING },
            suggestedFix: { type: Type.STRING }
          },
          required: ['claim', 'assessment', 'reasoning', 'citation', 'suggestedFix']
        }
      },
      ingredientExplanations: {
        type: Type.ARRAY,
        description: 'Friendly explanations of additives, colors, preservatives, or stabilizers.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            purpose: { type: Type.STRING },
            safetyRating: { type: Type.STRING, description: "Must be 'SAFE', 'MODERATE', 'AVOID', or 'INFO'" },
            explanation: { type: Type.STRING }
          },
          required: ['name', 'purpose', 'safetyRating', 'explanation']
        }
      },
      suggestedFixes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of high-level, constructive suggested label changes or warning display modifications.'
      }
    },
    required: ['explanation', 'consumerFriendlySummary', 'misleadingClaimAnalysis', 'ingredientExplanations', 'suggestedFixes']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [{ text: `Perform semantic FSSAI compliance analysis on the following product data:\n${JSON.stringify(promptInput, null, 2)}` }],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Semantic Reasoning Service returned an empty response.');
  }

  const parsed = JSON.parse(text.trim());
  return {
    explanation: parsed.explanation,
    consumerFriendlySummary: parsed.consumerFriendlySummary,
    misleadingClaimAnalysis: parsed.misleadingClaimAnalysis,
    ingredientExplanations: parsed.ingredientExplanations,
    suggestedFixes: parsed.suggestedFixes
  };
}
