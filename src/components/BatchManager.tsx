import React, { useState } from 'react';
import { Batch, ResinSpecification } from '../types';
import { deleteBatch, getBatches, getResinGrades, saveBatch, setActiveBatchId } from '../utils/storage';
import {
  FolderPlus,
  Layers,
  Camera,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  Package,
  Plus,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface Props {
  activeBatch: Batch | undefined;
  onBatchChange: (batch: Batch) => void;
  onOpenCOA: (batch: Batch) => void;
}

export const BatchManager: React.FC<Props> = ({ activeBatch, onBatchChange, onOpenCOA }) => {
  const [batches, setBatches] = useState<Batch[]>(getBatches());
  const [resinGrades] = useState<ResinSpecification[]>(getResinGrades());

  // Create Batch Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sampleName, setSampleName] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(resinGrades[0]?.id || '');
  const [lotNumber, setLotNumber] = useState<string>('');
  const [quantityKg, setQuantityKg] = useState<number>(2000);
  const [operatorName, setOperatorName] = useState<string>('Alex Rivera');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const refreshBatches = () => {
    const list = getBatches();
    setBatches(list);
    if (activeBatch) {
      const updated = list.find((b) => b.id === activeBatch.id);
      if (updated) onBatchChange(updated);
    }
  };

  const handleSelectBatch = (b: Batch) => {
    setActiveBatchId(b.id);
    onBatchChange(b);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeObj = resinGrades.find((g) => g.id === selectedGradeId);
    const newBatch: Batch = {
      id: 'BAT-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      sampleName: sampleName || gradeObj?.gradeName || 'New Batch Sample',
      resinGradeId: selectedGradeId,
      resinGradeName: gradeObj?.gradeName || 'General Polymer',
      lotNumber: lotNumber || 'LOT-' + Math.floor(1000 + Math.random() * 9000),
      quantityKg,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      operatorId: 'usr_op_1',
      operatorName: operatorName || 'Alex Rivera',
      status: 'in_progress',
      photoUrl: photoUrl || undefined,
      notes: notes || undefined,
      testResults: [],
    };

    saveBatch(newBatch);
    refreshBatches();
    setActiveBatchId(newBatch.id);
    onBatchChange(newBatch);
    setIsModalOpen(false);

    // Reset Form
    setSampleName('');
    setLotNumber('');
    setNotes('');
    setPhotoUrl('');
  };

  const handleDeleteBatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this batch log and all associated test records?')) {
      deleteBatch(id);
      refreshBatches();
    }
  };

  // Capacitor Camera or fallback image file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Active Batch Context & QC Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage production batch runs, track lab testing progress, and generate COA certificates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950 flex items-center gap-2 active:scale-95 transition"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Batch
        </button>
      </div>

      {/* Active Batch Banner */}
      {activeBatch ? (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950/60 rounded-xl border border-cyan-500/30 text-cyan-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-cyan-300">{activeBatch.id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      activeBatch.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : activeBatch.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeBatch.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  {activeBatch.sampleName} — <span className="text-slate-400">{activeBatch.resinGradeName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCOA(activeBatch)}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Certificate of Analysis (COA)
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LOT NUMBER:</span>
              <span className="text-slate-200 font-bold">{activeBatch.lotNumber}</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">QUANTITY (KG):</span>
              <span className="text-slate-200 font-bold">{activeBatch.quantityKg} kg</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">QC OPERATOR:</span>
              <span className="text-slate-200 font-bold">{activeBatch.operatorName}</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LOGGED TESTS:</span>
              <span className="text-cyan-400 font-bold">{activeBatch.testResults?.length || 0} tests</span>
            </div>
          </div>

          {/* Sample Photo if attached */}
          {activeBatch.photoUrl && (
            <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
              <img
                src={activeBatch.photoUrl}
                alt="Sample Inspection"
                className="w-16 h-16 object-cover rounded-lg border border-slate-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-300 block">Sample Physical Photo Attached</span>
                <span className="text-[10px] text-slate-500">Visual appearance, clarity & container inspection image.</span>
              </div>
            </div>
          )}

          {/* Recorded Test Results Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
              TESTS RECORDED FOR THIS BATCH
            </h4>

            {activeBatch.testResults && activeBatch.testResults.length > 0 ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Test Parameter</th>
                      <th className="p-2.5">Observed Value</th>
                      <th className="p-2.5">Spec Range</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-200">
                    {activeBatch.testResults.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/50">
                        <td className="p-2.5 font-semibold text-slate-100">{t.calcName}</td>
                        <td className="p-2.5 font-bold text-cyan-300">
                          {t.resultFormatted} {t.unit}
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {t.specMin ?? 0} - {t.specMax ?? '∞'} {t.unit}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.isPass
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {t.isPass ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> PASS
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> OUT OF SPEC
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-400">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-xs text-slate-400">
                No laboratory tests logged for this batch yet. Use any of the 9 calculators to perform and log a test.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200 font-display">No Active Batch Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select a batch from the list below or click "Create New Batch" to begin recording QC calculations.
          </p>
        </div>
      )}

      {/* Batches Selection Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
          ALL BATCH RUNS ({batches.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((b) => {
            const isSelected = activeBatch?.id === b.id;
            return (
              <div
                key={b.id}
                onClick={() => handleSelectBatch(b)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold font-mono text-cyan-300">{b.id}</div>
                    <div className="text-xs font-semibold text-slate-100 line-clamp-1">{b.sampleName}</div>
                    <div className="text-[11px] text-slate-400">{b.resinGradeName}</div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBatch(b.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">LOT: {b.lotNumber}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                      b.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : b.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {b.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create New Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-display flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                Create New Batch Context
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Sample / Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Epoxy Clear Coat Batch #4"
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Resin Grade Specification</label>
                  <select
                    value={selectedGradeId}
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-cyan-300 font-semibold focus:outline-hidden"
                  >
                    {resinGrades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gradeName} ({g.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Lot Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-9923"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Batch Size (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">QC Operator Name</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Sample Photo Attachment */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Sample Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Upload or Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && <span className="text-xs text-emerald-400 font-mono">Image attached ✓</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Reactor / Tank Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reactor R-02 batch run, standard recipe..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950"
                >
                  <Plus className="w-4 h-4" /> Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
