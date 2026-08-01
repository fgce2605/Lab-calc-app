import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateHPLC, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Keypad } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const HPLCCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [areaSample, setAreaSample] = useState<number>(1245000);
  const [areaStandard, setAreaStandard] = useState<number>(1250000);
  const [weightStandard, setWeightStandard] = useState<number>(100.2);
  const [weightSample, setWeightSample] = useState<number>(100.5);
  const [purityStandard, setPurityStandard] = useState<number>(99.8);
  const [notes, setNotes] = useState<string>('');

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  const specMin = activeSpec?.specs?.hplc?.min ?? 98.0;
  const specMax = activeSpec?.specs?.hplc?.max ?? 100.0;

  const calcResult = calculateHPLC(areaSample, areaStandard, weightStandard, weightSample, purityStandard);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'hplc',
      calcName: 'HPLC Purity / Content',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { areaSample, areaStandard, weightStandard, weightSample, purityStandard },
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
          <div className="flex items-center gap-2 text-indigo-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            HPLC Purity / Active Content (%)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantification of active resin monomers or additives against certified reference standard.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
          Content% = (Area_s / Area_std) × (W_std / W_s) × Purity_std × 100
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            CHROMATOGRAPHY & BALANCE DATA
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Area Sample */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Sample Peak Area (mAU*s)</label>
                <button
                  onClick={() => setKeypadField({ name: 'areaSample', title: 'Sample Peak Area', unit: 'mAU*s', val: areaSample })}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                value={areaSample}
                onChange={(e) => setAreaSample(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-indigo-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Area Standard */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Standard Peak Area (mAU*s)</label>
                <button
                  onClick={() => setKeypadField({ name: 'areaStandard', title: 'Standard Peak Area', unit: 'mAU*s', val: areaStandard })}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                value={areaStandard}
                onChange={(e) => setAreaStandard(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
              />
            </div>

            {/* Weight Standard */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Standard Weight W_std (mg)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weightStandard', title: 'Standard Weight', unit: 'mg', val: weightStandard })}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={weightStandard}
                onChange={(e) => setWeightStandard(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-hidden"
              />
            </div>

            {/* Weight Sample */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Sample Weight W_s (mg)</label>
                <button
                  onClick={() => setKeypadField({ name: 'weightSample', title: 'Sample Weight', unit: 'mg', val: weightSample })}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={weightSample}
                onChange={(e) => setWeightSample(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-hidden"
              />
            </div>

            {/* Purity Standard */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Reference Standard Purity (%)</label>
                <button
                  onClick={() => setKeypadField({ name: 'purityStandard', title: 'Standard Purity', unit: '%', val: purityStandard })}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Keypad className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.1"
                value={purityStandard}
                onChange={(e) => setPurityStandard(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-indigo-300 font-mono font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Column & Mobile Phase Details</label>
            <input
              type="text"
              placeholder="e.g., C18 250mm, Acetonitrile/Water 70:30, 1.0 mL/min"
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
            min={80}
            max={102}
            unit="% Content"
            title="HPLC PURITY RESULT"
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
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log HPLC Purity to Active Batch
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
            if (keypadField.name === 'areaSample') setAreaSample(val);
            if (keypadField.name === 'areaStandard') setAreaStandard(val);
            if (keypadField.name === 'weightStandard') setWeightStandard(val);
            if (keypadField.name === 'weightSample') setWeightSample(val);
            if (keypadField.name === 'purityStandard') setPurityStandard(val);
          }}
        />
      )}
    </div>
  );
};
