
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types.ts';

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#0d0d0f] h-full overflow-y-auto p-6 mono text-[12px] shadow-inner relative">
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800/50 pb-4 sticky top-0 bg-[#0d0d0f] z-10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
        </div>
        <span className="text-zinc-600 ml-2 font-bold tracking-tight">autonomous-engine@vps-node-14: ~</span>
      </div>
      {logs.length === 0 && (
        <div className="text-zinc-700 italic opacity-50 flex flex-col items-center justify-center h-[300px]">
           <div className="w-12 h-12 border-2 border-zinc-900 rounded-full mb-4"></div>
           Awaiting pipeline initialization...
        </div>
      )}
      <div className="space-y-1.5 pb-8">
        {logs.map((log, i) => (
          <div key={i} className="leading-relaxed animate-fade-in flex gap-3">
            <span className="text-zinc-700 font-bold shrink-0">{log.timestamp}</span>
            <span className={
              log.type === 'error' ? 'text-red-500 font-medium' :
              log.type === 'success' ? 'text-green-500 font-medium' :
              log.type === 'ai' ? 'text-cyan-400 font-black' :
              log.type === 'warning' ? 'text-yellow-500' :
              'text-zinc-500'
            }>
              {log.type === 'ai' ? '✦ ' : ''}
              {log.message}
            </span>
          </div>
        ))}
      </div>
      <div ref={endRef} />
    </div>
  );
};
