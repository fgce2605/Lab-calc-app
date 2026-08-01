import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateAcidValue, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Keypad } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const AcidValueCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [vKoh, setVKoh] = useState<number>(0.35);
  const [normality, setNormality] = useState<number>(0.100);
  const [weight, setWeight] = useState<number>(5.120);
  const [notes, setNotes] = useState<string>('');

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  const specMin = activeSpec?.specs?.acid_value?.min ?? 0;
  const specMax = activeSpec?.specs?.acid_value?.max ?? 1.0;

  const calcResult = calculateAcidValue(vKoh, normality, weight);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'acid_value',
      calcName: 'Acid Value (AV)',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { vKoh, normality, weight },
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
          <div className="flex items-center gap-2 text-amber-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Acid Value (mg KOH/g)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures residual free carboxylic acidity in resins and polyols using KOH titrant.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-amber-300">
          Acid Value = (V × N × 56.1) / W
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            TITRATION INPUTS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* V KOH */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">mL KOH Titrant Used (V)</label>
                <button
                  onClick={() => setKeypadField({ name: 'vKoh', title: 'Volume KOH', unit: 'mL', val: vKoh })}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.05"
                value={vKoh}
                onChange={(e) => setVKoh(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Normality N */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">KOH Normality (N)</label>
                <div className="flex gap-1">
                  <button onClick={() => setNormality(0.1)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.100</button>
                  <button onClick={() => setNormality(0.05)} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">0.050</button>
                </div>
              </div>
              <input
                type="number"
                step="0.001"
                value={normality}
                onChange={(e) => setNormality(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-hidden"
              />
            </div>

            {/* Weight W */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Sample Weight W (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weight', title: 'Sample Weight', unit: 'g', val: weight })}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
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
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Test Observations</label>
            <input
              type="text"
              placeholder="e.g., Phenolphthalein indicator, light pink endpoint stable for 30s"
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
            max={specMax ? Math.max(specMax * 2.5, 5.0) : 10}
            unit="mg KOH/g"
            title="ACID VALUE RESULT"
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
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log Acid Value to Active Batch
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
            if (keypadField.name === 'vKoh') setVKoh(val);
            if (keypadField.name === 'weight') setWeight(val);
          }}
        />
      )}
    </div>
  );
};
