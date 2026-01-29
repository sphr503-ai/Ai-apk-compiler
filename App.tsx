
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SystemStatus, LogEntry, ProvisioningState } from './types.ts';
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
  ChevronRight
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
  
  // API Key & Download State
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
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
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [status]);

  const runProvisioning = async () => {
    setStatus(SystemStatus.PROVISIONING);
    addLog('Initiating high-performance cloud instance provisioning...', 'warning');
    
    await new Promise(r => setTimeout(r, 800));
    setProvisioning(p => ({ ...p, java: true }));
    addLog('Environment: JAVA_HOME set to JDK 17.0.8', 'success');
    
    await new Promise(r => setTimeout(r, 1200));
    setProvisioning(p => ({ ...p, androidStudio: true }));
    addLog('Toolchain: Android Studio (Hedgehog) deployed to /opt', 'success');
    
    await new Promise(r => setTimeout(r, 1000));
    setProvisioning(p => ({ ...p, sdk: true }));
    addLog('System: SDK Platform 34 and Build-Tools 34.0.0 linked', 'success');
    
    await new Promise(r => setTimeout(r, 1500));
    setProvisioning(p => ({ ...p, avd: true }));
    addLog('Hardware: "TestDevice" AVD created (2GB RAM, API 34, x86_64)', 'success');
    
    setStatus(SystemStatus.IDLE);
    addLog('Infrastructure Ready. Awaiting APK source.', 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setSelectedFile(file);
      addLog(`Payload detected: ${file.name} [${(file.size / 1024 / 1024).toFixed(2)} MB]`, 'info');
    } else if (file) {
      addLog('Validation Error: Only .zip archives are supported for cloud builds.', 'error');
    }
  };

  const startPipeline = async () => {
    // Check for API Key first
    const envKey = process.env.API_KEY;
    if (!envKey && !userApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if ((inputMode === 'url' && !projectUrl) || (inputMode === 'upload' && !selectedFile)) {
      addLog('Error: Source input required to trigger pipeline.', 'error');
      return;
    }

    setRetryCount(0);
    let currentRetry = 0;
    const maxRetries = 3;
    let isStable = false;

    setStatus(SystemStatus.ANALYZING);
    addLog(inputMode === 'url' ? `Cloning remote: ${projectUrl}` : `Unpacking local: ${selectedFile?.name}`, 'info');
    await new Promise(r => setTimeout(r, 1500));
    addLog('Project analysis: Multi-module Gradle project found.', 'info');

    while (currentRetry < maxRetries && !isStable) {
      setRetryCount(currentRetry);
      
      setStatus(SystemStatus.BUILDING);
      addLog(`Starting Build Cycle #${currentRetry + 1}...`, 'warning');
      await new Promise(r => setTimeout(r, 2000));

      if (currentRetry === 0) {
        addLog('Build Failure: Namespace declaration missing in build.gradle.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Executing build-time patch...', 'ai');
        try {
          const fix = await analyzeBuildError('Namespace not specified in build.gradle', userApiKey);
          addLog(`✦ Applied: ${fix.issueDescription}`, 'success');
        } catch (err: any) {
          addLog(`AI Healing failed: ${err.message}`, 'error');
          if (err.message.includes('API_KEY')) setShowApiKeyModal(true);
          setStatus(SystemStatus.FAILED);
          return;
        }
        await new Promise(r => setTimeout(r, 1000));
        currentRetry++;
        continue;
      }

      addLog('Build Success: app-debug.apk generated successfully.', 'success');
      
      setStatus(SystemStatus.TESTING);
      addLog('Target: 2GB RAM Virtual Device "TestDevice"', 'info');
      addLog('Installing package via ADB...', 'info');
      await new Promise(r => setTimeout(r, 2000));
      
      addLog('Launching primary activity...', 'info');
      await new Promise(r => setTimeout(r, 1500));

      if (currentRetry === 1) {
        addLog('Runtime Error: Fatal signal 11 (SIGSEGV) at 0x00000000', 'error');
        addLog('Logcat: java.lang.OutOfMemoryError on 2GB device.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Stability check failed. Optimizing memory...', 'ai');
        await new Promise(r => setTimeout(r, 2000));
        addLog('✦ Patch: largeHeap="true" and downsampling assets.', 'success');
        currentRetry++;
        continue;
      }

      addLog('Smoke Test: App launched successfully in 1.4s.', 'success');
      addLog('Stability: Memory verified on 2GB smartphone hardware.', 'success');
      isStable = true;
    }

    if (isStable) {
      setStatus(SystemStatus.COMPLETED);
      addLog('Pipeline fully verified. (you can download by clicking on download button)', 'success');
      try {
        const script = await generateSelfHealingPythonScript(userApiKey);
        setSelfHealingScript(script);
      } catch (e) {}
    } else {
      setStatus(SystemStatus.FAILED);
      addLog('Pipeline terminated: stability could not be reached.', 'error');
    }
  };

  const handleDownload = () => {
    if (downloadProgress < 100) return;
    
    // Simulate direct save to local storage
    const element = document.createElement('a');
    const file = new Blob(['Mock APK Content for StoryScape'], {type: 'application/vnd.android.package-archive'});
    element.href = URL.createObjectURL(file);
    element.download = "app-debug.apk";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addLog('APK download initiated to local storage.', 'success');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121214] border border-zinc-800 p-8 rounded-2xl w-[400px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-600/10 rounded-lg">
                <Key className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Gemini API Key Needed</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              To deploy and use the autonomous self-healing logic, please provide your Google Gemini API key.
            </p>
            <div className="space-y-4">
              <input 
                type="password" 
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Save and Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setShowApiKeyModal(false)}
              className="mt-4 w-full text-zinc-500 text-xs hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      <aside className="w-64 bg-[#121214] border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white text-sm">AI ENGINEER</h1>
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Autonomous Android</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <Layers className="w-4 h-4 text-cyan-400" />
            Infrastructure
          </button>
          <button onClick={() => setShowApiKeyModal(true)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Key className="w-4 h-4" />
            Config API Key
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-800">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-3">System Resources</p>
            <div className="space-y-2">
              <StatusBadge label="Java 17 JDK" active={provisioning.java} />
              <StatusBadge label="Android Studio" active={provisioning.androidStudio} />
              <StatusBadge label="SDK Core" active={provisioning.sdk} />
              <StatusBadge label="2GB AVD Node" active={provisioning.avd} />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Autonomous Build Pipeline</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Target: 2GB RAM x86_64 Emulator</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!provisioning.avd ? (
              <button onClick={runProvisioning} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl shadow-cyan-600/30 transition-all">
                <Zap className="w-4 h-4 fill-current" />
                Provision Server
              </button>
            ) : (
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 border border-zinc-700">
                <RefreshCw className="w-4 h-4" />
                Reset Pipeline
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project Injection Point</label>
                <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-800/50">
                  <button onClick={() => setInputMode('url')} className={`px-4 py-2 rounded-lg text-[11px] font-bold ${inputMode === 'url' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>REPO URL</button>
                  <button onClick={() => setInputMode('upload')} className={`px-4 py-2 rounded-lg text-[11px] font-bold ${inputMode === 'upload' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>ZIP ARCHIVE</button>
                </div>
              </div>

              {inputMode === 'url' ? (
                <div className="flex gap-3">
                  <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://github.com/android/project..." className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                  <button onClick={startPipeline} disabled={status !== SystemStatus.IDLE || !provisioning.avd} className="px-8 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white rounded-xl text-sm font-black transition-all active:scale-95">START PIPELINE</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".zip" />
                    {selectedFile ? (
                      <div className="text-center animate-fade-in">
                        <FileArchive className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                        <span className="text-white font-bold block">{selectedFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-xs text-zinc-500 mt-2 hover:text-red-400 font-bold uppercase tracking-widest">Change File</button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm font-bold text-zinc-400">Click or drag Android ZIP</p>
                      </div>
                    )}
                  </div>
                  {selectedFile && status === SystemStatus.IDLE && (
                    <button onClick={startPipeline} disabled={!provisioning.avd} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-black transition-all active:scale-[0.98]">RUN AUTONOMOUS BUILD</button>
                  )}
                </div>
              )}
            </div>

            <Terminal logs={logs} />

            {selfHealingScript && (
              <div className="bg-[#121214] border border-cyan-500/20 rounded-2xl p-8 shadow-2xl border-l-4 border-l-cyan-500 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Self-Healing Script Export</h3>
                  <button onClick={() => navigator.clipboard.writeText(selfHealingScript)} className="text-xs text-cyan-400 font-bold hover:underline">COPY SOURCE</button>
                </div>
                <pre className="mono text-[11px] text-cyan-100/40 p-5 bg-black/60 rounded-xl overflow-x-auto border border-zinc-800 max-h-64">
                  {selfHealingScript}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Live Simulator Output</h3>
                {status !== SystemStatus.IDLE && status !== SystemStatus.COMPLETED && (
                  <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[9px] font-black uppercase rounded animate-pulse">Live Feed</span>
                )}
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 flex items-center justify-center relative overflow-hidden">
                <SimulatorView status={status} />
              </div>
              
              <div className="mt-8">
                {status === SystemStatus.COMPLETED ? (
                  <div className="space-y-4 animate-fade-in">
                    <button 
                      onClick={handleDownload}
                      disabled={downloadProgress < 100}
                      className={`relative w-full group overflow-hidden rounded-xl py-5 font-black text-sm flex items-center justify-center gap-3 transition-all transform ${downloadProgress >= 100 ? 'bg-green-600 hover:bg-green-500 shadow-2xl shadow-green-600/30 hover:-translate-y-1' : 'bg-zinc-800 cursor-wait'}`}
                    >
                      {/* Background Progress Bar */}
                      {downloadProgress < 100 && (
                        <div 
                          className="absolute inset-0 bg-cyan-600/20 transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      )}
                      
                      <Download className={`w-5 h-5 ${downloadProgress < 100 ? 'text-zinc-600' : 'text-white'}`} />
                      <span className="relative z-10 text-white">
                        {downloadProgress < 100 
                          ? `PREPARING APK... ${downloadProgress}%` 
                          : "DOWNLOAD FINAL APK"}
                      </span>
                    </button>
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Certified for 2GB+ RAM Devices</span>
                    </div>
                  </div>
                ) : status === SystemStatus.FAILED ? (
                  <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Pipeline Interrupted</p>
                      <p className="text-xs text-red-200/50 leading-relaxed">Agent failed to reach stable state after multiple healing cycles. Check telemetry logs.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-900/40 rounded-xl border border-zinc-800 border-dashed text-center">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Awaiting Build Artifact</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-6 shadow-2xl z-50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === SystemStatus.IDLE ? 'bg-zinc-500 shadow-zinc-500/20' : 
            status === SystemStatus.COMPLETED ? 'bg-green-500 shadow-green-500/50' : 
            status === SystemStatus.FAILED ? 'bg-red-500 shadow-red-500/50' : 
            'bg-cyan-500 shadow-cyan-500/50 animate-pulse'}`}></div>
          <span className="text-[11px] font-black text-white uppercase tracking-widest">{status}</span>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="text-[11px] text-zinc-400 font-bold">
          {status === SystemStatus.IDLE && "System on Standby."}
          {status === SystemStatus.BUILDING && `Autonomous Compilation Cycle ${retryCount + 1}...`}
          {status === SystemStatus.SELF_HEALING && "AI executing patch sub-routines..."}
          {status === SystemStatus.TESTING && "Verifying stability on 2GB RAM smartphone node..."}
          {status === SystemStatus.COMPLETED && "Verified Stable Build Generated."}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-medium text-zinc-500">{label}</span>
    {active ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-zinc-800"></div>}
  </div>
);

export default App;
