import React, { useState, useEffect } from 'react';
import { Batch, ResinSpecification } from '../../types';
import { calculateGelTime, evaluatePassFail } from '../../utils/formulas';
import { addTestResultToBatch, getActiveUser, playLabBeep } from '../../utils/storage';
import { GaugeMeter } from '../GaugeMeter';
import { Calculator, Save, Play, Pause, RotateCcw, AlertTriangle, Timer } from 'lucide-react';

interface Props {
  activeBatch?: Batch;
  activeSpec?: ResinSpecification;
  onResultSaved?: () => void;
}

export const GelTimeCalculator: React.FC<Props> = ({ activeBatch, activeSpec, onResultSaved }) => {
  const [startTime, setStartTime] = useState<string>('10:15');
  const [gelTime, setGelTime] = useState<string>('10:48');
  const [manualMinutes, setManualMinutes] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');

  // Live Timer Mode
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    playLabBeep('click');
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    playLabBeep('click');
    setIsTimerRunning(false);
    // Set elapsed minutes to manualMinutes
    const mins = Math.round((timerSeconds / 60) * 10) / 10;
    setManualMinutes(mins);
  };

  const handleResetTimer = () => {
    playLabBeep('click');
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setManualMinutes(undefined);
  };

  const specMin = activeSpec?.specs?.gel_time?.min ?? 15;
  const specMax = activeSpec?.specs?.gel_time?.max ?? 60;

  const effectiveManualMinutes = isTimerRunning
    ? Math.round((timerSeconds / 60) * 10) / 10
    : manualMinutes;

  const calcResult = calculateGelTime(startTime, gelTime, effectiveManualMinutes);
  const isPass = calcResult.isValid ? evaluatePassFail(calcResult.result, specMin, specMax) : false;

  const handleSaveToBatch = () => {
    if (!activeBatch || !calcResult.isValid) return;

    const user = getActiveUser();
    addTestResultToBatch(activeBatch.id, {
      id: 'res_' + Date.now(),
      batchId: activeBatch.id,
      calcType: 'gel_time',
      calcName: 'Gel Time / Pot Life',
      timestamp: new Date().toISOString(),
      operatorId: user.id,
      operatorName: user.name,
      inputs: { startTime, gelTime, durationMinutes: calcResult.result },
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

  // Format digital stopwatch display hh:mm:ss
  const formatStopwatch = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-display text-lg font-bold">
            <Calculator className="w-5 h-5" />
            Gel Time & Pot Life Reactivity
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Time required for liquid thermosetting resin system to convert from liquid state to gel point.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-rose-300">
          Duration = Gel Time − Start Time
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-5">
          {/* Live Stopwatch Section */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-widest">
              <Timer className="w-4 h-4 animate-pulse" />
              LIVE GELation STOPWATCH
            </div>
            <div className="text-4xl font-mono font-bold tracking-wider text-rose-400 lcd-amber px-6 py-3 rounded-xl border border-rose-900/40 glow-rose">
              {formatStopwatch(timerSeconds)}
            </div>

            <div className="flex items-center gap-3 pt-1">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950"
                >
                  <Play className="w-4 h-4" /> Start Live Timer
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Pause className="w-4 h-4" /> Capture Gel Point
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="relative border-t border-slate-800 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display block mb-3">
              OR INPUT TIMESTAMPS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Mixing Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setManualMinutes(undefined);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-semibold focus:outline-hidden"
                />
              </div>

              {/* Gel Time */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Observed Gel Time</label>
                <input
                  type="time"
                  value={gelTime}
                  onChange={(e) => {
                    setGelTime(e.target.value);
                    setManualMinutes(undefined);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-rose-300 font-mono font-semibold focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-slate-300">Test Conditions & Temperature</label>
            <input
              type="text"
              placeholder="e.g., Gel norm test tube method @ 25°C ambient, hardener MEKP 2.0%"
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
            max={specMax ? Math.max(specMax * 2, 90) : 180}
            unit="min"
            title="GEL TIME DURATION"
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
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Log Gel Time to Active Batch
            </button>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center">
              No active batch selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
