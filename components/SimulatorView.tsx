
import React from 'react';
import { SystemStatus } from '../types.ts';

interface SimulatorViewProps {
  status: SystemStatus;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ status }) => {
  const isActive = status === SystemStatus.TESTING || status === SystemStatus.COMPLETED;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className={`relative w-64 h-[500px] border-8 border-zinc-800 rounded-[3rem] bg-black shadow-2xl transition-all duration-500 ${isActive ? 'ring-4 ring-cyan-500/20' : 'opacity-40'}`}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-10"></div>
        
        {/* Screen */}
        <div className="absolute inset-0 m-1 bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col">
          {isActive ? (
            <div className="flex-1 flex flex-col p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div className="text-[10px] text-zinc-500 font-bold">9:41 AM</div>
                <div className="flex gap-1">
                  <div className="h-2.5 w-4 bg-zinc-700 rounded-sm"></div>
                  <div className="h-2.5 w-6 bg-zinc-700 rounded-sm"></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 shadow-lg shadow-cyan-500/40 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
              </div>
              <div className="text-center font-bold text-white text-lg mb-2">Build Success!</div>
              <div className="text-center text-zinc-400 text-[10px] leading-relaxed px-2">
                MainActivity launched successfully on "TestDevice" AVD. Hardware acceleration confirmed.
              </div>
              <div className="mt-auto mb-8 space-y-3">
                <div className="h-8 w-full bg-zinc-800 rounded-lg border border-zinc-700/50"></div>
                <div className="h-8 w-full bg-zinc-800 rounded-lg border border-zinc-700/50"></div>
                <div className="h-8 w-full bg-cyan-600/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-cyan-400 font-bold">READY TO TEST</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 italic text-sm p-6 text-center">
              {status === SystemStatus.PROVISIONING ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
                  <span>Provisioning OS Layer...</span>
                </div>
              ) : status === SystemStatus.BUILDING || status === SystemStatus.SELF_HEALING ? (
                <div className="flex flex-col items-center gap-4">
                   <div className="w-10 h-10 border-2 border-zinc-700 border-t-yellow-500 rounded-full animate-spin"></div>
                   <span>Waiting for APK...</span>
                </div>
              ) : (
                'AVD Offline'
              )}
            </div>
          )}
        </div>
        
        {/* Physical Buttons */}
        <div className="absolute -right-2 top-24 w-1 h-12 bg-zinc-700 rounded-l"></div>
        <div className="absolute -right-2 top-40 w-1 h-20 bg-zinc-700 rounded-l"></div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-700'}`}></div>
        TestDevice • x86_64 • AVD
      </div>
    </div>
  );
};
