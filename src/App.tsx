import React, { useState, useEffect } from 'react';
import { Batch, CalcType, ResinSpecification, UserProfile } from './types';
import { CALCULATORS } from './utils/constants';
import {
  getActiveBatchId,
  getActiveUser,
  getBatchById,
  getBatches,
  getResinGrades,
} from './utils/storage';

// Header & Components
import { Header } from './components/Header';
import { BatchManager } from './components/BatchManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SpecificationManager } from './components/SpecificationManager';
import { COAReport } from './components/COAReport';
import { CapacitorGuideModal } from './components/CapacitorGuideModal';

// 9 Calculators
import { NCOCalculator } from './components/calculators/NCOCalculator';
import { AcidValueCalculator } from './components/calculators/AcidValueCalculator';
import { KarlFischerCalculator } from './components/calculators/KarlFischerCalculator';
import { HPLCCalculator } from './components/calculators/HPLCCalculator';
import { ViscosityCalculator } from './components/calculators/ViscosityCalculator';
import { HydroxylValueCalculator } from './components/calculators/HydroxylValueCalculator';
import { NVMCalculator } from './components/calculators/NVMCalculator';
import { SpecificGravityCalculator } from './components/calculators/SpecificGravityCalculator';
import { GelTimeCalculator } from './components/calculators/GelTimeCalculator';

import {
  Calculator,
  Layers,
  TrendingUp,
  Sliders,
  FlaskConical,
  TestTube2,
  Droplets,
  BarChart2,
  Gauge,
  Binary,
  Scale,
  Compass,
  Timer,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
} from 'lucide-react';

export default function App() {
  const [activeUser, setActiveUser] = useState<UserProfile>(getActiveUser());
  const [batches, setBatches] = useState<Batch[]>(getBatches());
  const [activeBatchId, setActiveBatchId] = useState<string | null>(getActiveBatchId());
  const [resinGrades, setResinGrades] = useState<ResinSpecification[]>(getResinGrades());

  // Navigation state
  const [mainTab, setMainTab] = useState<'calculators' | 'batches' | 'analytics' | 'specifications'>('calculators');
  const [selectedCalc, setSelectedCalc] = useState<CalcType>('nco');

  // Modals
  const [coaBatch, setCoaBatch] = useState<Batch | null>(null);
  const [isCapacitorModalOpen, setIsCapacitorModalOpen] = useState<boolean>(false);

  // Sync state on load / update
  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
  const activeSpec = resinGrades.find((g) => g.id === activeBatch?.resinGradeId) || resinGrades[0];

  const refreshData = () => {
    const bList = getBatches();
    setBatches(bList);
    setResinGrades(getResinGrades());
  };

  const calcIcons: Record<CalcType, React.ReactNode> = {
    nco: <FlaskConical className="w-4 h-4" />,
    acid_value: <TestTube2 className="w-4 h-4" />,
    karl_fischer: <Droplets className="w-4 h-4" />,
    hplc: <BarChart2 className="w-4 h-4" />,
    viscosity: <Gauge className="w-4 h-4" />,
    hydroxyl: <Binary className="w-4 h-4" />,
    nvm: <Scale className="w-4 h-4" />,
    specific_gravity: <Compass className="w-4 h-4" />,
    gel_time: <Timer className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans bg-lab-grid selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header & Role Bar */}
      <Header
        activeUser={activeUser}
        onUserChanged={(u) => setActiveUser(u)}
        onOpenCapacitorGuide={() => setIsCapacitorModalOpen(true)}
        activeBatchId={activeBatch?.id}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Active Batch & Spec Context Strip */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/80 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ACTIVE BATCH:</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {activeBatch ? activeBatch.id : 'None Selected'}
                </span>
                {activeBatch && (
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      activeBatch.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : activeBatch.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeBatch.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium">
                {activeBatch ? activeBatch.sampleName : 'Select batch in Batch Manager'} • Grade:{' '}
                <strong className="text-amber-400">{activeSpec?.gradeName || 'Standard'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainTab('batches')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              Change Batch
            </button>
            {activeBatch && (
              <button
                onClick={() => setCoaBatch(activeBatch)}
                className="py-1.5 px-3 bg-teal-950/80 hover:bg-teal-900 text-teal-300 rounded-lg text-xs font-bold border border-teal-500/40 flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" /> COA Report
              </button>
            )}
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setMainTab('calculators')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
              mainTab === 'calculators'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" /> 9 QC Calculators
          </button>

          <button
            onClick={() => setMainTab('batches')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
              mainTab === 'batches'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Batch Context Manager ({batches.length})
          </button>

          <button
            onClick={() => setMainTab('analytics')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
              mainTab === 'analytics'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Analytics & Trends
          </button>

          <button
            onClick={() => setMainTab('specifications')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
              mainTab === 'specifications'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" /> Product Specs
          </button>
        </div>

        {/* Tab 1: Calculators View */}
        {mainTab === 'calculators' && (
          <div className="space-y-6">
            {/* 9 Calculator Sub-Tab Selector Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {CALCULATORS.map((calc) => {
                const isSelected = selectedCalc === calc.id;
                return (
                  <button
                    key={calc.id}
                    onClick={() => setSelectedCalc(calc.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                        {calcIcons[calc.id]}
                      </span>
                      <span className="text-[10px] font-mono font-semibold opacity-70">
                        {calc.unit}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold font-display line-clamp-1 leading-tight">
                      {calc.shortName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Calculator Component Rendering */}
            <div className="beveled-panel p-6 rounded-2xl">
              {selectedCalc === 'nco' && (
                <NCOCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'acid_value' && (
                <AcidValueCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'karl_fischer' && (
                <KarlFischerCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'hplc' && (
                <HPLCCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'viscosity' && (
                <ViscosityCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'hydroxyl' && (
                <HydroxylValueCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'nvm' && (
                <NVMCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'specific_gravity' && (
                <SpecificGravityCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
              {selectedCalc === 'gel_time' && (
                <GelTimeCalculator
                  activeBatch={activeBatch}
                  activeSpec={activeSpec}
                  onResultSaved={refreshData}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Batch Context Manager View */}
        {mainTab === 'batches' && (
          <BatchManager
            activeBatch={activeBatch}
            onBatchChange={(b) => {
              setActiveBatchId(b.id);
              refreshData();
            }}
            onOpenCOA={(b) => setCoaBatch(b)}
          />
        )}

        {/* Tab 3: Analytics Dashboard View */}
        {mainTab === 'analytics' && (
          <AnalyticsDashboard batches={batches} onDataImported={refreshData} />
        )}

        {/* Tab 4: Product Specifications View */}
        {mainTab === 'specifications' && <SpecificationManager />}
      </main>

      {/* COA Report Modal */}
      {coaBatch && (
        <COAReport
          batch={coaBatch}
          resinSpec={resinGrades.find((g) => g.id === coaBatch.resinGradeId)}
          onClose={() => setCoaBatch(null)}
        />
      )}

      {/* Capacitor Mobile APK Guide Modal */}
      <CapacitorGuideModal
        isOpen={isCapacitorModalOpen}
        onClose={() => setIsCapacitorModalOpen(false)}
      />
    </div>
  );
}
