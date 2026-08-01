import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { getActiveUser, getUsers, isSoundEnabled, setActiveUser, setSoundEnabled } from '../utils/storage';
import {
  FlaskConical,
  User,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface Props {
  activeUser: UserProfile;
  onUserChanged: (user: UserProfile) => void;
  onOpenCapacitorGuide: () => void;
  activeBatchId?: string | null;
}

export const Header: React.FC<Props> = ({
  activeUser,
  onUserChanged,
  onOpenCapacitorGuide,
  activeBatchId,
}) => {
  const [users] = useState<UserProfile[]>(getUsers());
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  const handleSelectUser = (u: UserProfile) => {
    setActiveUser(u);
    onUserChanged(u);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Offline Pill */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center text-white">
            <FlaskConical className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-display uppercase">
                LabCalc <span className="text-cyan-400">Pro</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                <WifiOff className="w-3 h-3" /> OFFLINE ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Resin & Polymer Quality Control Instrument Dashboard
            </p>
          </div>
        </div>

        {/* Right Tools Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Batch Quick Pill */}
          {activeBatchId && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500">BATCH:</span>
              <span className="text-cyan-300 font-bold">{activeBatchId}</span>
            </div>
          )}

          {/* Capacitor Native App Guide Button */}
          <button
            onClick={onOpenCapacitorGuide}
            className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 active:scale-95 transition"
            title="Capacitor Mobile APK Guide"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Mobile APK</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundOn
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={soundOn ? 'Sound Beeps On' : 'Sound Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold font-mono text-[11px]">
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <span className="block font-semibold leading-none">{activeUser.name}</span>
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
                  {activeUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 p-1 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  SWITCH ACTIVE ROLE PROFILE
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                      activeUser.id === u.id
                        ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="block font-semibold">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.employeeId}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
