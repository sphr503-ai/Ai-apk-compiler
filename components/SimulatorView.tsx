
import React from 'react';
import { SystemStatus } from '../types';

interface SimulatorViewProps {
  status: SystemStatus;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ status }) => {
  const isActive = status === SystemStatus.TESTING || status === SystemStatus.COMPLETED;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`relative w-64 h-[500px] border-8 border-zinc-800 rounded-[3rem] bg-black shadow-2xl transition-all duration-500 ${isActive ? 'ring-4 ring-cyan-500/20' : 'opacity-40'}`}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-10"></div>
        
        {/* Screen */}
        <div className="absolute inset-0 m-1 bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col">
          {isActive ? (
            <div className="flex-1 flex flex-col p-6 animate-fade-in">
              <div className="h-4 w-12 bg-zinc-700 rounded mb-8 self-end"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 shadow-lg shadow-cyan-500/40"></div>
              <div className="text-center font-bold text-white text-lg mb-2">Build Success!</div>
              <div className="text-center text-zinc-400 text-xs px-4">
                MainActivity launched successfully. No crashes detected in "TestDevice" AVD.
              </div>
              <div className="mt-auto mb-10 flex flex-col gap-3">
                <div className="h-10 w-full bg-zinc-800 rounded-xl"></div>
                <div className="h-10 w-full bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 italic text-sm">
              {status === SystemStatus.PROVISIONING ? 'Booting AVD...' : 'Waiting for Deployment...'}
            </div>
          )}
        </div>
        
        {/* Buttons */}
        <div className="absolute -right-2 top-24 w-1 h-12 bg-zinc-700 rounded-l"></div>
        <div className="absolute -right-2 top-40 w-1 h-20 bg-zinc-700 rounded-l"></div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-zinc-500 text-xs">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
        TestDevice (AVD) • x86_64 • hardware-acceleration: enabled
      </div>
    </div>
  );
};
