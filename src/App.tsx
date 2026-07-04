/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Uploader from './components/Uploader';
import ReportView from './components/ReportView';
import HistoryLog from './components/HistoryLog';
import { ComplianceReport } from './types';
import { AlertCircle, ShieldAlert, Sparkles, HelpCircle, CheckSquare, Search } from 'lucide-react';

export default function App() {
  const [activeReport, setActiveReport] = useState<ComplianceReport | null>(null);
  const [history, setHistory] = useState<ComplianceReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fssai_compliance_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
  }, []);

  const handleAnalyzeStart = (provider: 'gemini' | 'mock') => {
    setError(null);
  };

  const handleAnalyzeComplete = (report: ComplianceReport) => {
    setActiveReport(report);
    
    setHistory(prev => {
      // Avoid duplicate reports
      const exists = prev.some(r => r.id === report.id);
      if (exists) return prev;
      
      const updated = [report, ...prev];
      localStorage.setItem('fssai_compliance_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAnalyzeError = (msg: string) => {
    setError(msg);
  };

  const handleSelectReport = (report: ComplianceReport) => {
    setActiveReport(report);
    setError(null);
  };

  const handleDeleteReport = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('fssai_compliance_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('fssai_compliance_history');
  };

  const handleBack = () => {
    setActiveReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between" id="app-root">
      <div>
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 flex items-start space-x-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm" id="global-error-toast">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Audit Pipeline Interrupted</p>
                <p className="text-rose-400/90 text-xs leading-relaxed">{error}</p>
                {error.includes('GEMINI_API_KEY') && (
                  <p className="text-slate-400 text-xs mt-2">
                    Please provide your API key via the <strong>Settings &gt; Secrets</strong> panel in the Google AI Studio UI to run custom scans. 
                    Alternatively, click one of our high-fidelity <strong>Sample Labels</strong> below to test the full compliance flow instantly!
                  </p>
                )}
                {(error.toLowerCase().includes('503') || error.toLowerCase().includes('unavailable') || error.toLowerCase().includes('demand')) && (
                  <p className="text-slate-400 text-xs mt-2">
                    The Gemini Live AI service is currently experiencing extremely high demand. Please wait a moment and try again. 
                    Alternatively, click one of our high-fidelity <strong>Sample Labels</strong> below to test the full compliance flow instantly!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeReport ? (
            <ReportView report={activeReport} onBack={handleBack} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="home-dashboard-grid">
              {/* Left 2 columns: Intro & Uploader */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero card / vision section */}
                <div className="bg-gradient-to-br from-[#161616] to-[#0D0D0D] border border-white/5 rounded-2xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden" id="hero-banner">
                  <div className="absolute right-0 bottom-0 top-0 opacity-5 pointer-events-none select-none">
                    <Search className="h-96 w-96 text-white" />
                  </div>

                  <div className="relative space-y-4 max-w-xl">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                      Vision LLM + Deterministic Logic
                    </span>
                    <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight">
                      FSSAI Food Compliance Scanner
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                      Verify packaged food labels against official Indian FSSAI labelling regulations.
                      Our hybrid scanner splits responsibilities: Vision models extract ingredients and claims, while an immutable rule engine decides compliance deterministically.
                    </p>

                    {/* Architecture tagline */}
                    <div className="flex flex-wrap gap-4 pt-2 font-mono text-[10px] sm:text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>LLMs extract</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Rules decide</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>AI explains</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Uploader and Sample trigger panel */}
                <Uploader 
                  onAnalyzeStart={handleAnalyzeStart}
                  onAnalyzeComplete={handleAnalyzeComplete}
                  onAnalyzeError={handleAnalyzeError}
                />
              </div>

              {/* Right 1 column: history and about */}
              <div className="space-y-8">
                {/* Scan History Log */}
                <HistoryLog 
                  history={history}
                  onSelectReport={handleSelectReport}
                  onClearHistory={handleClearHistory}
                  onDeleteReport={handleDeleteReport}
                />

                {/* Helpful resources or about cards */}
                <div className="bg-[#161616] border border-white/5 rounded-2xl shadow-sm p-6 space-y-4" id="about-card">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-white">About FSSAI Food Guidelines</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Primary regulatory requirements in India</p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 font-sans" id="guidelines-list">
                    <div className="flex items-start space-x-2.5">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                      <p>
                        <strong>FSSAI 14-Digit Format:</strong> The license number must contain exactly 14 digits and have the official FSSAI symbol on the box.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                      <p>
                        <strong>Added Sugars & Sodium:</strong> FSSAI mandates separate declarations of Added Sugars and Sodium to prevent dietary risk factors.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                      <p>
                        <strong>Misleading Claims:</strong> Comparative or absolute statements like "100% natural" or "disease curer" are strictly regulated and penalizable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[#0A0A0A] border-t border-white/10 py-6" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 font-sans">
          FSSAI Food Compliance Scanner &bull; India Regulations &copy; {new Date().getFullYear()} &bull; Built in Compliance with Food Safety and Standards Regulations.
        </div>
      </footer>
    </div>
  );
}
