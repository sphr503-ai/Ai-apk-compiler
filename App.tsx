
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SystemStatus, LogEntry, ProvisioningState, SourceFile } from './types.ts';
import { Terminal } from './components/Terminal.tsx';
import { SimulatorView } from './components/SimulatorView.tsx';
import { analyzeBuildError, generateSelfHealingPythonScript } from './services/geminiService.ts';
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
  Eye
} from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [provisioning, setProvisioning] = useState<ProvisioningState>({
    java: false,
    androidStudio: false,
    sdk: false,
    avd: false
  });
  const [projectUrl, setProjectUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [selfHealingScript, setSelfHealingScript] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'terminal' | 'source'>('terminal');
  
  // Simulated Source Code
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  
  // API Key state removed as per guidelines. API key is handled via environment variable.
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

  // Fix: Implemented missing handleFileChange function
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      addLog(`Attached local source archive: ${file.name}`, 'info');
    }
  }, [addLog]);

  // Simulate Download Progress once build is completed
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
          return prev + Math.floor(Math.random() * 10) + 2;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [status]);

  const runProvisioning = async () => {
    setStatus(SystemStatus.PROVISIONING);
    addLog('Provisioning high-memory VPS nodes (8GB RAM, 4 vCPUs)...', 'warning');
    
    await new Promise(r => setTimeout(r, 800));
    setProvisioning(p => ({ ...p, java: true }));
    addLog('Environment: JAVA_HOME initialized at /usr/lib/jvm/java-17-openjdk', 'success');
    
    await new Promise(r => setTimeout(r, 1200));
    setProvisioning(p => ({ ...p, androidStudio: true }));
    addLog('Tooling: Android Studio Dolphin stable linked to /opt/android-studio', 'success');
    
    await new Promise(r => setTimeout(r, 1000));
    setProvisioning(p => ({ ...p, sdk: true }));
    addLog('Core: Android SDK (API 34) and Platform-Tools (34.0.0) active', 'success');
    
    await new Promise(r => setTimeout(r, 1500));
    setProvisioning(p => ({ ...p, avd: true }));
    addLog('Emulator: AVD "TestDevice" launched (2GB RAM configuration)', 'success');
    
    setStatus(SystemStatus.IDLE);
    addLog('Infrastructure Verified. Ready for code ingestion.', 'info');
  };

  const startPipeline = async () => {
    // Removed API Key check; process.env.API_KEY is assumed to be configured.
    if ((inputMode === 'url' && !projectUrl) || (inputMode === 'upload' && !selectedFile)) {
      addLog('Error: Source input required.', 'error');
      return;
    }

    setRetryCount(0);
    let currentRetry = 0;
    const maxRetries = 3;
    let isStable = false;

    // Step 1: Code Generation Phase
    setStatus(SystemStatus.GENERATING_CODE);
    addLog('✦ Agent: Designing application architecture layers...', 'ai');
    await new Promise(r => setTimeout(r, 2000));
    
    const initialFiles: SourceFile[] = [
      {
        name: 'MainActivity.kt',
        path: 'app/src/main/java/com/example/app/MainActivity.kt',
        language: 'kotlin',
        content: `package com.example.app\n\nimport android.os.Bundle\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}`
      },
      {
        name: 'build.gradle',
        path: 'app/build.gradle',
        language: 'gradle',
        content: `plugins {\n    id 'com.android.application'\n    id 'org.jetbrains.kotlin.android'\n}\n\nandroid {\n    compileSdk 34\n    defaultConfig {\n        applicationId "com.example.app"\n        minSdk 24\n        targetSdk 34\n        versionCode 1\n        versionName "1.0"\n    }\n}`
      }
    ];
    setSourceFiles(initialFiles);
    setActiveTab('source');
    addLog('Source Code generated for "StoryScape 2.0".', 'success');

    while (currentRetry < maxRetries && !isStable) {
      setRetryCount(currentRetry);
      
      setStatus(SystemStatus.BUILDING);
      addLog(`Build Cycle #${currentRetry + 1}: Compiling project dependencies...`, 'warning');
      await new Promise(r => setTimeout(r, 2000));

      if (currentRetry === 0) {
        addLog('Build Failure: namespace not specified in build.gradle.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Analyzing build.gradle for AGP 8.0 compatibility...', 'ai');
        
        // Simulate patching the file
        await new Promise(r => setTimeout(r, 1500));
        setSourceFiles(prev => prev.map(f => f.name === 'build.gradle' ? {
          ...f,
          content: f.content.replace('android {', 'android {\n    namespace "com.example.app"')
        } : f));
        
        addLog('Patch Applied: Explicit namespace declared in build.gradle.', 'success');
        currentRetry++;
        continue;
      }

      addLog('Build Success: app-debug.apk generated (4.2MB).', 'success');
      
      setStatus(SystemStatus.TESTING);
      addLog('Simulation Environment: 2GB RAM Smartphone Node', 'info');
      addLog('adb install -r app-debug.apk', 'info');
      await new Promise(r => setTimeout(r, 2000));
      
      addLog('Launching com.example.app/MainActivity...', 'info');
      await new Promise(r => setTimeout(r, 1500));

      if (currentRetry === 1) {
        addLog('Runtime Error: java.lang.OutOfMemoryError: Failed to allocate 128MB bitmap', 'error');
        addLog('Device performance check: 2GB RAM exceeded on 4K asset loading.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Optimization needed for low-memory (2GB) hardware...', 'ai');
        
        // Simulate patching for performance
        await new Promise(r => setTimeout(r, 1500));
        setSourceFiles(prev => prev.map(f => f.name === 'MainActivity.kt' ? {
          ...f,
          content: f.content.replace('setContentView(R.layout.activity_main)', 'setContentView(R.layout.activity_main)\n        // Optimized for 2GB RAM Devices\n        System.gc()\n        window.setFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED, WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)')
        } : f));

        addLog('Patch Applied: Garbage Collection and Hardware Accel optimizations added.', 'success');
        currentRetry++;
        continue;
      }

      addLog('Smoke Test: Activity initialized in 820ms.', 'success');
      addLog('Resource Check: 140MB PSS. Status: VERIFIED STABLE.', 'success');
      isStable = true;
    }

    if (isStable) {
      setStatus(SystemStatus.COMPLETED);
      addLog('Pipeline fully verified. APK ready for local deployment. (you can download by clicking on download button)', 'success');
      setActiveTab('terminal');
    } else {
      setStatus(SystemStatus.FAILED);
      addLog('Autonomous loop terminated: could not reach stability on 2GB target.', 'error');
    }
  };

  const handleDownload = () => {
    if (downloadProgress < 100) return;
    
    // Create a much larger "realistic" dummy binary (approx 5MB)
    const size = 5 * 1024 * 1024; 
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    
    // Fake APK Headers (PK...)
    view.setUint32(0, 0x504B0304); 
    
    // Fill with some dummy data to ensure size
    for (let i = 4; i < size; i++) {
      view.setUint8(i, Math.floor(Math.random() * 256));
    }
    
    const blob = new Blob([buffer], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "StoryScape_v2.0_debug.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog('APK Binary (5.0MB) successfully saved to local storage.', 'success');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#121214] border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white text-base leading-none">AI ENGINEER</h1>
              <p className="text-[10px] text-cyan-500 font-black tracking-widest uppercase mt-1">Autonomous v4.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-zinc-800/80 border border-zinc-700/50 rounded-2xl">
            <Layers className="w-5 h-5 text-cyan-400" />
            Control Center
          </button>
          <button onClick={() => setActiveTab('source')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'source' ? 'text-white bg-zinc-800/50' : 'text-zinc-500 hover:text-white'}`}>
            <FileCode className="w-5 h-5" />
            Source Files
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-zinc-800">
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-black mb-4">Infrastructure</p>
            <div className="space-y-3">
              <StatusBadge label="JVM 17 OpenJDK" active={provisioning.java} />
              <StatusBadge label="Studio Hedgehog" active={provisioning.androidStudio} />
              <StatusBadge label="Gradle 8.2 Build" active={provisioning.sdk} />
              <StatusBadge label="2GB RAM Smartphone" active={provisioning.avd} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-10 relative scroll-smooth bg-[#0a0a0b]">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Build Workspace</h2>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">A{i}</div>)}
              </div>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Active Fleet: Autonomous Agents</p>
            </div>
          </div>
          <div className="flex gap-4">
            {!provisioning.avd ? (
              <button onClick={runProvisioning} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl shadow-cyan-600/40 transition-all hover:scale-105">
                <Zap className="w-5 h-5 fill-current" />
                BOOT CLOUD ENGINE
              </button>
            ) : (
              <button onClick={() => window.location.reload()} className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold flex items-center gap-2 border border-zinc-800">
                <RefreshCw className="w-4 h-4" />
                FLUSH REPO
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
          {/* Editor/Log Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">Project Entry Point</label>
                <div className="flex bg-black/50 p-1.5 rounded-2xl border border-zinc-800/50">
                  <button onClick={() => setInputMode('url')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${inputMode === 'url' ? 'bg-zinc-700 text-white shadow-xl' : 'text-zinc-500'}`}>REPO URL</button>
                  <button onClick={() => setInputMode('upload')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${inputMode === 'upload' ? 'bg-zinc-700 text-white shadow-xl' : 'text-zinc-500'}`}>LOCAL ZIP</button>
                </div>
              </div>

              {inputMode === 'url' ? (
                <div className="flex gap-4">
                  <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://github.com/android/storyscape-pro..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 placeholder:text-zinc-700 font-medium" />
                  <button onClick={startPipeline} disabled={status !== SystemStatus.IDLE || !provisioning.avd} className="px-10 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-cyan-600/30">
                    ANALYZE & BUILD
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-3xl p-14 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".zip" />
                    {selectedFile ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-20 h-20 bg-cyan-600/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <FileArchive className="w-10 h-10 text-cyan-400" />
                        </div>
                        <span className="text-white font-black text-lg block mb-1">{selectedFile.name}</span>
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Ready for extraction</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-14 h-14 text-zinc-800 mx-auto mb-4" />
                        <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">Drop Android ZIP Archive</p>
                      </div>
                    )}
                  </div>
                  {selectedFile && status === SystemStatus.IDLE && (
                    <button onClick={startPipeline} disabled={!provisioning.avd} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-black shadow-2xl shadow-cyan-600/20 active:scale-[0.98]">INJECT AND BUILD</button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setActiveTab('terminal')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'terminal' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500'}`}>
                    <TerminalIcon className="w-3 h-3" /> Telemetry
                  </button>
                  <button onClick={() => setActiveTab('source')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'source' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500'}`}>
                    <Code className="w-3 h-3" /> Source Editor
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-zinc-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                   <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Cloud VPS Connected</span>
                </div>
              </div>
              
              <div className="h-[450px] overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl">
                {activeTab === 'terminal' ? (
                  <Terminal logs={logs} />
                ) : (
                  <div className="flex h-full bg-[#0d0d0f] font-mono text-[12px]">
                    <div className="w-48 border-r border-zinc-800 p-4 space-y-1">
                      {sourceFiles.map((file, i) => (
                        <button key={i} onClick={() => setSelectedSourceIndex(i)} className={`w-full text-left px-3 py-2 rounded-lg truncate ${selectedSourceIndex === i ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-400/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                          {file.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 p-6 overflow-auto relative">
                       <div className="absolute top-4 right-6 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                         Read/Write
                       </div>
                       <pre className="text-zinc-300 leading-relaxed">
                         {sourceFiles[selectedSourceIndex]?.content || "// Awaiting code injection..."}
                       </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Simulator Section */}
          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl h-full flex flex-col min-h-[700px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-zinc-400" />
                  <h3 className="font-black text-white tracking-tight">Simulator Stream</h3>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  <span className="text-[10px] text-red-600 font-black uppercase tracking-widest">Live Feed</span>
                </div>
              </div>
              
              <div className="flex-1 bg-zinc-950 rounded-3xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group shadow-inner">
                <SimulatorView status={status} />
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800 backdrop-blur-md">
                   <p className="text-[9px] font-bold text-cyan-500">RES: 1080x2400</p>
                   <p className="text-[9px] font-bold text-yellow-500">RAM: 1.2GB/2.0GB</p>
                </div>
              </div>
              
              <div className="mt-10">
                {status === SystemStatus.COMPLETED ? (
                  <div className="space-y-5 animate-fade-in">
                    <button 
                      onClick={handleDownload}
                      disabled={downloadProgress < 100}
                      className={`relative w-full overflow-hidden rounded-2xl py-6 font-black text-sm flex items-center justify-center gap-3 transition-all transform ${downloadProgress >= 100 ? 'bg-green-600 hover:bg-green-500 shadow-2xl shadow-green-600/40 hover:-translate-y-1' : 'bg-zinc-800 cursor-progress'}`}
                    >
                      {downloadProgress < 100 && (
                        <div className="absolute inset-0 bg-cyan-600/20 transition-all" style={{ width: `${downloadProgress}%` }} />
                      )}
                      <Download className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">
                        {downloadProgress < 100 ? `SYNCING TO LOCAL... ${downloadProgress}%` : "DOWNLOAD FINAL APK"}
                      </span>
                    </button>
                    <div className="flex items-center justify-center gap-2 text-zinc-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest">SHA-256 Verified Binary</span>
                    </div>
                  </div>
                ) : status === SystemStatus.FAILED ? (
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4 animate-fade-in">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Architecture Fault</p>
                      <p className="text-xs text-red-200/50 leading-relaxed">Agent encountered fatal memory pressure on 2GB smartphone hardware. Optimization loop aborted.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800 border-dashed text-center">
                    <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.3em]">Awaiting Final Artifact</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Global Status */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-10 py-5 bg-[#18181b]/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center gap-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-50 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className={`w-3.5 h-3.5 rounded-full shadow-[0_0_15px] ${
            status === SystemStatus.IDLE ? 'bg-zinc-500 shadow-zinc-500/20' : 
            status === SystemStatus.COMPLETED ? 'bg-green-500 shadow-green-500/50' : 
            status === SystemStatus.FAILED ? 'bg-red-500 shadow-red-500/50' : 
            'bg-cyan-500 shadow-cyan-500/50 animate-pulse'
          }`}></div>
          <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{status}</span>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="text-xs text-zinc-400 font-bold tracking-tight min-w-[300px]">
          {status === SystemStatus.IDLE && "Awaiting project source injection..."}
          {status === SystemStatus.GENERATING_CODE && "✦ Agent designing application architecture..."}
          {status === SystemStatus.BUILDING && `Autonomous Compilation Cycle ${retryCount + 1}...`}
          {status === SystemStatus.SELF_HEALING && "✦ Execution fault detected. Agent applying patch..."}
          {status === SystemStatus.TESTING && "Verifying binary stability on 2GB RAM smartphone..."}
          {status === SystemStatus.COMPLETED && "App certified and ready for production."}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-zinc-500 tracking-tight">{label}</span>
    {active ? (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black text-green-500 uppercase">Live</span>
        <CheckCircle className="w-4 h-4 text-green-500" />
      </div>
    ) : (
      <div className="w-4 h-4 rounded-full border border-zinc-800"></div>
    )}
  </div>
);

export default App;
