
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SystemStatus, LogEntry, ProvisioningState, SourceFile } from './types.ts';
import { Terminal } from './components/Terminal.tsx';
import { SimulatorView } from './components/SimulatorView.tsx';
import { analyzeBuildError, generateSelfHealingPythonScript } from './services/geminiService.ts';
import { GoogleGenAI } from "@google/genai";
import { 
  Cpu, 
  Layers, 
  Terminal as TerminalIcon, 
  Smartphone, 
  Play, 
  CheckCircle, 
  Download,
  Code,
  Zap,
  RefreshCw,
  Box,
  Upload,
  Link as LinkIcon,
  FileArchive,
  X,
  AlertTriangle,
  RotateCcw,
  Key,
  ChevronRight,
  FileCode,
  Eye,
  MessageSquare,
  Send,
  HardDrive,
  Activity,
  Gauge
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [provisioning, setProvisioning] = useState<ProvisioningState>({
    java: false,
    androidStudio: false,
    sdk: false,
    avd: false,
    ramLimit: 2,
    cpuCores: 2
  });
  const [projectUrl, setProjectUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'terminal' | 'source' | 'chat'>('terminal');
  
  // Simulated Source Code
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatMessage, setCurrentChatMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      addLog(`Attached local source archive: ${file.name}`, 'info');
    }
  }, [addLog]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const upgradeHardware = useCallback(() => {
    setProvisioning(p => ({ ...p, ramLimit: 8, cpuCores: 4 }));
    addLog('✦ System: Vertical scaling initiated. Instance upgraded to 8GB RAM (High Settings), 4 vCPUs.', 'warning');
    addLog('Infrastructure Updated: "High Performance Mode" active. Resuming pipeline...', 'success');
  }, [addLog]);

  const sendChatMessage = async (overrideMsg?: string) => {
    const userMsg = overrideMsg || currentChatMessage.trim();
    if (!userMsg) return;

    const timestamp = new Date().toLocaleTimeString();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp }]);
    setCurrentChatMessage('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Current Build Status: ${status}. Infrastructure: ${provisioning.ramLimit}GB RAM, ${provisioning.cpuCores} Cores. Latest Logs: ${logs.slice(-5).map(l => l.message).join(' | ')}. User says: "${userMsg}"`,
        config: {
          systemInstruction: "You are an Autonomous Android Engineer. If the user suggests upgrading, increasing RAM, or using high settings to fix an OOM error, agree and state that you are applying High Performance Settings."
        }
      });

      const agentText = response.text || "Instruction received. Optimizing environment.";
      setChatMessages(prev => [...prev, { role: 'agent', text: agentText, timestamp: new Date().toLocaleTimeString() }]);
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('upgrade') || lowerMsg.includes('high settings') || lowerMsg.includes('increase ram') || lowerMsg.includes('fix')) {
        upgradeHardware();
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'agent', text: "I'm processing the environment changes now.", timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (status === SystemStatus.COMPLETED) {
      setIsPreparingDownload(true);
      setDownloadProgress(0);
      interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPreparingDownload(false);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [status]);

  const runProvisioning = async () => {
    setStatus(SystemStatus.PROVISIONING);
    addLog('Provisioning standard VPS node (2GB RAM, 2 vCPUs)...', 'warning');
    await new Promise(r => setTimeout(r, 1000));
    setProvisioning(p => ({ ...p, java: true, androidStudio: true, sdk: true, avd: true, ramLimit: 2, cpuCores: 2 }));
    addLog('Infrastructure Verified. 2GB Node ready.', 'success');
    setStatus(SystemStatus.IDLE);
  };

  const startPipeline = async () => {
    if ((inputMode === 'url' && !projectUrl) || (inputMode === 'upload' && !selectedFile)) {
      addLog('Error: Source input required.', 'error');
      return;
    }

    setRetryCount(0);
    let currentRetry = 0;
    const maxRetries = 4;
    let isStable = false;

    setStatus(SystemStatus.GENERATING_CODE);
    addLog('✦ Agent: Designing application architecture layers...', 'ai');
    await new Promise(r => setTimeout(r, 1000));
    
    const initialFiles: SourceFile[] = [
      {
        name: 'MainActivity.kt',
        path: 'app/src/main/java/com/example/app/MainActivity.kt',
        language: 'kotlin',
        content: `package com.example.app\nimport android.os.Bundle\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}`
      },
      {
        name: 'build.gradle',
        path: 'app/build.gradle',
        language: 'gradle',
        content: `android {\n    compileSdk 34\n    defaultConfig {\n        applicationId "com.example.app"\n        minSdk 24\n        targetSdk 34\n    }\n}`
      }
    ];
    setSourceFiles(initialFiles);
    setActiveTab('source');

    while (currentRetry < maxRetries && !isStable) {
      setRetryCount(currentRetry);
      setStatus(SystemStatus.BUILDING);
      addLog(`Build Cycle #${currentRetry + 1}: Compiling dependencies...`, 'warning');
      await new Promise(r => setTimeout(r, 1500));

      if (currentRetry === 0) {
        addLog('Build Failure: namespace not specified.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        await new Promise(r => setTimeout(r, 1000));
        setSourceFiles(prev => prev.map(f => f.name === 'build.gradle' ? { ...f, content: f.content.replace('android {', 'android {\n    namespace "com.example.app"') } : f));
        addLog('Patch Applied: Explicit namespace declared.', 'success');
        currentRetry++;
        continue;
      }

      setStatus(SystemStatus.TESTING);
      addLog(`Simulator Check: Current Instance RAM = ${provisioning.ramLimit}GB`, 'info');
      await new Promise(r => setTimeout(r, 1500));

      if (provisioning.ramLimit < 4) {
        addLog('Runtime Error: java.lang.OutOfMemoryError (Heap limit exceeded)', 'error');
        addLog('Reason: 2GB standard settings insufficient for 4K assets.', 'error');
        setStatus(SystemStatus.FAILED);
        addLog('✦ Agent: Infrastructure bottleneck detected. Awaiting user guidance...', 'ai');
        setActiveTab('chat');
        setChatMessages(prev => [...prev, { 
          role: 'agent', 
          text: "I've encountered a fatal OutOfMemoryError. The current 2GB RAM setting is insufficient for the system requirements of this project. Should I upgrade to 'High Settings' (8GB RAM) to continue?", 
          timestamp: new Date().toLocaleTimeString() 
        }]);
        
        // Break loop and wait for user to fix it via upgrade or chat
        return; 
      }

      addLog('Smoke Test: Success. App is stable on 8GB Node.', 'success');
      isStable = true;
    }

    if (isStable) {
      setStatus(SystemStatus.COMPLETED);
      addLog('Pipeline fully verified. APK ready.', 'success');
      setActiveTab('terminal');
    }
  };

  const handleDownload = () => {
    if (downloadProgress < 100) return;
    const size = 5 * 1024 * 1024; 
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    view.setUint32(0, 0x504B0304); 
    for (let i = 4; i < size; i++) {
      view.setUint8(i, Math.floor(Math.random() * 256));
    }
    const blob = new Blob([buffer], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Autonomous_App_v1.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('APK Binary (5.0MB) saved successfully.', 'success');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#121214] border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white text-base leading-none">AI ENGINEER</h1>
              <p className="text-[10px] text-cyan-500 font-black tracking-widest uppercase mt-1">Autonomous v4.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('terminal')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'terminal' ? 'text-white bg-zinc-800/80 border border-zinc-700/50' : 'text-zinc-500 hover:text-white'}`}>
            <Layers className="w-5 h-5" />
            Control Center
          </button>
          <button onClick={() => setActiveTab('source')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'source' ? 'text-white bg-zinc-800/50' : 'text-zinc-500 hover:text-white'}`}>
            <FileCode className="w-5 h-5" />
            Source Files
          </button>
          <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'chat' ? 'text-white bg-zinc-800/50' : 'text-zinc-500 hover:text-white'}`}>
            <MessageSquare className="w-5 h-5" />
            Chat with Agent
          </button>
        </nav>

        <div className="p-6 mt-auto space-y-4">
           {status === SystemStatus.FAILED && provisioning.ramLimit < 4 && (
             <button 
              onClick={upgradeHardware}
              className="w-full bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-600/30 text-yellow-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all animate-pulse"
             >
               <Zap className="w-6 h-6" />
               <span className="text-[10px] font-black uppercase tracking-widest">Upgrade to High Settings</span>
             </button>
           )}

          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-black mb-4">Instance Health</p>
            <div className="space-y-3">
              <StatusBadge label="RAM Allocation" active={true} value={`${provisioning.ramLimit}GB`} />
              <StatusBadge label="CPU Core Count" active={true} value={`${provisioning.cpuCores} vCPU`} />
              <StatusBadge label="Disk Space" active={true} value="40GB NVMe" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-10 relative scroll-smooth bg-[#0a0a0b]">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Project Dashboard</h2>
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-cyan-500" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Pipeline: Autonomous Execution</p>
            </div>
          </div>
          <div className="flex gap-4">
            {!provisioning.avd ? (
              <button onClick={runProvisioning} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl shadow-cyan-600/40 transition-all">
                <Zap className="w-5 h-5 fill-current" />
                BOOT INFRASTRUCTURE
              </button>
            ) : (
              <button onClick={startPipeline} disabled={status !== SystemStatus.IDLE && status !== SystemStatus.FAILED} className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl transition-all">
                <Play className="w-5 h-5 fill-current" />
                {status === SystemStatus.FAILED ? 'RETRY WITH NEW SETTINGS' : 'START BUILD'}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
          <div className="lg:col-span-2 space-y-8">
            {/* Input Selection */}
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex gap-4 mb-6">
                <input 
                  type="text" 
                  value={projectUrl} 
                  onChange={(e) => setProjectUrl(e.target.value)} 
                  placeholder="Paste GitHub Repository URL..." 
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 placeholder:text-zinc-700" 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                  <HardDrive className="w-4 h-4" />
                  <span>Target SDK: 34 (Android 14)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                  <Gauge className="w-4 h-4" />
                  <span>Optimal RAM: 8GB</span>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-4">
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-fit">
                <button onClick={() => setActiveTab('terminal')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'terminal' ? 'bg-zinc-800 text-cyan-400 shadow-lg' : 'text-zinc-500'}`}>Terminal</button>
                <button onClick={() => setActiveTab('source')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'source' ? 'bg-zinc-800 text-cyan-400 shadow-lg' : 'text-zinc-500'}`}>Source Code</button>
                <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'chat' ? 'bg-zinc-800 text-cyan-400 shadow-lg' : 'text-zinc-500'}`}>Agent Chat</button>
              </div>
              
              <div className="h-[500px] overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl bg-[#0d0d0f]">
                {activeTab === 'terminal' && <Terminal logs={logs} />}
                {activeTab === 'source' && (
                  <div className="flex h-full font-mono text-[12px]">
                    <div className="w-48 border-r border-zinc-800 p-4 space-y-1 overflow-y-auto">
                      {sourceFiles.map((file, i) => (
                        <button key={i} onClick={() => setSelectedSourceIndex(i)} className={`w-full text-left px-3 py-2 rounded-lg truncate ${selectedSourceIndex === i ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-400/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                          {file.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 p-6 overflow-auto bg-black/20">
                       <pre className="text-zinc-300 leading-relaxed">{sourceFiles[selectedSourceIndex]?.content || "// Repository source will appear here..."}</pre>
                    </div>
                  </div>
                )}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-600/10' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <span className="text-[8px] opacity-40 mt-1 block font-black uppercase tracking-tighter">{msg.timestamp}</span>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start animate-pulse"><div className="bg-zinc-800 rounded-2xl px-4 py-3 h-8 w-16"></div></div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={currentChatMessage}
                          onChange={(e) => setCurrentChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder="Type 'Upgrade settings' or guide the build..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                        />
                        <button onClick={() => sendChatMessage()} className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-lg"><Send className="w-5 h-5 text-white" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl h-full flex flex-col min-h-[700px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-zinc-400" />
                  <h3 className="font-black text-white tracking-tight">Cloud Simulator</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{provisioning.ramLimit}GB Node</span>
              </div>
              <div className="flex-1 flex items-center justify-center relative">
                <SimulatorView status={status} />
              </div>
              <div className="mt-10">
                {status === SystemStatus.COMPLETED ? (
                  <button onClick={handleDownload} disabled={downloadProgress < 100} className={`w-full overflow-hidden rounded-2xl py-6 font-black text-sm flex items-center justify-center gap-3 transition-all transform ${downloadProgress >= 100 ? 'bg-green-600 hover:bg-green-500 shadow-2xl' : 'bg-zinc-800 opacity-50 cursor-not-allowed'}`}>
                    <Download className="w-6 h-6" />
                    {downloadProgress < 100 ? `SYNCING BINARY: ${downloadProgress}%` : "DOWNLOAD APK"}
                  </button>
                ) : (
                  <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed text-center">
                    <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.3em]">Ready for Pipeline Execution</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Status */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#18181b]/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center gap-6 shadow-2xl z-50">
        <div className={`w-3 h-3 rounded-full ${status === SystemStatus.IDLE ? 'bg-zinc-600' : status === SystemStatus.COMPLETED ? 'bg-green-500' : status === SystemStatus.FAILED ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`}></div>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{status}</span>
        <div className="w-px h-6 bg-white/10"></div>
        <span className="text-xs text-zinc-400 font-bold min-w-[200px]">
          {status === SystemStatus.FAILED ? "Error: OutOfMemory. High Settings required." : "Agent monitoring environment..."}
        </span>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean; value?: string }> = ({ label, active, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-zinc-500 tracking-tight">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="text-[10px] font-black text-zinc-300">{value}</span>}
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
    </div>
  </div>
);

export default App;
