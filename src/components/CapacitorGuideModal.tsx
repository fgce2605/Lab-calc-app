import React from 'react';
import { Smartphone, Terminal, CheckCircle, Copy, X, Camera, Bell, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacitorGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const steps = [
    {
      title: '1. Build Web Assets',
      cmd: 'npm run build',
      desc: 'Compiles React + Vite project into static files in the /dist folder.',
    },
    {
      title: '2. Add Native Mobile Platform',
      cmd: 'npx cap add android',
      desc: 'Adds the Android platform project using Capacitor CLI (or npx cap add ios for Apple iOS).',
    },
    {
      title: '3. Sync Web Build with Capacitor',
      cmd: 'npx cap sync',
      desc: 'Copies web build assets and updates native plugins in Android Studio / Xcode.',
    },
    {
      title: '4. Open in Android Studio & Generate APK',
      cmd: 'npx cap open android',
      desc: 'Launches Android Studio project. Click Build > Build APK(s) to produce downloadable .apk file.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">
              Capacitor Mobile App Compilation Guide
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl space-y-1.5 text-cyan-200">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck className="w-4 h-4" /> Ready for Native Android & iOS Deployment
            </span>
            <p className="text-[11px] text-cyan-200/80 leading-relaxed">
              LabCalc Pro is configured with <code className="font-mono text-cyan-300">capacitor.config.json</code> and native plugins for Camera sample capture, Local Push Notifications for timer alerts, and Offline storage.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display border-b border-slate-800 pb-1">
              BUILD COMMANDS (RUN IN TERMINAL)
            </h4>

            {steps.map((step, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 font-display">{step.title}</span>
                  <button
                    onClick={() => copyToClipboard(step.cmd)}
                    className="p-1 px-2 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300 flex items-center gap-1"
                  >
                    {copiedCmd === step.cmd ? (
                      <span className="text-emerald-400 font-bold">Copied ✓</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-cyan-400 border border-slate-800 flex items-center gap-2 text-[11px]">
                  <Terminal className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  {step.cmd}
                </div>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 uppercase font-display flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" /> Included Capacitor Plugins
            </h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
              <li><strong className="text-slate-200">@capacitor/camera:</strong> Access smartphone camera for visual sample inspection.</li>
              <li><strong className="text-slate-200">@capacitor/local-notifications:</strong> Timer & pot life notifications on lockscreen.</li>
              <li><strong className="text-slate-200">@capacitor/status-bar & keyboard:</strong> Native dark immersive status bar and keypad adjustments.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
