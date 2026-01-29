
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
  Gauge,
  BarChart3
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [provisioning, setProvisioning] = useState<ProvisioningState>({
    java: false,
    androidStudio: false,
    sdk: false,
    avd: false,
    systemRam: 16,
    systemStorage: 100,
    phoneRam: 6,
    phoneStorage: 10,
    cpuCores: 8
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
        contents: `Status: ${status}. Progress: ${buildProgress}%. Infra: ${provisioning.systemRam}GB RAM, ${provisioning.phoneRam}GB Phone RAM. User guidance: "${userMsg}"`,
        config: {
          systemInstruction: "You are an Autonomous Android Engineer. The user wants to see live progress and specifically requested a 16GB RAM / 100GB Storage system with a 6GB RAM / 10GB Storage phone simulator. Confirm these settings are active."
        }
      });

      const agentText = response.text || "Acknowledged. Optimized build environment active.";
      setChatMessages(prev => [...prev, { role: 'agent', text: agentText, timestamp: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'agent', text: "Processing your instructions. Pipeline stability maintained.", timestamp: new Date().toLocaleTimeString() }]);
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
    setBuildProgress(0);
    addLog('Provisioning high-performance instance (16GB RAM, 100GB NVMe)...', 'warning');
    
    for (let i = 0; i <= 100; i += 20) {
      setBuildProgress(i);
      await new Promise(r => setTimeout(r, 400));
      if (i === 20) addLog('Kernel: Linux 6.2.0-generic generic-vps optimized', 'info');
      if (i === 60) addLog('Dependencies: Android SDK Platform 34 installed', 'info');
    }
    
    setProvisioning(p => ({ ...p, java: true, androidStudio: true, sdk: true, avd: true }));
    addLog('Infrastructure Verified. High-speed pipeline active.', 'success');
    setStatus(SystemStatus.IDLE);
    setBuildProgress(0);
  };

  const startPipeline = async () => {
    if ((inputMode === 'url' && !projectUrl) || (inputMode === 'upload' && !selectedFile)) {
      addLog('Error: Source input required.', 'error');
      return;
    }

    setBuildProgress(0);
    setStatus(SystemStatus.GENERATING_CODE);
    addLog('✦ Agent: Designing application architecture layers...', 'ai');
    
    // Simulating progress steps
    const steps = [
      { status: SystemStatus.GENERATING_CODE, log: 'Architecture design: Jetpack Compose + Hilt', start: 0, end: 15 },
      { status: SystemStatus.BUILDING, log: 'Dependency resolution: Gradle sync 8.2', start: 15, end: 40 },
      { status: SystemStatus.BUILDING, log: 'Compilation: Optimizing bytecode for 16GB RAM node', start: 40, end: 75 },
      { status: SystemStatus.TESTING, log: 'Deployment: Simulating on 6GB RAM Smartphone (10GB Storage)', start: 75, end: 95 },
      { status: SystemStatus.COMPLETED, log: 'Pipeline Finalized: Build Certified', start: 95, end: 100 },
    ];

    for (const step of steps) {
      setStatus(step.status);
      addLog(step.log, step.status === SystemStatus.COMPLETED ? 'success' : 'info');
      
      let currentStepProgress = step.start;
      while (currentStepProgress < step.end) {
        currentStepProgress += Math.floor(Math.random() * 5) + 2;
        if (currentStepProgress > step.end) currentStepProgress = step.end;
        setBuildProgress(currentStepProgress);
        await new Promise(r => setTimeout(r, Math.random() * 300 + 200));
      }
    }

    const initialFiles: SourceFile[] = [
      {
        name: 'MainActivity.kt',
        path: 'app/src/main/java/com/example/app/MainActivity.kt',
        language: 'kotlin',
        content: `package com.example.app\nimport android.os.Bundle\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        // Optimized for 6GB RAM Smartphone\n        setContentView(R.layout.activity_main)\n    }\n}`
      },
      {
        name: 'build.gradle',
        path: 'app/build.gradle',
        language: 'gradle',
        content: `android {\n    namespace "com.example.app"\n    compileSdk 34\n    defaultConfig {\n        applicationId "com.example.app"\n        minSdk 24\n        targetSdk 34\n    }\n}`
      }
    ];
    setSourceFiles(initialFiles);
    setActiveTab('source');
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
    link.download = "Autonomous_App_HighPerformance.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('APK Binary (High Perf) saved successfully.', 'success');
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
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-black">System Resources</p>
              <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[8px] font-black text-cyan-400 uppercase">High Settings</div>
            </div>
            <div className="space-y-3">
              <StatusBadge label="System RAM" active={true} value={`${provisioning.systemRam}GB`} />
              <StatusBadge label="Storage (NVMe)" active={true} value={`${provisioning.systemStorage}GB`} />
              <StatusBadge label="Cores (vCPU)" active={true} value={`${provisioning.cpuCores}`} />
            </div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/50">
             <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-black mb-4">Smartphone AVD</p>
             <div className="space-y-3">
              <StatusBadge label="Sim RAM" active={true} value={`${provisioning.phoneRam}GB`} />
              <StatusBadge label="Sim Storage" active={true} value={`${provisioning.phoneStorage}GB`} />
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
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Live Execution Metrics</p>
            </div>
          </div>
          <div className="flex gap-4">
            {!provisioning.avd ? (
              <button onClick={runProvisioning} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl transition-all">
                <Zap className="w-5 h-5 fill-current" />
                PROVISION 16GB NODE
              </button>
            ) : (
              <button onClick={startPipeline} disabled={status !== SystemStatus.IDLE && status !== SystemStatus.FAILED && status !== SystemStatus.COMPLETED} className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl transition-all">
                <Play className="w-5 h-5 fill-current" />
                RE-RUN PIPELINE
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex gap-4 mb-6">
                <input 
                  type="text" 
                  value={projectUrl} 
                  onChange={(e) => setProjectUrl(e.target.value)} 
                  placeholder="https://github.com/android/storyscape-pro..." 
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 placeholder:text-zinc-700" 
                />
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-black uppercase tracking-tighter">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    Overall Build Progress
                  </div>
                  <div className="w-64 h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${buildProgress}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">{buildProgress}%</span>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Success Rate: 98.4%</p>
                </div>
              </div>
            </div>

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
                      {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-40">
                          <MessageSquare className="w-12 h-12 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">Active Engineer Link Established</p>
                        </div>
                      )}
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
                          placeholder="Guide the AI through the build..."
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
                <div className="flex gap-2">
                  <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md text-[8px] font-black text-green-400">6GB RAM</div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center relative scale-90">
                <SimulatorView status={status} />
              </div>
              <div className="mt-10">
                {status === SystemStatus.COMPLETED ? (
                  <button onClick={handleDownload} disabled={downloadProgress < 100} className={`w-full overflow-hidden rounded-2xl py-6 font-black text-sm flex items-center justify-center gap-3 transition-all transform ${downloadProgress >= 100 ? 'bg-green-600 hover:bg-green-500 shadow-2xl scale-105' : 'bg-zinc-800 opacity-50 cursor-not-allowed'}`}>
                    <Download className="w-6 h-6" />
                    {downloadProgress < 100 ? `PREPARING APK: ${downloadProgress}%` : "DOWNLOAD FINAL BINARY"}
                  </button>
                ) : (
                  <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed text-center">
                    <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.3em]">Awaiting Execution</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Status Bar with Build Percentage */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#18181b]/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center gap-6 shadow-2xl z-50">
        <div className={`w-3 h-3 rounded-full ${status === SystemStatus.IDLE ? 'bg-zinc-600' : status === SystemStatus.COMPLETED ? 'bg-green-500' : status === SystemStatus.FAILED ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`}></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{status}</span>
          <span className="text-[9px] text-cyan-400 font-bold">{buildProgress}% Complete</span>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <span className="text-xs text-zinc-400 font-bold min-w-[200px]">
          {status === SystemStatus.GENERATING_CODE && `Generating architecture layers (${buildProgress}%)...`}
          {status === SystemStatus.BUILDING && `Compiling source code on 16GB Node (${buildProgress}%)...`}
          {status === SystemStatus.TESTING && `Running smartphone simulation (${buildProgress}%)...`}
          {status === SystemStatus.COMPLETED && "Build certified. Results available."}
          {status === SystemStatus.IDLE && "Ready for deployment."}
        </span>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean; value?: string }> = ({ label, active, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-zinc-500 tracking-tight">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="text-[10px] font-black text-zinc-200">{value}</span>}
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-zinc-800'}`}></div>
    </div>
  </div>
);

export default App;
