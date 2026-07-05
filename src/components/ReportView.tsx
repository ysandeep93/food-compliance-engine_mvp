/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, Download, ShieldCheck, ShieldAlert, AlertTriangle, 
  CheckCircle2, Sparkles, HelpCircle, FileText, BadgeAlert, RefreshCw, 
  ChevronDown, ChevronUp, BookOpen, AlertCircle
} from 'lucide-react';
import { ComplianceReport } from '../types';
import { generateCompliancePDF } from '../utils/pdfGenerator';

interface ReportViewProps {
  report: ComplianceReport;
  onBack: () => void;
}

export default function ReportView({ report, onBack }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'fail' | 'warning' | 'pass'>('all');
  const [expandedAdditives, setExpandedAdditives] = useState<Record<string, boolean>>({});
  const [showRawTextDebug, setShowRawTextDebug] = useState(false);

  const toggleAdditive = (name: string) => {
    setExpandedAdditives(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const findings = report.deterministicFindings;
  const fails = findings.filter(f => f.status === 'FAIL');
  const warnings = findings.filter(f => f.status === 'WARNING');
  const passes = findings.filter(f => f.status === 'PASS');

  const filteredFindings = findings.filter(f => {
    if (activeTab === 'all') return true;
    if (activeTab === 'fail') return f.status === 'FAIL';
    if (activeTab === 'warning') return f.status === 'WARNING';
    if (activeTab === 'pass') return f.status === 'PASS';
    return true;
  });

  const getScoreGrade = (score: number) => {
    if (score >= 85) return { text: 'Highly Compliant', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 70) return { text: 'Moderately Compliant', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Non-Compliant / Action Required', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const grade = getScoreGrade(report.overallScore);

  return (
    <div className="space-y-8" id="report-view-container">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0" id="report-action-bar">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Scan another product</span>
        </button>

        <button
          type="button"
          onClick={() => generateCompliancePDF(report)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl shadow-md text-sm transition-colors cursor-pointer"
          id="download-pdf-btn"
        >
          <Download className="h-4 w-4" />
          <span>Download Audit PDF</span>
        </button>
      </div>

      {/* Main Stats Panel - Overall Score & Compliance Grade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="report-overview-cards">
        {/* Compliance Score Gauge */}
        <div className="bg-[#161616] rounded-2xl border border-white/5 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compliance Score
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Based on 32 deterministic rule matches
            </p>
          </div>

          <div className="flex items-baseline space-x-2 my-4">
            <span className={`font-sans text-5xl font-extrabold tracking-tight ${
              report.overallScore >= 80 
                ? 'text-emerald-400' 
                : report.overallScore >= 60 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
            }`}>
              {report.overallScore}
            </span>
            <span className="text-slate-500 font-sans text-sm font-medium">/100</span>
          </div>

          <div className={`rounded-lg border px-3 py-2 text-xs font-semibold text-center ${grade.color}`}>
            {grade.text}
          </div>
        </div>

        {/* Confidence score */}
        <div className="bg-[#161616] rounded-2xl border border-white/5 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vision Extraction Confidence
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              AI OCR accuracy and structure index
            </p>
          </div>

          <div className="flex items-baseline space-x-2 my-4">
            <span className="font-sans text-5xl font-extrabold tracking-tight text-white">
              {report.confidenceScore}%
            </span>
            <span className="text-slate-500 text-xs font-medium font-sans">Confidence</span>
          </div>

          <div className="text-xs text-slate-400 font-sans">
            No manual adjustments required. Canonical representation locked.
          </div>
        </div>

        {/* Product core info */}
        <div className="bg-[#161616] rounded-2xl border border-white/5 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Product Information
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Extracted FSSAI registration metadata
            </p>
          </div>

          <div className="my-3 space-y-2">
            <div>
              <p className="text-xs text-slate-500 font-sans">Product Name</p>
              <p className="font-sans text-sm font-bold text-white line-clamp-1">{report.productName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-sans">Brand / Manufacturer</p>
              <p className="font-sans text-sm font-medium text-slate-300 line-clamp-1">{report.brandName || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-2">
                <p className="text-xs text-slate-500 font-sans mb-1">FSSAI Licenses</p>
                {!report.productData.fssaiLicenses?.value || report.productData.fssaiLicenses.value.length === 0 ? (
                  <p className="font-mono text-xs font-semibold text-rose-400">Not Found</p>
                ) : (
                  <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                    {report.productData.fssaiLicenses.value.map((lic, index) => (
                      <div key={index} className="flex items-center space-x-2 text-[11px] bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                        <span className="font-mono font-semibold text-emerald-400">
                          {lic.number}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium lowercase font-mono bg-white/10 px-1 rounded">
                          {lic.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {report.productData.logos.value.isVeg !== null && (
                <div className="flex items-center space-x-1 border border-white/10 rounded px-2 py-0.5 bg-white/5 mt-5">
                  <div className={`h-2.5 w-2.5 rounded-full ${report.productData.logos.value.isVeg ? 'bg-emerald-500' : 'bg-amber-600'}`} />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    {report.productData.logos.value.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {Object.values(report.productData).some(field => field && typeof field === 'object' && 'rawText' in field && field.rawText) && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowRawTextDebug(!showRawTextDebug)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>Raw Extracted Text (Debug)</span>
                {showRawTextDebug ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              
              {showRawTextDebug && (
                <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto pr-1 text-[10px] font-mono text-slate-400 bg-black/30 rounded p-2 border border-white/5">
                  {Object.entries(report.productData).map(([key, field]: [string, any]) => {
                    if (field && typeof field === 'object' && field.rawText) {
                      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={key} className="space-y-0.5 border-b border-white/5 pb-1 last:border-b-0 last:pb-0">
                          <p className="text-slate-500 font-sans font-semibold text-[9px]">{displayKey}</p>
                          <p className="whitespace-pre-wrap break-all text-slate-300">{field.rawText}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary & AI Semantic Insights */}
      {(report.consumerFriendlySummary || report.explanation) && (
        <div className="bg-gradient-to-br from-slate-900 to-[#121212] rounded-2xl border border-emerald-500/15 p-6 shadow-sm space-y-6" id="ai-semantic-insights-card">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans text-base font-bold text-white">AI Semantic & Consumer Insights</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono">Semantic Layer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumer Friendly Summary */}
            {report.consumerFriendlySummary && (
              <div className="space-y-2">
                <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Consumer Decoded Summary
                </h4>
                <p className="text-slate-300 font-sans text-sm leading-relaxed bg-white/2 p-4 rounded-xl border border-white/5">
                  {report.consumerFriendlySummary}
                </p>
              </div>
            )}

            {/* Expert Regulatory Reasoning / Redesigns */}
            <div className="space-y-4">
              {report.explanation && (
                <div className="space-y-2">
                  <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Expert Legal Explanation
                  </h4>
                  <p className="text-slate-300 font-sans text-sm leading-relaxed">
                    {report.explanation}
                  </p>
                </div>
              )}

              {report.suggestedFixes && report.suggestedFixes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h4 className="font-sans text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>Constructive Redesign Suggestions</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400 font-sans list-disc pl-4 leading-relaxed">
                    {report.suggestedFixes.map((fix, idx) => (
                      <li key={idx} className="hover:text-slate-300 transition-colors">
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main body: left list, right metadata details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="report-main-grid">
        {/* Left 2 columns: Rule matches and AI claims */}
        <div className="lg:col-span-2 space-y-8" id="report-left-column">
          {/* Section: Deterministic rule matches */}
          <div className="bg-[#161616] rounded-2xl border border-white/5 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-lg font-bold text-white flex items-center space-x-2">
                  <span>FSSAI Rule Verification</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Pre-built objective rule catalog mapped from official FSSAI Gazette
                </p>
              </div>

              {/* Filtering tabs */}
              <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'all' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({findings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fail')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'fail' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fails ({fails.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('warning')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'warning' ? 'bg-amber-500 text-black shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Warnings ({warnings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pass')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'pass' ? 'bg-emerald-500 text-black shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Passes ({passes.length})
                </button>
              </div>
            </div>

            {/* List of findings */}
            <div className="space-y-4" id="rules-findings-list">
              {filteredFindings.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-sans">
                  No rule results in this category.
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <div 
                    key={finding.ruleId} 
                    className={`border rounded-xl p-4 transition-all ${
                      finding.status === 'FAIL' 
                        ? 'border-rose-500/20 bg-rose-500/5' 
                        : finding.status === 'WARNING' 
                          ? 'border-amber-500/20 bg-amber-500/5' 
                          : 'border-white/5 bg-white/2'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            finding.status === 'FAIL' 
                              ? 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20' 
                              : finding.status === 'WARNING' 
                                ? 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
                          }`}>
                            {finding.status}
                          </span>
                          {finding.severity && (
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              finding.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-500/30'
                                : finding.severity === 'MAJOR'
                                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-inset ring-amber-500/30'
                                  : finding.severity === 'MINOR'
                                    ? 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20'
                                    : 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20'
                            }`}>
                              {finding.severity}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono font-medium">{finding.category}</span>
                        </div>
                        <h4 className="font-sans text-sm font-bold text-white">{finding.title}</h4>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        ID: {finding.ruleId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans mt-3">
                      <strong className="text-white font-semibold">Evidence: </strong>
                      {finding.evidence}
                    </p>

                    <div className="border-t border-white/5 mt-3 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono flex items-center space-x-1">
                        <BookOpen className="h-3 w-3 text-slate-500" />
                        <span>Citation: {finding.citation}</span>
                      </span>

                      {finding.suggestedFix && (
                        <span className="text-amber-300 font-sans font-medium flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                          <span>Fix: {finding.suggestedFix}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: AI Semantic Claims Analysis */}
          {report.aiClaimFindings.length > 0 && (
            <div className="bg-[#161616] rounded-2xl border border-white/5 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-sans text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <span>AI Claims & Slogans Audit</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Semantic evaluation of voluntary claims under FSSAI (Advertising and Claims) Regulations, 2018
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="claims-grid">
                {report.aiClaimFindings.map((claim, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-xl p-4 flex flex-col justify-between ${
                      claim.assessment === 'COMPLIANT' 
                        ? 'border-emerald-500/20 bg-emerald-500/5' 
                        : claim.assessment === 'MISLEADING' 
                          ? 'border-rose-500/20 bg-rose-500/5' 
                          : 'border-amber-500/20 bg-amber-500/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] text-slate-500 uppercase font-medium">Marketing Claim</span>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          claim.assessment === 'COMPLIANT' 
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' 
                            : claim.assessment === 'MISLEADING' 
                              ? 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                        }`}>
                          {claim.assessment}
                        </span>
                      </div>

                      <h4 className="font-sans text-sm font-bold text-white mb-2">"{claim.claim}"</h4>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">{claim.reasoning}</p>
                    </div>

                    <div className="border-t border-white/5 mt-4 pt-3 space-y-2">
                      <p className="text-[10px] text-slate-400 font-mono">
                        Reference: {claim.citation}
                      </p>
                      {claim.suggestedFix && (
                        <p className="text-[11px] text-amber-300 font-sans font-medium bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                          Suggested change: {claim.suggestedFix}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 column: Nutrition Table & Ingredients Info */}
        <div className="space-y-8" id="report-right-column">
          {/* FSSAI Standard Nutrition Table */}
          <div className="bg-[#161616] rounded-2xl border border-white/5 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-sans text-sm font-bold text-white">Nutrition Facts Table</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">As declared per 100g / 100ml</p>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden text-xs" id="nutrition-facts-table">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-2 text-left font-sans text-slate-300 font-medium uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-2 text-right font-sans text-slate-300 font-medium uppercase tracking-wider">Declared Value</th>
                  </tr>
                </thead>
                <tbody className="bg-[#161616] divide-y divide-white/5 font-mono text-slate-300">
                  {Object.entries(report.productData.nutrition.value).map(([key, item]) => {
                    if (!item) return null;
                    const formatLabel = (s: string) => {
                      const labels: Record<string, string> = {
                        energy: 'Energy',
                        protein: 'Protein',
                        carbs: 'Carbohydrates',
                        totalSugars: 'Total Sugars',
                        addedSugars: 'Added Sugars',
                        totalFat: 'Total Fat',
                        saturatedFat: 'Saturated Fat',
                        transFat: 'Trans Fat',
                        sodium: 'Sodium'
                      };
                      return labels[s] || s;
                    };

                    const isSpecial = ['addedSugars', 'saturatedFat', 'transFat'].includes(key);

                    return (
                      <tr key={key} className={isSpecial ? 'bg-white/2' : ''}>
                        <td className={`px-4 py-2 ${isSpecial ? 'pl-8 text-slate-400' : 'font-semibold text-white'}`}>
                          {formatLabel(key)}
                        </td>
                        <td className="px-4 py-2 text-right text-emerald-400">
                          {item.value} {item.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 bg-white/5 p-2.5 rounded border border-white/5 font-sans">
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Added Sugars, Saturated Fats, and Sodium require mandatory front-of-pack display if exceeding threshold.</span>
            </div>
          </div>

          {/* Food Additives / Ingredients Breakdown */}
          {report.ingredientExplanations.length > 0 && (
            <div className="bg-[#161616] rounded-2xl border border-white/5 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-white">Food Additives & Additions</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Deciphering INS chemical codes and food compounds
                </p>
              </div>

              <div className="space-y-3" id="additives-list">
                {report.ingredientExplanations.map((item, idx) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 space-y-2 text-xs bg-white/2">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleAdditive(item.name)}
                    >
                      <div className="space-y-0.5">
                        <p className="font-sans font-bold text-white">{item.name}</p>
                        <p className="font-mono text-[10px] text-slate-500 uppercase">{item.purpose}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          item.safetyRating === 'SAFE' 
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' 
                            : item.safetyRating === 'MODERATE' 
                              ? 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20' 
                              : 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20'
                        }`}>
                          {item.safetyRating}
                        </span>
                        {expandedAdditives[item.name] ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {expandedAdditives[item.name] && (
                      <p className="text-slate-300 font-sans leading-relaxed pt-2 border-t border-white/5 text-[11px]">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
