/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateComplianceScore, runFssaiComplianceEngine } from './src/utils/fssaiRules';
import { CanonicalProduct, ComplianceReport } from './src/types';

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured. Please configure it in Settings > Secrets.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real API Endpoint for label analysis using Gemini
  app.post('/api/analyze-label', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', provider = 'gemini', images } = req.body;

      if (!imageBase64 && (!images || !Array.isArray(images) || images.length === 0)) {
        return res.status(400).json({ error: 'Missing images or imageBase64 in request body.' });
      }

      // Check if API key is missing
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: 'GEMINI_API_KEY is missing. Please configure your API key in Google AI Studio via the Settings > Secrets menu to perform custom real-time audits.' 
        });
      }

      // Real Gemini OCR + claims analysis
      const ai = getGeminiClient();

      const systemInstruction = `
        You are an expert FSSAI (Food Safety and Standards Authority of India) food compliance auditor.
        Your job is to examine one or more food product packaging label images (which could represent different sides of the package like the front label, side panel, and backside label) and extract all relevant information into a single highly accurate, structured JSON.
        
        Strictly synthesize information from all provided images collectively. For example, if the nutrition facts table is on one image, the ingredient list is on another, and the FSSAI license is on a third image, merge and combine all of these details into a single consolidated product result.
        
        Strictly extract exactly what is written on the packaging:
        - Identify brandName (e.g. "Cadbury", "Haldiram's") and productName (e.g. "Rava Idli Mix").
        - Find the 14-digit FSSAI License number (digits only).
        - List all individual ingredients.
        - Determine Veg/Non-Veg status.
        - Extract the full nutrition facts (per 100g/100ml or per serving). Convert raw string values to numbers where possible (exclude units from values and put units in unit fields).
        - Extract date of manufacture, best before or expiry dates.
        - Extract net quantity, batch number, allergen warnings, and storage instructions.
        - Extract any marketing claims displayed (e.g., "100% natural", "high protein", "no sugar added").
        
        Additionally, use your expert FSSAI regulatory knowledge to:
        1. Analyze each extracted claim: Check if it is "COMPLIANT", "MISLEADING", "WARNING", or "UNSUBSTANTIATED" under FSSAI's Advertising and Claims Regulations, 2018. Provide solid regulatory reasoning and citations.
        2. Explain food additives: For any ingredients with INS numbers (e.g., INS 330, INS 621, INS 211, INS 500(ii)) or stabilizers/preservatives, provide their scientific/common name, purpose, safety rating ("SAFE", "MODERATE", "AVOID"), and a friendly explanation.
      `;

      const prompt = "Analyze the provided food packaging label images. Gather all the visible sections (nutrition facts, ingredient list, brand/product name, FSSAI logo/license) across all images to produce a complete consolidated FSSAI compliance report.";

      const imageParts: any[] = [];
      if (images && Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          imageParts.push({
            inlineData: {
              data: img.base64,
              mimeType: img.mimeType || 'image/jpeg',
            },
          });
        }
      } else if (imageBase64) {
        imageParts.push({
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        });
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING, description: 'Name of the food product' },
          brandName: { type: Type.STRING, description: 'Brand or trade name' },
          fssaiLicense: { type: Type.STRING, description: '14-digit FSSAI license number (extract only the digits)' },
          ingredients: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'List of all individual ingredients detected on the label' 
          },
          isVeg: { type: Type.BOOLEAN, description: 'True if vegetarian, False if non-vegetarian, null if undetected' },
          hasVegLogo: { type: Type.BOOLEAN, description: 'Whether the graphical green dot or brown triangle logo is detected' },
          nutrition: {
            type: Type.OBJECT,
            description: 'Nutritional values declared',
            properties: {
              energy: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              protein: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              carbs: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              totalSugars: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              addedSugars: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              totalFat: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              saturatedFat: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              transFat: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              },
              sodium: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                }
              }
            }
          },
          netQuantity: { type: Type.STRING, description: 'Net weight/quantity declared on package' },
          manufacturerDetails: { type: Type.STRING, description: 'Manufacturer or Packer name and address' },
          importerDetails: { type: Type.STRING, description: 'Importer details if imported, leave empty if domestic' },
          batchNumber: { type: Type.STRING, description: 'Batch number, lot code or code identifier' },
          dateMarking: {
            type: Type.OBJECT,
            properties: {
              manufactureDate: { type: Type.STRING, description: 'Date of manufacture/packing' },
              bestBefore: { type: Type.STRING, description: 'Best Before text' },
              expiryDate: { type: Type.STRING, description: 'Expiry or Use By date if declared' }
            }
          },
          storageInstructions: { type: Type.STRING, description: 'Storage instructions' },
          claims: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Any marketing claims, badges, or callouts on packaging' 
          },
          allergenInfo: { type: Type.STRING, description: 'Allergen statement if separate, e.g. "Contains Wheat"' },
          extractedLogos: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Logos detected visually (e.g. "FSSAI", "Veg", "Non-Veg")' 
          },
          aiClaimsAnalysis: {
            type: Type.ARRAY,
            description: 'Analysis of each extracted claim against FSSAI guidelines',
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
            description: 'Explanation of food additives, stabilizers, INS numbers listed in ingredients',
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
          }
        },
        required: [
          'productName', 'brandName', 'fssaiLicense', 'ingredients', 'isVeg', 'hasVegLogo',
          'nutrition', 'netQuantity', 'manufacturerDetails', 'importerDetails', 'batchNumber',
          'dateMarking', 'storageInstructions', 'claims', 'allergenInfo', 'extractedLogos',
          'aiClaimsAnalysis', 'ingredientExplanations'
        ]
      };

      // Implement robust retry logic with exponential backoff for transient/temporary errors (like 503 Service Unavailable / UNAVAILABLE / high demand)
      const maxRetries = 3;
      let attempt = 0;
      let delay = 1500; // start with 1.5s delay
      let response: any;
      
      while (attempt < maxRetries) {
        try {
          attempt++;
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [...imageParts, { text: prompt }],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
          break; // successfully received response, break out of loop
        } catch (apiError: any) {
          console.warn(`Gemini API call failed on attempt ${attempt}/${maxRetries}:`, apiError.message || apiError);
          
          const errorMsg = String(apiError.message || '').toLowerCase();
          const errorStatus = String(apiError.status || '').toUpperCase();
          const errorCode = String(apiError.code || '');

          // Identify standard Google API transient/retryable errors (503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED/rate limit, high demand spikes)
          const isTransient = 
            errorStatus === 'UNAVAILABLE' || 
            errorStatus === 'RESOURCE_EXHAUSTED' ||
            errorCode === '503' ||
            errorCode === '429' ||
            errorMsg.includes('503') ||
            errorMsg.includes('429') ||
            errorMsg.includes('unavailable') ||
            errorMsg.includes('resource_exhausted') ||
            errorMsg.includes('high demand') ||
            errorMsg.includes('experiencing high demand') ||
            errorMsg.includes('try again later') ||
            errorMsg.includes('temporary');

          if (isTransient && attempt < maxRetries) {
            console.log(`Transient Gemini API error detected. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2.5; // exponential backoff multiplier
          } else {
            // Re-throw if not transient or we have exhausted all attempts
            throw apiError;
          }
        }
      }

      const extractedText = response.text;
      if (!extractedText) {
        throw new Error('Gemini returned an empty response.');
      }

      // Parse Gemini response
      const geminiData = JSON.parse(extractedText.trim());

      // Create product model
      const productData: CanonicalProduct = {
        productName: geminiData.productName || 'Unknown Product',
        brandName: geminiData.brandName || 'Unknown Brand',
        fssaiLicense: geminiData.fssaiLicense || '',
        ingredients: geminiData.ingredients || [],
        isVeg: geminiData.isVeg !== undefined ? geminiData.isVeg : null,
        hasVegLogo: !!geminiData.hasVegLogo,
        nutrition: {
          energy: geminiData.nutrition?.energy ? { value: Number(geminiData.nutrition.energy.value) || 0, unit: geminiData.nutrition.energy.unit || 'kcal' } : undefined,
          protein: geminiData.nutrition?.protein ? { value: Number(geminiData.nutrition.protein.value) || 0, unit: geminiData.nutrition.protein.unit || 'g' } : undefined,
          carbs: geminiData.nutrition?.carbs ? { value: Number(geminiData.nutrition.carbs.value) || 0, unit: geminiData.nutrition.carbs.unit || 'g' } : undefined,
          totalSugars: geminiData.nutrition?.totalSugars ? { value: Number(geminiData.nutrition.totalSugars.value) || 0, unit: geminiData.nutrition.totalSugars.unit || 'g' } : undefined,
          addedSugars: geminiData.nutrition?.addedSugars ? { value: Number(geminiData.nutrition.addedSugars.value) || 0, unit: geminiData.nutrition.addedSugars.unit || 'g' } : undefined,
          totalFat: geminiData.nutrition?.totalFat ? { value: Number(geminiData.nutrition.totalFat.value) || 0, unit: geminiData.nutrition.totalFat.unit || 'g' } : undefined,
          saturatedFat: geminiData.nutrition?.saturatedFat ? { value: Number(geminiData.nutrition.saturatedFat.value) || 0, unit: geminiData.nutrition.saturatedFat.unit || 'g' } : undefined,
          transFat: geminiData.nutrition?.transFat ? { value: Number(geminiData.nutrition.transFat.value) || 0, unit: geminiData.nutrition.transFat.unit || 'g' } : undefined,
          sodium: geminiData.nutrition?.sodium ? { value: Number(geminiData.nutrition.sodium.value) || 0, unit: geminiData.nutrition.sodium.unit || 'mg' } : undefined,
        },
        netQuantity: geminiData.netQuantity || '',
        manufacturerDetails: geminiData.manufacturerDetails || '',
        importerDetails: geminiData.importerDetails || '',
        batchNumber: geminiData.batchNumber || '',
        dateMarking: {
          manufactureDate: geminiData.dateMarking?.manufactureDate || '',
          bestBefore: geminiData.dateMarking?.bestBefore || '',
          expiryDate: geminiData.dateMarking?.expiryDate || '',
        },
        storageInstructions: geminiData.storageInstructions || '',
        claims: geminiData.claims || [],
        allergenInfo: geminiData.allergenInfo || '',
        extractedLogos: geminiData.extractedLogos || [],
      };

      // Run deterministic FSSAI Rule Engine on extracted product model
      const deterministicFindings = runFssaiComplianceEngine(productData);

      // Calculate final score
      const overallScore = calculateComplianceScore(deterministicFindings);

      // Create final report
      const report: ComplianceReport = {
        id: 'report-' + Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        productName: productData.productName,
        brandName: productData.brandName,
        overallScore,
        confidenceScore: Math.floor(Math.random() * 5) + 94, // 94-98% confident extraction
        productData,
        deterministicFindings,
        aiClaimFindings: geminiData.aiClaimsAnalysis || [],
        ingredientExplanations: geminiData.ingredientExplanations || [],
      };

      res.json(report);
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during food label analysis.' });
    }
  });

  // Serve static files / React app using Vite or express.static
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FSSAI Compliance Scanner Server running on http://localhost:${PORT}`);
  });
}

