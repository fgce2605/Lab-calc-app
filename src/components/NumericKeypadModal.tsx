import React from 'react';
import { Delete, Check, RotateCcw, X } from 'lucide-react';
import { playLabBeep } from '../utils/storage';

interface NumericKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  unit?: string;
  initialValue: string;
  onConfirm: (val: number) => void;
  stepPresets?: number[];
}

export const NumericKeypadModal: React.FC<NumericKeypadModalProps> = ({
  isOpen,
  onClose,
  title,
  unit,
  initialValue,
  onConfirm,
  stepPresets = [0.01, 0.1, 1, 5, 10],
}) => {
  const [valueStr, setValueStr] = React.useState(initialValue || '0');

  React.useEffect(() => {
    if (isOpen) {
      setValueStr(initialValue || '0');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    playLabBeep('click');
    if (valueStr === '0' && digit !== '.') {
      setValueStr(digit);
    } else if (digit === '.' && valueStr.includes('.')) {
      return;
    } else {
      setValueStr((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    playLabBeep('click');
    if (valueStr.length <= 1) {
      setValueStr('0');
    } else {
      setValueStr((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    playLabBeep('click');
    setValueStr('0');
  };

  const handleStep = (delta: number) => {
    playLabBeep('click');
    const curr = parseFloat(valueStr) || 0;
    const next = Math.max(0, curr + delta);
    // Format intelligently
    if (delta < 0.1) {
      setValueStr(next.toFixed(3));
    } else if (delta < 1) {
      setValueStr(next.toFixed(2));
    } else {
      setValueStr(next.toFixed(1));
    }
  };

  const handleConfirm = () => {
    playLabBeep('click');
    const num = parseFloat(valueStr) || 0;
    onConfirm(num);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-display uppercase tracking-wider">
              {title}
            </h3>
            {unit && <span className="text-xs text-slate-400">Target Unit: {unit}</span>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-950 flex flex-col items-end justify-center border-b border-slate-800">
          <div className="text-xs font-mono text-cyan-400/70 mb-1 uppercase tracking-widest">
            DIGITAL KEYPAD ENTRY
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 tracking-tight flex items-baseline gap-2">
            <span>{valueStr}</span>
            {unit && <span className="text-sm text-slate-400 font-normal">{unit}</span>}
          </div>
        </div>

        {/* Quick Delta Step Bar */}
        <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-mono uppercase whitespace-nowrap mr-1">
            STEP ±:
          </span>
          {stepPresets.map((step) => (
            <div key={step} className="flex gap-1">
              <button
                onClick={() => handleStep(-step)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700 active:scale-95 transition"
              >
                -{step}
              </button>
              <button
                onClick={() => handleStep(step)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 active:scale-95 transition"
              >
                +{step}
              </button>
            </div>
          ))}
        </div>

        {/* Keypad Grid */}
        <div className="p-4 grid grid-cols-3 gap-2.5 bg-slate-900">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="py-3.5 text-xl font-mono font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-100 rounded-xl border border-slate-700/60 shadow-sm active:bg-cyan-900/40 active:scale-95 transition flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Backspace Button */}
          <button
            onClick={handleBackspace}
            className="py-3.5 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/60 active:scale-95 transition flex items-center justify-center"
          >
            <Delete className="w-6 h-6 text-amber-400" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleClear}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition text-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Clear
          </button>
          <button
            onClick={handleConfirm}
            className="flex-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-95 transition text-sm"
          >
            <Check className="w-5 h-5" />
            Apply Value
          </button>
        </div>
      </div>
    </div>
  );
};
