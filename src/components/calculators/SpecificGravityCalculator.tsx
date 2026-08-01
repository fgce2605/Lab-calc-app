import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateSpecificGravity, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Hash } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const SpecificGravityCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [weightSample, setWeightSample] = useState<number>(58.240);
  const [weightWater, setWeightWater] = useState<number>(50.000);
  const [notes, setNotes] = useState<string>('');

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  const specMin = activeSpec?.specs?.specific_gravity?.min ?? 1.05;
  const specMax = activeSpec?.specs?.specific_gravity?.max ?? 1.20;

  const calcResult = calculateSpecificGravity(weightSample, weightWater);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'specific_gravity',
      calcName: 'Specific Gravity',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { weightSample, weightWater },
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
          <div className="flex items-center gap-2 text-cyan-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Specific Gravity (Pycnometer @25°C)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Density comparison of resin mass vs equal volume of deionized water.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300">
          Sp.Gr. = Weight of Sample / Weight of Water
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            PYCNOMETER WEIGHINGS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight Sample */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Weight of Sample in Pycnometer (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weightSample', title: 'Weight of Sample', unit: 'g', val: weightSample })}
                  className="text-[10px] text-cyan-400 hover:underline font-mono"
                >
                  Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={weightSample}
                onChange={(e) => setWeightSample(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Weight Water */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Weight of Equal Water Vol (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weightWater', title: 'Weight of Equal Water Volume', unit: 'g', val: weightWater })}
                  className="text-[10px] text-cyan-400 hover:underline font-mono"
                >
                  Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={weightWater}
                onChange={(e) => setWeightWater(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Pycnometer ID & Temperature Calibration</label>
            <input
              type="text"
              placeholder="e.g., Pycnometer #P-04 calibrated with DI water @ 25.0°C"
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
            min={0.8}
            max={1.5}
            unit="Sp.Gr."
            title="SPECIFIC GRAVITY RESULT"
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
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log Specific Gravity to Active Batch
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
            if (keypadField.name === 'weightSample') setWeightSample(val);
            if (keypadField.name === 'weightWater') setWeightWater(val);
          }}
        />
      )}
    </div>
  );
};