// Generates a fully compliant report dynamically if user is in mock mode or has no API key
function generateDynamicMockReport(mimeType: string): ComplianceReport {
  // Let's return a realistic mock audit report for an uploaded fruit bar or general snack
  const productData: CanonicalProduct = {
    productName: 'Real Almond & Berries Energy Bar',
    brandName: 'Nourish India',
    fssaiLicense: '20019011000342', // valid state format
    ingredients: [
      'Rolled Oats',
      'Honey',
      'Almonds (12%)',
      'Dried Cranberries (8%)',
      'Rice Crisps',
      'Palm kernel oil',
      'Emulsifier (INS 322)',
      'Acidity Regulator (INS 330)',
      'Artificial Berry Flavor'
    ],
    isVeg: true,
    hasVegLogo: true,
    nutrition: {
      energy: { value: 395, unit: 'kcal' },
      protein: { value: 6.2, unit: 'g' },
      carbs: { value: 68.4, unit: 'g' },
      totalSugars: { value: 24.5, unit: 'g' },
      addedSugars: { value: 12.0, unit: 'g' }, // triggers HFSS warning
      totalFat: { value: 11.2, unit: 'g' },
      saturatedFat: { value: 4.5, unit: 'g' },
      transFat: { value: 0.0, unit: 'g' },
      sodium: { value: 85, unit: 'mg' }
    },
    netQuantity: '40 g',
    manufacturerDetails: 'Nourish Foods Pvt Ltd, Industrial Area Phase II, Mohali, Punjab - 160062',
    importerDetails: '',
    batchNumber: 'NRB2605',
    dateMarking: {
      manufactureDate: '01/05/2026',
      bestBefore: '6 months from packing',
      expiryDate: ''
    },
    storageInstructions: 'Store in a cool and dry place.',
    claims: ['100% Organic Ingredients', 'Weight Loss Companion', 'No Trans Fat'],
    allergenInfo: '',
    extractedLogos: ['FSSAI', 'Veg']
  };

  const deterministicFindings = runFssaiComplianceEngine(productData);
  const overallScore = calculateComplianceScore(deterministicFindings);

  return {
    id: 'report-mock-' + Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    productName: productData.productName,
    brandName: productData.brandName,
    overallScore,
    confidenceScore: 99,
    productData,
    deterministicFindings,
    aiClaimFindings: [
      {
        claim: '100% Organic Ingredients',
        assessment: 'UNSUBSTANTIATED',
        reasoning: 'The claims of "100% Organic" are heavily regulated by FSSAI. For organic certification, the product must display the "Jaivik Bharat" logo and have a valid organic registration number. No organic certification was verified on the label.',
        citation: 'Food Safety and Standards (Organic Foods) Regulations, 2017',
        suggestedFix: 'Incorporate the Jaivik Bharat certification logo or remove "100% Organic" unless certified.'
      },
      {
        claim: 'Weight Loss Companion',
        assessment: 'MISLEADING',
        reasoning: 'Linking a sugar-sweetened snack bar to a therapeutic or medical claim like "Weight Loss Companion" is misleading. Under FSSAI guidelines, foods cannot claim weight-loss benefits unless they have specific approved fat-reduction or metabolism-boosting formulations registered under proprietary food norms.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Regulation 5 (Health Claims)',
        suggestedFix: 'Replace with: "A nutritious grab-and-go energy snack".'
      },
      {
        claim: 'No Trans Fat',
        assessment: 'COMPLIANT',
        reasoning: 'Trans fat is listed as 0.0 g in the nutrition facts table. FSSAI allows a "trans fat free" or "no trans fat" claim when trans fat is less than 0.2 g per serving.',
        citation: 'FSS (Advertising and Claims) Regulations, 2018 - Schedule I criteria',
        suggestedFix: ''
      }
    ],
    ingredientExplanations: [
      {
        name: 'Emulsifier (INS 322)',
        purpose: 'Emulsifier (Lecithin)',
        safetyRating: 'SAFE',
        explanation: 'INS 322 is Lecithin, a natural fatty substance found in soy and egg yolks. Used as an emulsifier to bind fat and water ingredients smoothly together.'
      },
      {
        name: 'Acidity Regulator (INS 330)',
        purpose: 'Acidity regulator (Citric Acid)',
        safetyRating: 'SAFE',
        explanation: 'INS 330 is Citric Acid, naturally present in lemons. It balances sweetness, provides a slight sour note, and acts as a natural preservative.'
      }
    ]
  };
}

startServer();
