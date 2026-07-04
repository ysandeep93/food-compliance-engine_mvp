/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, FileCode, CheckCircle, Flame, Eye, ShieldAlert, Sparkles, 
  AlertCircle, Trash2, Plus, ArrowRight
} from 'lucide-react';
import { SAMPLE_COMPLIANCE_REPORTS } from '../utils/sampleProducts';
import { ComplianceReport } from '../types';

interface UploaderProps {
  onAnalyzeStart: (provider: 'gemini' | 'mock') => void;
  onAnalyzeComplete: (report: ComplianceReport) => void;
  onAnalyzeError: (error: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
  labelType: 'front' | 'side' | 'back' | 'other';
}

export default function Uploader({ onAnalyzeStart, onAnalyzeComplete, onAnalyzeError }: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const provider = 'gemini';
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [customError, setCustomError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'OCR Image Scan - Extracting text via Vision AI across all label sides...',
    'Extracting consolidated nutritional tables & ingredient lists...',
    'Normalizing views to unified Canonical Product Model...',
    'Running 32 FSSAI Deterministic Compliance Rules...',
    'Running AI RAG Semantic Claims analysis...',
    'Finalizing FSSAI Compliance Audit report...'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = (files: FileList) => {
    setCustomError(null);
    const newFilesList = Array.from(files);

    newFilesList.forEach((file) => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setCustomError('Unsupported file type found. Please upload packaged food label images (PNG/JPG) or PDFs.');
        return;
      }

      const reader = new FileReader();
      const id = 'file-' + Math.random().toString(36).substring(2, 9);

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          const previewUrl = reader.result;

          setUploadedFiles((prev) => {
            // Pick a reasonable initial tag based on current length
            let labelType: 'front' | 'side' | 'back' | 'other' = 'front';
            if (prev.length === 1) labelType = 'back';
            else if (prev.length === 2) labelType = 'side';
            else if (prev.length > 2) labelType = 'other';

            return [
              ...prev,
              {
                id,
                name: file.name,
                base64: base64Data,
                mimeType: file.type || 'image/jpeg',
                previewUrl,
                labelType
              }
            ];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter(f => f.id !== id));
  };

  const setFileType = (id: string, type: 'front' | 'side' | 'back' | 'other') => {
    setUploadedFiles((prev) => prev.map(f => f.id === id ? { ...f, labelType: type } : f));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const runAudit = async (isSample: boolean = false, sampleId?: string) => {
    onAnalyzeStart(provider);
    setIsUploading(true);
    setStepIndex(0);

    // Stagger loading step messages beautifully
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    try {
      if (isSample && sampleId) {
        // Run audit on preloaded high-fidelity FSSAI sample product
        const report = SAMPLE_COMPLIANCE_REPORTS.find(r => r.id === sampleId);
        // Add tiny delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 8000));
        clearInterval(interval);
        if (report) {
          onAnalyzeComplete(report);
        } else {
          throw new Error('Sample report not found');
        }
      } else {
        if (uploadedFiles.length === 0) {
          throw new Error('Please upload at least one food label image side.');
        }

        // Call the server-side API endpoint with the multi-image payload
        const response = await fetch('/api/analyze-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: uploadedFiles.map(f => ({
              base64: f.base64,
              mimeType: f.mimeType,
              name: f.name
            })),
            provider: provider
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Server returned an error during multi-image analysis.');
        }

        const report = await response.json();
        clearInterval(interval);
        onAnalyzeComplete(report);
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setStepIndex(-1);
      onAnalyzeError(err.message || 'Verification failed.');
    } finally {
      setIsUploading(false);
      setStepIndex(-1);
    }
  };

  return (
    <div className="space-y-8" id="uploader-container">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#161616] rounded-2xl border border-white/5 shadow-lg px-6" id="processing-screen">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute h-24 w-24 rounded-full border-4 border-white/5 border-t-emerald-500 animate-spin" />
            <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse" />
          </div>
          
          <h3 className="font-sans text-xl font-bold text-white mb-2">
            Audit in Progress...
          </h3>
          <p className="font-sans text-sm text-slate-400 max-w-md mb-8">
            Please wait while the multi-stage, multi-image FSSAI extraction and rule verification pipelines execute.
          </p>

          <div className="w-full max-w-md bg-white/5 rounded-full h-2.5 mb-6 overflow-hidden border border-white/5">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2 text-left max-w-md mx-auto" id="loading-steps">
            {loadingSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`flex items-center space-x-3 text-sm transition-opacity duration-300 ${
                  idx === stepIndex 
                    ? 'text-emerald-400 font-medium' 
                    : idx < stepIndex 
                      ? 'text-slate-500 font-normal line-through' 
                      : 'text-slate-600 font-normal'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${
                  idx === stepIndex 
                    ? 'bg-emerald-500 animate-ping' 
                    : idx < stepIndex 
                      ? 'bg-slate-500' 
                      : 'bg-white/10'
                }`} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Main Uploader card */}
          <div className="bg-[#161616] rounded-2xl border border-white/5 shadow-sm p-6" id="upload-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-lg font-bold text-white">Upload Food Label</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Combine multiple photos (Front, Side, Back cover) to perform a unified compliance check.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />

            {/* Standard Drop zone if empty */}
            {uploadedFiles.length === 0 ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]' 
                    : 'border-white/10 hover:border-white/20 bg-white/2'
                }`}
                id="drag-drop-zone"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-300 mb-4 border border-white/5">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>

                <div>
                  <p className="font-sans text-sm font-semibold text-slate-300 mb-1">
                    Drag and drop your food label image(s) here
                  </p>
                  <p className="text-xs text-slate-500 font-sans mb-3">
                    Supports selecting multiple images at once (Front, Back, or Side label views)
                  </p>
                  <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span>Browse files</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ) : (
              /* High-fidelity Multi-image Layout Grid */
              <div className="space-y-6" id="multi-file-display">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="uploaded-images-grid">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="group relative bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all"
                    >
                      {/* Delete File Trigger */}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-white/5 transition-all z-10 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Preview Square */}
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/40 flex items-center justify-center border border-white/5 relative mb-3">
                        <img 
                          src={file.previewUrl} 
                          alt={file.name} 
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* File details & Tagging */}
                      <div className="space-y-3">
                        <div>
                          <p className="font-mono text-xs font-semibold text-slate-200 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {(file.base64.length * 0.75 / 1024).toFixed(1)} KB &bull; {file.mimeType.split('/')[1].toUpperCase()}
                          </p>
                        </div>

                        {/* Package Side Tag Pill Group */}
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold font-mono">Label Side / View</p>
                          <div className="grid grid-cols-4 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[9px] font-mono">
                            {(['front', 'side', 'back', 'other'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFileType(file.id, type)}
                                className={`py-1 rounded text-center capitalize transition-all cursor-pointer font-bold ${
                                  file.labelType === type 
                                    ? 'bg-emerald-500 text-black' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Dash Box to upload another image */}
                  <div 
                    onClick={triggerFileSelect}
                    className="border-2 border-dashed border-white/5 hover:border-white/10 bg-white/1 hover:bg-white/2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] transition-all"
                  >
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-3 text-slate-400 group-hover:text-slate-200">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="font-sans text-xs font-semibold text-slate-300">Add Package Side / Page</p>
                    <p className="text-[10px] text-slate-500 mt-1">Front/Side ingredients/back covers</p>
                  </div>
                </div>

                {/* Helpful multi-file summary box */}
                <div className="flex items-start space-x-2.5 text-xs text-slate-400 bg-white/2 border border-white/5 rounded-xl p-3">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    You have selected <strong>{uploadedFiles.length} label view{uploadedFiles.length > 1 ? 's' : ''}</strong>. 
                    Gemini Live AI will evaluate all of them jointly to extract nutritional tables, ingredients lists, and legal claims.
                  </span>
                </div>
              </div>
            )}

            {customError && (
              <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mt-4 text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{customError}</span>
              </div>
            )}

            {/* Run verification button */}
            {uploadedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => runAudit()}
                className="w-full mt-6 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer font-sans"
                id="submit-audit-btn"
              >
                <Sparkles className="h-4 w-4" />
                <span>Execute Unified FSSAI Label Audit</span>
              </button>
            )}
          </div>

          {/* Interactive high-fidelity preloaded sample catalogs */}
          <div className="space-y-4" id="samples-panel">
            <div>
              <h3 className="font-sans text-sm font-semibold text-white">
                Or Test with High-Fidelity FSSAI Sample Labels
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Instantly trigger a detailed audit check on standard Indian food products with realistic compliance flags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="sample-products-grid">
              {/* Maggi */}
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                      High Sodium &bull; Claims
                    </span>
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  </div>
                  <h4 className="font-sans text-sm font-bold text-white">Maggi 2-Min Noodles</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Classic wheat noodles with tastemaker. Triggers critical sodium alerts, missing MSG warnings, and unsubstantiated absolute claims.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runAudit(true, 'sample-maggi')}
                  className="mt-4 w-full bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Audit Sample</span>
                </button>
              </div>

              {/* Tropicana */}
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      High Compliance
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h4 className="font-sans text-sm font-bold text-white">Tropicana 100% Juice</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Pure fruit concentrates without added cane sugar. Displays high FSSAI scoring, compliant nutritional labelling, and compliant clean claim certifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runAudit(true, 'sample-tropicana')}
                  className="mt-4 w-full bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Audit Sample</span>
                </button>
              </div>

              {/* Oreo */}
              <div className="bg-[#161616] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-500/20">
                      HFSS Warning &bull; Storage
                    </span>
                    <Flame className="h-4 w-4 text-rose-400" />
                  </div>
                  <h4 className="font-sans text-sm font-bold text-white">Oreo Cookies</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Chocolate sandwich cream cookies. Triggers mandatory high sugar warnings, missing storage instructions, and questionable wellness marketing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runAudit(true, 'sample-oreo')}
                  className="mt-4 w-full bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Audit Sample</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
