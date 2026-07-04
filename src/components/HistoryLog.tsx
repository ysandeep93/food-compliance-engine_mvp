/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Trash2, ShieldCheck, ChevronRight, History, Check, X } from 'lucide-react';
import { ComplianceReport } from '../types';

interface HistoryLogProps {
  history: ComplianceReport[];
  onSelectReport: (report: ComplianceReport) => void;
  onClearHistory: () => void;
  onDeleteReport: (id: string) => void;
}

export default function HistoryLog({ history, onSelectReport, onClearHistory, onDeleteReport }: HistoryLogProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (history.length === 0) {
    return (
      <div className="bg-[#161616] border border-white/5 rounded-2xl p-8 text-center" id="history-empty-state">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500 mx-auto mb-4 border border-white/5">
          <History className="h-6 w-6" />
        </div>
        <h3 className="font-sans text-sm font-bold text-white">No Previous Scans</h3>
        <p className="text-xs text-slate-500 font-sans mt-1 max-w-sm mx-auto">
          Packaged food label compliance scans you perform will be saved here in your browser for quick audit retrievals.
        </p>
      </div>
    );
  }

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setShowConfirm(false);
  };

  const handleCancelClear = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl shadow-xs p-6 space-y-4" id="history-log-panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-sans text-sm font-bold text-white flex items-center space-x-1.5">
            <History className="h-4 w-4 text-emerald-500" />
            <span>Scan History Log</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-sans">Stored offline in browser local state</p>
        </div>

        {showConfirm ? (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg animate-fadeIn">
            <span className="text-[10px] text-rose-400 font-mono font-bold">Clear all?</span>
            <button
              type="button"
              onClick={handleConfirmClear}
              className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-black transition-colors cursor-pointer"
              title="Yes, clear all"
            >
              <Check className="h-3 w-3 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={handleCancelClear}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="h-3 w-3 stroke-[3]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClearClick}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
            id="clear-all-history"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1 space-y-2" id="history-items-list">
        {history.map((report) => {
          const scoreColor = report.overallScore >= 80 
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
            : report.overallScore >= 60 
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

          return (
            <div 
              key={report.id}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
              onClick={() => onSelectReport(report)}
            >
              <div className="flex items-center space-x-3">
                {/* Score badge */}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-sans font-extrabold text-sm border ${scoreColor}`}>
                  {report.overallScore}
                </div>

                <div>
                  <h4 className="font-sans text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                    {report.productName}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-sans mt-0.5">
                    <span className="font-medium text-slate-400">{report.brandName || 'Domestic'}</span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{new Date(report.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReport(report.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                  title="Delete scan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
