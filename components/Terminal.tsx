
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
    <div className="bg-[#121214] border border-zinc-800 rounded-lg h-96 overflow-y-auto p-4 mono text-sm shadow-inner">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-zinc-500 ml-2">autonomous-engine@android-vps: ~</span>
      </div>
      {logs.length === 0 && (
        <div className="text-zinc-600 italic">No output yet. Initialize the environment to begin.</div>
      )}
      {logs.map((log, i) => (
        <div key={i} className="mb-1 leading-relaxed animate-fade-in">
          <span className="text-zinc-600 mr-2">[{log.timestamp}]</span>
          <span className={
            log.type === 'error' ? 'text-red-400' :
            log.type === 'success' ? 'text-green-400' :
            log.type === 'ai' ? 'text-cyan-400 font-bold' :
            log.type === 'warning' ? 'text-yellow-400' :
            'text-zinc-300'
          }>
            {log.type === 'ai' ? '✦ ' : ''}
            {log.message}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
