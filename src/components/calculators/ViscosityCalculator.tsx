import React, { useState, useEffect } from 'react';
import { Batch, ResinSpecification, ViscositySpindleFactor } from '../../types';
import { calculateViscosity, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser, getViscosityFactors, saveViscosityFactors } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { NumericKeypadModal } from '../NumericKeypadModal';
import { Calculator, Save, AlertTriangle, Hash, Settings2, Plus, Trash2, X, Check } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const ViscosityCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [factors, setFactors] = useState<ViscositySpindleFactor[]>(getViscosityFactors());
  const [selectedSpindle, setSelectedSpindle] = useState<string>('LV-3 (63)');
  const [selectedRpm, setSelectedRpm] = useState<number>(12);
  const [dialReading, setDialReading] = useState<number>(24);
  const [customFactorOverride, setCustomFactorOverride] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Factor table editor modal
  const [isFactorModalOpen, setIsFactorModalOpen] = useState<boolean>(false);
  const [editingFactors, setEditingFactors] = useState<ViscositySpindleFactor[]>(factors);
  const [newSpindle, setNewSpindle] = useState<string>('LV-1');
  const [newRpm, setNewRpm] = useState<number>(60);
  const [newFactorVal, setNewFactorVal] = useState<number>(1);

  const [keypadField, setKeypadField] = useState<{ name: string; title: string; unit: string; val: number } | null>(null);

  // Auto lookup factor
  const matchedFactorObj = factors.find(
    (f) => f.spindle.toLowerCase() === selectedSpindle.toLowerCase() && f.rpm === selectedRpm
  );
  const currentFactor = customFactorOverride !== '' ? parseFloat(customFactorOverride) || 1 : matchedFactorObj?.factor || 100;

  const specMin = activeSpec?.specs?.viscosity?.min ?? 1000;
  const specMax = activeSpec?.specs?.viscosity?.max ?? 3500;

  const calcResult = calculateViscosity(dialReading, currentFactor);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  // Extract unique spindle list
  const uniqueSpindles = Array.from(new Set(factors.map((f) => f.spindle)));
  // Filter RPMs available for selected spindle
  const availableRpms = factors.filter((f) => f.spindle === selectedSpindle).map((f) => f.rpm);

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'viscosity',
      calcName: 'Brookfield Viscosity',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { spindle: selectedSpindle, rpm: selectedRpm, dialReading, factor: currentFactor },
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

  const handleSaveFactorsTable = () => {
    saveViscosityFactors(editingFactors);
    setFactors(editingFactors);
    setIsFactorModalOpen(false);
  };

  const handleAddFactorRow = () => {
    if (!newSpindle || !newRpm || !newFactorVal) return;
    const next = [...editingFactors, { spindle: newSpindle, rpm: newRpm, factor: newFactorVal }];
    setEditingFactors(next);
  };

  const handleDeleteFactorRow = (idx: number) => {
    setEditingFactors(editingFactors.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Brookfield Rotational Viscosity (cP)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic viscosity determination using spindle geometry and rotational speed lookup multiplier.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingFactors(getViscosityFactors());
              setIsFactorModalOpen(true);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Edit Spindle Table
          </button>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-teal-300">
            Viscosity (cP) = Dial Reading × Factor
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display border-b border-slate-800 pb-2">
            BROOKFIELD VISCOMETER SETTINGS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Spindle Selection */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Spindle Code</label>
              <select
                value={selectedSpindle}
                onChange={(e) => {
                  setSelectedSpindle(e.target.value);
                  const firstMatchingRpm = factors.find((f) => f.spindle === e.target.value)?.rpm || 12;
                  setSelectedRpm(firstMatchingRpm);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-teal-300 font-mono font-semibold focus:outline-hidden"
              >
                {uniqueSpindles.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed RPM */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Speed (RPM)</label>
              <select
                value={selectedRpm}
                onChange={(e) => setSelectedRpm(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
              >
                {availableRpms.length > 0 ? (
                  availableRpms.map((rpm) => (
                    <option key={rpm} value={rpm}>
                      {rpm} RPM
                    </option>
                  ))
                ) : (
                  [0.5, 1, 2.5, 5, 6, 10, 12, 20, 30, 50, 60, 100].map((rpm) => (
                    <option key={rpm} value={rpm}>
                      {rpm} RPM
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Dial Reading */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Dial / Torque Reading (0-100)</label>
                <button
                  onClick={() => setKeypadField({ name: 'dialReading', title: 'Viscometer Dial Reading', unit: '% Dial', val: dialReading })}
                  className="text-[10px] text-teal-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Hash className="w-3 h-3" /> Keypad
                </button>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={dialReading}
                onChange={(e) => setDialReading(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-teal-400 font-mono font-bold text-lg focus:outline-hidden"
              />
            </div>

            {/* Factor Display / Custom Override */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Spindle Factor Multiplier</label>
                {matchedFactorObj && (
                  <span className="text-[10px] text-emerald-400 font-mono">Matched in Table</span>
                )}
              </div>
              <input
                type="number"
                placeholder={String(matchedFactorObj?.factor || 100)}
                value={customFactorOverride}
                onChange={(e) => setCustomFactorOverride(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
            <span>Effective Factor: <strong className="text-teal-300">{currentFactor}</strong></span>
            <span>Calculation: {dialReading} × {currentFactor} = <strong className="text-emerald-400">{dialReading * currentFactor} cP</strong></span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Bath Temperature & Conditions</label>
            <input
              type="text"
              placeholder="e.g., Water bath @ 25.0°C ± 0.1°C, spindle immersed to groove line"
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
            max={specMax ? Math.max(specMax * 2, 5000) : 10000}
            unit="cP"
            title="VISCOSITY RESULT"
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
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log Viscosity to Active Batch
            </button>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center">
              No active batch selected.
            </div>
          )}
        </div>
      </div>

      {/* Factor Lookup Table Modal */}
      {isFactorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-display flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-teal-400" />
                Brookfield Spindle / Speed Factor Lookup Table
              </h3>
              <button
                onClick={() => setIsFactorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Add New Factor Row */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-teal-400 uppercase font-mono">
                  Add Spindle Factor
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Spindle (e.g. LV-1)"
                    value={newSpindle}
                    onChange={(e) => setNewSpindle(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="RPM (e.g. 60)"
                    value={newRpm}
                    onChange={(e) => setNewRpm(parseFloat(e.target.value) || 0)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Factor (e.g. 1)"
                    value={newFactorVal}
                    onChange={(e) => setNewFactorVal(parseFloat(e.target.value) || 0)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                  <button
                    onClick={handleAddFactorRow}
                    className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-800 text-slate-300 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Spindle</th>
                      <th className="p-2.5">Speed (RPM)</th>
                      <th className="p-2.5">Multiplier Factor</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950 text-slate-200">
                    {editingFactors.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="p-2.5 font-semibold text-teal-300">{row.spindle}</td>
                        <td className="p-2.5">{row.rpm} RPM</td>
                        <td className="p-2.5 font-bold text-emerald-400">{row.factor}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleDeleteFactorRow(idx)}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsFactorModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFactorsTable}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Spindle Table
              </button>
            </div>
          </div>
        </div>
      )}

      {keypadField && (
        <NumericKeypadModal
          isOpen={true}
          onClose={() => setKeypadField(null)}
          title={keypadField.title}
          unit={keypadField.unit}
          initialValue={String(keypadField.val)}
          onConfirm={(val) => {
            if (keypadField.name === 'dialReading') setDialReading(val);
          }}
        />
      )}
    </div>
  );
};
