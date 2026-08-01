import React, { useState } from 'react';
import { CalcType, ResinSpecification } from '../types';
import { CALCULATORS } from '../utils/constants';
import { deleteResinGrade, getResinGrades, saveResinGrade } from '../utils/storage';
import { Sliders, Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';

export const SpecificationManager: React.FC = () => {
  const [grades, setGrades] = useState<ResinSpecification[]>(getResinGrades());
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [editingGrade, setEditingGrade] = useState<ResinSpecification | null>(null);

  const refreshGrades = () => {
    setGrades(getResinGrades());
  };

  const handleCreateNewGrade = () => {
    const newGrade: ResinSpecification = {
      id: 'grade_' + Date.now(),
      gradeName: 'New Resin Grade',
      category: 'Epoxy',
      specs: {
        nco: { min: 0, max: 0.2, unit: '%' },
        acid_value: { min: 0, max: 1.0, unit: 'mg KOH/g' },
        viscosity: { min: 1000, max: 3000, unit: 'cP' },
        nvm: { min: 98.0, max: 100.0, unit: '%' },
      },
    };
    setEditingGrade(newGrade);
    setIsEditingModalOpen(true);
  };

  const handleEditGrade = (g: ResinSpecification) => {
    setEditingGrade(JSON.parse(JSON.stringify(g)));
    setIsEditingModalOpen(true);
  };

  const handleDeleteGrade = (id: string) => {
    if (window.confirm('Delete this product specification template?')) {
      deleteResinGrade(id);
      refreshGrades();
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGrade) {
      saveResinGrade(editingGrade);
      refreshGrades();
      setIsEditingModalOpen(false);
      setEditingGrade(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            Resin & Polymer Product Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure target min/max quality bounds for automatic PASS/FAIL evaluation across calculators.
          </p>
        </div>

        <button
          onClick={handleCreateNewGrade}
          className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950 flex items-center gap-2 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Add Product Grade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grades.map((g) => (
          <div key={g.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono px-2 py-0.5 bg-amber-950/60 rounded border border-amber-800/40">
                  {g.category}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1 font-display">{g.gradeName}</h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditGrade(g)}
                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGrade(g.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs font-mono">
              {Object.entries(g.specs).map(([calcKey, spec]) => {
                const info = CALCULATORS.find((c) => c.id === calcKey);
                return (
                  <div key={calcKey} className="flex justify-between items-center py-1 px-2 rounded bg-slate-950/60">
                    <span className="text-slate-400">{info?.shortName || calcKey}:</span>
                    <span className="text-emerald-400 font-semibold">
                      {spec.min} - {spec.max} {spec.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Grade Modal */}
      {isEditingModalOpen && editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-display flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Edit Specification Limits
              </h3>
              <button onClick={() => setIsEditingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Grade / Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingGrade.gradeName}
                    onChange={(e) => setEditingGrade({ ...editingGrade, gradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Category</label>
                  <input
                    type="text"
                    required
                    value={editingGrade.category}
                    onChange={(e) => setEditingGrade({ ...editingGrade, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display border-b border-slate-800 pb-1">
                  CALCULATOR SPECIFICATION BOUNDS
                </h4>

                {CALCULATORS.map((calc) => {
                  const currentSpec = editingGrade.specs[calc.id as CalcType] || {
                    min: calc.defaultMin,
                    max: calc.defaultMax,
                    unit: calc.unit,
                  };

                  return (
                    <div key={calc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-amber-300 font-mono block">
                        {calc.name} ({calc.unit})
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block">MIN SPEC</span>
                          <input
                            type="number"
                            step="any"
                            value={currentSpec.min}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditingGrade({
                                ...editingGrade,
                                specs: {
                                  ...editingGrade.specs,
                                  [calc.id]: { ...currentSpec, min: val, unit: calc.unit },
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">MAX SPEC</span>
                          <input
                            type="number"
                            step="any"
                            value={currentSpec.max}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditingGrade({
                                ...editingGrade,
                                specs: {
                                  ...editingGrade.specs,
                                  [calc.id]: { ...currentSpec, max: val, unit: calc.unit },
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950"
                >
                  <Check className="w-4 h-4" /> Save Specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
