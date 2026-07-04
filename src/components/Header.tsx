/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Info } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0A0A0A]" id="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-lg shadow-emerald-500/10 font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-sans text-xl font-bold tracking-tight text-white">
                FSSAI Compliance Scanner
              </h1>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 font-mono">
                REGULATORY ENGINE V2.4.1
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans uppercase tracking-wider">
              AI-Powered Extraction &bull; Deterministic Rule Engine
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Info className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-mono text-slate-400">FSSAI Ch. II Section 2.2 compliant checks</span>
          </div>
        </div>
      </div>
    </header>
  );
}
