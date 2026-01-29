
import React from 'react';
import { SystemStatus } from '../types.ts';
import { Smartphone, Zap, CheckCircle, AlertCircle, Home, Layout, Settings, User } from 'lucide-react';

interface SimulatorViewProps {
  status: SystemStatus;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ status }) => {
  const isInstalled = status === SystemStatus.TESTING || status === SystemStatus.COMPLETED;
  const isFinal = status === SystemStatus.COMPLETED;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className={`relative w-64 h-[500px] border-8 border-zinc-800 rounded-[3rem] bg-black shadow-2xl transition-all duration-700 ${isInstalled ? 'ring-4 ring-cyan-500/20' : 'opacity-40'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20"></div>
        
        <div className="absolute inset-0 m-1 bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col">
          {isInstalled ? (
            <div className="flex-1 flex flex-col bg-zinc-950 animate-fade-in relative">
              {/* Android Status Bar */}
              <div className="p-4 flex justify-between items-center bg-black/40">
                <span className="text-[9px] font-bold text-zinc-400">9:41</span>
                <div className="flex gap-1 items-center">
                  <Zap className="w-2.5 h-2.5 text-cyan-500" />
                  <span className="text-[8px] font-bold text-zinc-400">LTE</span>
                  <div className="w-4 h-2 bg-zinc-700 rounded-sm overflow-hidden">
                    <div className="w-3/4 h-full bg-green-500"></div>
                  </div>
                </div>
              </div>

              {/* Mock App Interface */}
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center gap-3 mb-6 mt-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Layout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">StoryScape</h4>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">v2.0.4 • SDK 34</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="h-16 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-zinc-500 uppercase">Users</span>
                    <span className="text-white font-bold text-xs">12.4k</span>
                  </div>
                  <div className="h-16 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-zinc-500 uppercase">Uptime</span>
                    <span className="text-white font-bold text-xs">99.9%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyan-500/40"></div>
                  </div>
                  <div className="h-2 w-3/4 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyan-500/20"></div>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyan-500/10"></div>
                  </div>
                </div>

                {isFinal && (
                  <div className="mt-8 flex flex-col items-center animate-fade-in">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-[10px] font-bold text-green-400">STABLE BUILD</p>
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="p-4 flex justify-around items-center border-t border-zinc-900 bg-black/40">
                <Home className="w-4 h-4 text-cyan-400" />
                <Layout className="w-4 h-4 text-zinc-600" />
                <Settings className="w-4 h-4 text-zinc-600" />
                <User className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              {status === SystemStatus.PROVISIONING ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <Zap className="w-8 h-8 text-cyan-500" />
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Booting OS</span>
                </div>
              ) : status === SystemStatus.BUILDING || status === SystemStatus.SELF_HEALING ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-zinc-800 border-t-cyan-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Installing APK</span>
                </div>
              ) : status === SystemStatus.FAILED ? (
                 <div className="flex flex-col items-center gap-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <span className="text-xs text-red-500 uppercase tracking-widest font-black">Error Logged</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Smartphone className="w-10 h-10 text-zinc-800" />
                  <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-black">2GB Node Offline</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-zinc-600 text-[9px] uppercase tracking-widest font-black">
        <div className={`w-2.5 h-2.5 rounded-full ${isInstalled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-zinc-800'}`}></div>
        Cloud VPS • TestDevice • API 34
      </div>
    </div>
  );
};
