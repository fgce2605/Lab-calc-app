import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateHydroxylValue, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Hash } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const HydroxylValueCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [vBlank, setVBlank] = useState<number>(25.0);
  const [vSample, setVSample] = useState<number>(15.2);
  const [normality, setNormality] = useState<number>(0.500);
  const [weight, setWeight] = useState<number>(4.800);
  const [acidValueInput, setAcidValueInput] = useState<number>(0.38);
  const [notes, setNotes] = useState<string>('');

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  // Auto import acid value from batch if logged!
  React.useEffect(() => {
    if (activeBatch && activeBatch.testResults) {
      const avTest = activeBatch.testResults.find((t) => t.calcType === 'acid_value');
      if (avTest) {
        setAcidValueInput(avTest.resultValue);
      }
    }
  }, [activeBatch]);

  const specMin = activeSpec?.specs?.hydroxyl?.min ?? 50;
  const specMax = activeSpec?.specs?.hydroxyl?.max ?? 180;

  const calcResult = calculateHydroxylValue(vBlank, vSample, normality, weight, acidValueInput);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'hydroxyl',
      calcName: 'Hydroxyl Value (OH Value)',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { vBlank, vSample, normality, weight, acidValue: acidValueInput },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Hydroxyl Value (OH Value)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Phthalic anhydride / acetic anhydride acetylation of polyol reactive -OH groups.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-violet-300">
          OH Value = [(V_blank − V_sample) × N × 56.1 / W] + Acid Value
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            ACETYLATION TITRATION DATA
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* V_blank */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">V_blank (mL KOH)</label>
                <button
                  onClick={() => setKeypadField({ name: 'vBlank', title: 'V_blank', unit: 'mL', val: vBlank })}
                  className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={vBlank}
                onChange={(e) => setVBlank(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-violet-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* V_sample */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">V_sample (mL KOH)</label>
                <button
                  onClick={() => setKeypadField({ name: 'vSample', title: 'V_sample', unit: 'mL', val: vSample })}
                  className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={vSample}
                onChange={(e) => setVSample(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-violet-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Normality */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">KOH Normality (N)</label>
                <div className="flex gap-1">
                  <button onClick={() => setNormality(0.5)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.500</button>
                  <button onClick={() => setNormality(0.1)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.100</button>
                </div>
              </div>
              <input
                type="number"
                step="0.01"
                value={normality}
                onChange={(e) => setNormality(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-hidden"
              />
            </div>

            {/* Sample Weight */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Sample Weight W (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weight', title: 'Sample Weight', unit: 'g', val: weight })}
                  className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Acid Value Correction */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Acid Value Correction (mg KOH/g)</label>
                {activeBatch?.testResults?.some((t) => t.calcType === 'acid_value') && (
                  <span className="text-[10px] text-emerald-400 font-mono">Synced from Active Batch</span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                value={acidValueInput}
                onChange={(e) => setAcidValueInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-violet-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Pyridine / Catalyst Reagent Batch</label>
            <input
              type="text"
              placeholder="e.g., Phthalic anhydride in pyridine 115g/L, reflux 1 hour @ 115°C"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <GaugeMeter
            value={calcResult.result}
            formattedValue={calcResult.formatted}
            min={0}
            max={specMax ? Math.max(specMax * 1.8, 100) : 300}
            unit="mg KOH/g"
            title="HYDROXYL VALUE RESULT"
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
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log OH Value to Active Batch
            </button>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center">
              No active batch selected.
            </div>
          )}
        </div>
      </div>

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
