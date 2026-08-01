import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateNVM, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Keypad } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const NVMCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [w1Dish, setW1Dish] = useState<number>(12.450);
  const [w2Dried, setW2Dried] = useState<number>(14.420);
  const [w3Wet, setW3Wet] = useState<number>(14.430);
  const [notes, setNotes] = useState<string>('');

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  const specMin = activeSpec?.specs?.nvm?.min ?? 60.0;
  const specMax = activeSpec?.specs?.nvm?.max ?? 80.0;

  const calcResult = calculateNVM(w1Dish, w2Dried, w3Wet);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'nvm',
      calcName: 'Non-Volatile Matter (NVM%)',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { w1Dish, w2Dried, w3Wet },
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
          <div className="flex items-center gap-2 text-emerald-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Non-Volatile Matter (NVM% / Solids)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gravimetric oven drying method (ASTM D1259 / ISO 3251) for resin solid content.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300">
          NVM% = (W2 − W1) / (W3 − W1) × 100
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            GRAVIMETRIC WEIGHINGS (ALUMINUM DISH)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* W1 Dish */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">W1: Empty Dish (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'w1Dish', title: 'W1: Empty Dish Weight', unit: 'g', val: w1Dish })}
                  className="text-[10px] text-emerald-400 hover:underline font-mono"
                >
                  Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={w1Dish}
                onChange={(e) => setW1Dish(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* W3 Wet Sample + Dish */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">W3: Dish + Wet (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'w3Wet', title: 'W3: Dish + Wet Sample Weight', unit: 'g', val: w3Wet })}
                  className="text-[10px] text-emerald-400 hover:underline font-mono"
                >
                  Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={w3Wet}
                onChange={(e) => setW3Wet(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* W2 Dried Sample + Dish */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">W2: Dish + Dried (g)</label>
                <button
                  onClick={() => setKeypadField({ name: 'w2Dried', title: 'W2: Dish + Dried Residue Weight', unit: 'g', val: w2Dried })}
                  className="text-[10px] text-emerald-400 hover:underline font-mono"
                >
                  Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.001"
                value={w2Dried}
                onChange={(e) => setW2Dried(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Initial Wet Sample Weight (W3 - W1):</span>
              <strong className="text-amber-400">{(w3Wet - w1Dish).toFixed(3)} g</strong>
            </div>
            <div className="flex justify-between">
              <span>Dry Solid Residue Weight (W2 - W1):</span>
              <strong className="text-emerald-400">{(w2Dried - w1Dish).toFixed(3)} g</strong>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Oven Cycle Conditions</label>
            <input
              type="text"
              placeholder="e.g., Forced air oven @ 125°C for 60 minutes"
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
            max={100}
            unit="% Solids"
            title="SOLID CONTENT (NVM)"
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
              Log NVM% to Active Batch
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
            if (keypadField.name === 'w1Dish') setW1Dish(val);
            if (keypadField.name === 'w2Dried') setW2Dried(val);
            if (keypadField.name === 'w3Wet') setW3Wet(val);
          }}
        />
      )}
    </div>
  );
};
