import React, { useState } from 'react';
import { Batch } from '../types';
import { exportBatchesCSV, exportDataJSON, getBatches, importDataJSON } from '../utils/storage';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  PieChart,
  Layers,
  Database,
} from 'lucide-react';

interface Props {
  batches: Batch[];
  onDataImported?: () => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({ batches, onDataImported }) => {
  const [importStatus, setImportStatus] = useState<string>('');

  // Calculate high level metrics
  const totalBatches = batches.length;
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;

  const testTypeCounts: Record<string, number> = {};

  batches.forEach((b) => {
    if (b.testResults) {
      b.testResults.forEach((t) => {
        totalTests++;
        if (t.isPass) passCount++;
        else failCount++;

        testTypeCounts[t.calcName] = (testTypeCounts[t.calcName] || 0) + 1;
      });
    }
  });

  const passRate = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 100;

  const handleExportCSV = () => {
    const csvContent = exportBatchesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LabCalc_QC_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LabCalc_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && importDataJSON(content)) {
          setImportStatus('Backup restored successfully!');
          if (onDataImported) onDataImported();
        } else {
          setImportStatus('Failed to import backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Quality Assurance Analytics & Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical process control, pass/fail ratios, and data export.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" /> Backup JSON
          </button>
          <label className="cursor-pointer py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs rounded-xl flex items-center justify-between">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              CONFORMITY PASS RATE
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {passRate}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {passCount} passed / {failCount} failed
            </span>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Batches */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              TOTAL BATCH RUNS
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {totalBatches}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Across all resin grades
            </span>
          </div>
          <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tests Logged */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              TESTS PERFORMED
            </span>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
              {totalTests}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Calculations logged
            </span>
          </div>
          <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Out of spec alerts */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              OUT-OF-SPEC REJECTIONS
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {failCount}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Action required
            </span>
          </div>
          <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          Test Volume Distribution by Calculator Parameter
        </h3>

        <div className="space-y-3">
          {Object.entries(testTypeCounts).length > 0 ? (
            Object.entries(testTypeCounts).map(([calcName, count]) => {
              const pct = Math.round((count / Math.max(totalTests, 1)) * 100);
              return (
                <div key={calcName} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-200">{calcName}</span>
                    <span className="text-cyan-400 font-bold">{count} tests ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No test distribution data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
