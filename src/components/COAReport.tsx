import React from 'react';
import { Batch, ResinSpecification } from '../types';
import { Printer, Download, CheckCircle2, XCircle, ShieldCheck, X } from 'lucide-react';

interface Props {
  batch: Batch;
  resinSpec?: ResinSpecification;
  onClose: () => void;
}

export const COAReport: React.FC<Props> = ({ batch, resinSpec, onClose }) => {
  const isPassed = batch.status === 'passed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-6 flex justify-center items-start animate-in fade-in">
      {/* Container */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Floating Controls Bar (Hidden during printing) */}
        <div className="print:hidden bg-slate-800/90 px-6 py-3 border-b border-slate-700 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Certificate of Analysis Generator
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="py-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 active:scale-95 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable COA Document Body */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-0 print:shadow-none min-h-[900px] flex flex-col justify-between">
          {/* Document Header */}
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <div className="text-2xl font-black uppercase tracking-wider text-slate-900 font-display">
                  POLYMER QC LABORATORIES
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Resin & Synthetic Polymer Quality Assurance Division
                </div>
                <div className="text-[11px] text-slate-500">
                  ISO 9001:2015 Certified Laboratory • GLP Compliant
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 font-mono">
                  CERTIFICATE OF ANALYSIS
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1">
                  COA Ref: <strong className="text-slate-900">COA-{batch.id}</strong>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Issue Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Batch & Product Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">PRODUCT NAME</span>
                <span className="font-bold text-slate-900">{batch.sampleName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">RESIN GRADE</span>
                <span className="font-bold text-slate-900">{batch.resinGradeName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">LOT NUMBER</span>
                <span className="font-bold text-slate-900">{batch.lotNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">BATCH QUANTITY</span>
                <span className="font-bold text-slate-900">{batch.quantityKg} kg</span>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
                ANALYTICAL & PHYSICAL TEST RESULTS
              </h3>

              <table className="w-full text-left text-xs font-mono border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300">Test Parameter</th>
                    <th className="p-2.5 border-r border-slate-300">Unit</th>
                    <th className="p-2.5 border-r border-slate-300">Specification Range</th>
                    <th className="p-2.5 border-r border-slate-300">Observed Result</th>
                    <th className="p-2.5 text-center">Conformity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {batch.testResults && batch.testResults.length > 0 ? (
                    batch.testResults.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-300 font-semibold">{t.calcName}</td>
                        <td className="p-2.5 border-r border-slate-300">{t.unit}</td>
                        <td className="p-2.5 border-r border-slate-300">
                          {t.specMin ?? 0} - {t.specMax ?? '∞'}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 font-bold">{t.resultFormatted}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                              t.isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.isPass ? 'PASSED' : 'REJECTED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No laboratory tests recorded for this batch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quality Statement Box */}
            <div
              className={`p-4 rounded-lg border flex items-center justify-between ${
                isPassed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  QUALITY ASSURANCE DISPOSITION
                </span>
                <p className="text-xs mt-0.5">
                  This batch has been sampled and tested in accordance with standard GLP laboratory test methods.
                  Material <strong className="underline">{isPassed ? 'MEETS ALL SPECIFICATIONS' : 'DOES NOT CONFORM TO SPECIFICATIONS'}</strong> and is hereby <strong className="uppercase">{batch.status}</strong>.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                  isPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {batch.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer Block */}
          <div className="pt-12 border-t border-slate-300 mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-12 text-xs font-sans">
              <div>
                <div className="border-b border-slate-400 pb-1 font-semibold text-slate-800">
                  {batch.operatorName}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">QC Testing Analyst</div>
                <div className="text-[10px] text-slate-400 font-mono">Digital ID: {batch.operatorId}</div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 font-semibold text-slate-800">
                  Dr. Marcus Vance
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Quality Assurance Manager</div>
                <div className="text-[10px] text-slate-400 font-mono">Sign-off Status: Approved</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              LabCalc Pro Quality Management System • Document generated offline on {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
