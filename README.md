# Food Compliance Engine (MVP)

AI-powered food label compliance platform for India that combines Vision AI, deterministic FSSAI rules, and semantic AI analysis to generate explainable compliance reports.

## Why This Project Exists

Most AI-powered label analyzers simply upload an image to an LLM and ask:
"Is this food label compliant?"

This produces non-deterministic answers that are difficult to test, audit, and reproduce.

Food Compliance Engine follows a different philosophy:
1. **Vision AI extracts information.**
2. **Deterministic rules decide compliance.**
3. **AI explains ambiguous findings.**

## Core Philosophy

### LLMs Extract
Vision models understand the label and produce structured data. They never make compliance decisions.

### Rules Decide
Objective compliance is determined using deterministic rules derived from official FSSAI regulations. Rules are:
- Testable
- Repeatable
- Explainable
- Auditable

### AI Explains
LLMs are used only for:
- Marketing claim interpretation
- Consumer-friendly explanations
- Regulatory reasoning
- Ingredient explanations

---

## High-Level Architecture

```
Image(s)
                      │
              Vision Provider
         (Gemini / OpenAI / Future)
                      │
          Raw Structured Extraction
                      │
               Mapper / Normalizer
                      │
           Canonical Product Model
              ┌────────┴────────┐
              │                 │
       Validation Layer     RAG + LLM
              │                 │
      Deterministic Rules   Semantic Analysis
              │                 │
      Missing Fields        Marketing Claims
      Format Validation     Consumer Explanation
      Numeric Validation    Regulatory Reasoning
              │                 │
              └────────┬────────┘
                       │
              Compliance Report
```

---

## Processing Pipeline

### 1. Image Upload
Supports:
- Front label
- Back label
- Side label
- Multiple images

### 2. Vision Extraction
Current provider:
- Google Gemini

Future providers:
- OpenAI GPT-4o
- Claude Vision
- Docling + Text LLM
- Local Vision Models

Responsibilities:
- OCR
- Layout understanding
- Ingredient extraction
- Nutrition extraction
- Claim extraction

Output:
- Provider-specific structured JSON.
- No compliance analysis.

### 3. Mapper Layer
Every provider returns different JSON. The Mapper converts provider output into a common internal model.

```
Gemini JSON
        ↓
Mapper
        ↓
CanonicalProduct
```

The rest of the application never depends on provider-specific formats.

### Canonical Product Model
All downstream components consume a single model.
Example fields:
- Product Name
- Brand
- Ingredients
- Nutrition
- Claims
- Manufacturer
- Importer
- FSSAI Licenses
- Logos
- Dates
- Storage Instructions
- Warnings

Each extracted field should contain:
- `value`
- `confidence`
- `source`

### Validation Layer
Before running compliance rules:
- Required field validation
- Numeric validation
- Duplicate detection
- License validation
- Confidence validation

Low-confidence extraction is reported as *Unable to Verify* instead of assuming missing data.

---

## Deterministic Rule Engine

The Rule Engine is the heart of the application. It evaluates deterministic rules extracted from official FSSAI regulations.

Examples:
- Product Name
- Brand Name
- Ingredient Declaration
- Nutrition Table
- Net Quantity
- Manufacturer Details
- FSSAI License
- Veg / Non-Veg Logo
- Date Marking
- Storage Instructions

Each rule returns:
- `PASS`, `FAIL`, or `WARNING`

with:
- Rule ID
- Evidence
- Severity
- Suggested Fix
- Regulation Citation

The Rule Engine never relies on LLM reasoning.

### Rule Catalog
The long-term goal is to replace hardcoded rule definitions with a machine-readable Rule Catalog.

Example structure:
```
src/
    ruleCatalog/
        mandatory.json
        ingredients.json
        nutrition.json
        claims.json
        logos.json
```

Each rule contains:
- Rule ID
- Title
- Category
- Applicability
- Validation Type
- Severity
- Citation
- Suggested Fix

This allows regulations to evolve without changing business logic.

---

## Semantic AI (RAG + LLM)

Used only when deterministic logic is insufficient.
Examples:
- *"Boosts immunity naturally"*
- *"100% Natural"*
- *"Doctor Recommended"*
- *"Healthy Choice"*

Workflow:
```
Retrieve relevant regulation excerpts
↓
Provide extracted product data
↓
Generate:
  - Explanation
  - Regulatory reasoning
  - Supporting citations
```

Semantic AI never overrides deterministic findings.

---

## Compliance Report

The report combines deterministic findings with AI explanations.

Includes:
- **Overall Compliance Score**
- **Extraction Confidence**
- **Deterministic Findings**: Missing mandatory declarations, invalid formats, missing logos, missing nutrition table.
- **AI Findings**: Potentially misleading claims, consumer-friendly explanations, ingredient insights.

Every finding includes:
- Severity
- Evidence
- Suggested Fix
- Regulation Citation

---

## Current MVP Scope

### Included:
- Image Upload
- Gemini Vision
- Canonical Product Model
- Validation Layer
- Deterministic Rule Engine
- Initial FSSAI Rules
- AI Claim Analysis
- JSON Report

### Deferred:
- Rule Versioning
- Human Review Workflow
- Automatic Regulation Updates
- Enterprise Features
- Multi-country Regulations

---

## Suggested Project Structure

```
src/
├── ai/
├── components/
├── hooks/
├── mapper/
├── models/
├── prompts/
├── rag/
├── ruleCatalog/
├── rules/
├── services/
├── utils/
├── types.ts
└── server.ts
```

---

## Design Principles

1. LLMs extract.
2. Rules decide.
3. AI explains.
4. Never hallucinate compliance.
5. Keep business logic outside prompts.
6. Keep AI providers interchangeable.
7. Prefer deterministic validation wherever possible.

---

## Roadmap

### Phase 1
- Stable MVP
- 30-40 deterministic rules
- Explainable reports

### Phase 2
- Machine-readable Rule Catalog
- AI Rule Extractor from FSSAI PDFs
- Expanded regulation coverage

### Phase 3
- Continuous regulation updates
- Enterprise dashboard
- Multi-country compliance

---

## Project Status

🚧 **Current Status: MVP**

The goal is to validate the product quickly. The architecture intentionally favors simplicity over enterprise complexity. Advanced capabilities such as rule versioning, workflow engines, enterprise review flows, and automated regulation synchronization are intentionally deferred until after product-market fit.
