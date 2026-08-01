import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateNCO, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const NCOCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [vBlank, setVBlank] = useState<number>(25.0);
  const [vSample, setVSample] = useState<number>(22.4);
  const [normality, setNormality] = useState<number>(0.100);
  const [weight, setWeight] = useState<number>(2.050);
  const [notes, setNotes] = useState<string>('');

  // Keypad Modal state
  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  // Active spec limits for NCO%
  const specMin = activeSpec?.specs?.nco?.min ?? 0;
  const specMax = activeSpec?.specs?.nco?.max ?? 0.2;

  const calcResult = calculateNCO(vBlank, vSample, normality, weight);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'nco',
      calcName: 'Isocyanate Content (NCO%)',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { vBlank, vSample, normality, weight },
      resultValue: calcResult.result,
      resultFormatted: calcResult.formatted,
      unit: calcResult.unit,
      specMin,
      specMax,
      isPass,
      notes: notes || undefined,
    });

    if (onResultSaved) onResultSaved();
  };

  return (
    <div className="space-y-6">
      {/* Title & Formula Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            NCO% (Isocyanate Content)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard HCl Back-Titration of free -NCO groups in polyurethane prepolymers.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300">
          NCO% = [(V_blank − V_sample) × N × 4.202] / W
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            TITRATION PARAMETERS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* V_blank */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">V_blank (mL HCl)</label>
                <button
                  onClick={() => setKeypadField({ name: 'vBlank', title: 'V_blank (Blank Volume)', unit: 'mL', val: vBlank })}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={vBlank}
                onChange={(e) => setVBlank(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-semibold focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* V_sample */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">V_sample (mL HCl)</label>
                <button
                  onClick={() => setKeypadField({ name: 'vSample', title: 'V_sample (Sample Volume)', unit: 'mL', val: vSample })}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={vSample}
                onChange={(e) => setVSample(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-semibold focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Normality N */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">HCl Normality (N)</label>
                <div className="flex gap-1">
                  <button onClick={() => setNormality(0.1)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.100</button>
                  <button onClick={() => setNormality(0.5)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.500</button>
                </div>
              </div>
              <input
                type="number"
                step="0.001"
                value={normality}
                onChange={(e) => setNormality(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-semibold focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Weight W */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Sample Weight W (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weight', title: 'Sample Weight (W)', unit: 'g', val: weight })}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-semibold focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-mono">QUICK LAB PRESETS:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <button
                onClick={() => { setVBlank(25.0); setVSample(22.4); setNormality(0.1); setWeight(2.05); }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-200"
              >
                Standard Prepolymer (2.0g)
              </button>
              <button
                onClick={() => { setVBlank(25.0); setVSample(18.2); setNormality(0.1); setWeight(1.02); }}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-200"
              >
                High NCO Monomer (1.0g)
              </button>
            </div>
          </div>

          {/* Operator Notes */}
          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Test Observations / Notes</label>
            <input
              type="text"
              placeholder="e.g., Colorless liquid, sharp bromophenol blue endpoint"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Gauge & Actions Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <GaugeMeter
            value={calcResult.result}
            formattedValue={calcResult.formatted}
            min={0}
            max={specMax ? Math.max(specMax * 2, 1.0) : 10}
            unit="% NCO"
            title="NCO CONTENT RESULT"
            specMin={specMin}
            specMax={specMax}
            isPass={calcResult.isValid ? isPass : undefined}
          />

          {!calcResult.isValid && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{calcResult.errorMessage}</span>
            </div>
          )}

          {activeBatch ? (
            <button
              onClick={handleSaveToBatch}
              disabled={!calcResult.isValid}
              className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                calcResult.isValid
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log NCO% to Active Batch ({activeBatch.id})
            </button>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center">
              No active batch selected. Select or create a batch in the Batch Manager to log tests.
            </div>
          )}
        </div>
      </div>

      {/* Keypad Modal */}
      {keypadField && (
        <NumericKeypadModal
          isOpen={true}
          onClose={() => setKeypadField(null)}
          title={keypadField.title}
          unit={keypadField.unit}
          initialValue={String(keypadField.val)}
          onConfirm={(val) => {
            if (keypadField.name === 'vBlank') setVBlank(val);
            if (keypadField.name === 'vSample') setVSample(val);
            if (keypadField.name === 'weight') setWeight(val);
          }}
        />
      )}
    </div>
  );
};
