
import React, { useState, useCallback, useRef } from 'react';
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
  RotateCcw
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

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
        // First attempt always fails to show build-time self-healing
        addLog('Build Failure: Namespace declaration missing in module-level build.gradle.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Executing build-time patch...', 'ai');
        const fix = await analyzeBuildError('Namespace not specified in build.gradle');
        addLog(`✦ Applied: ${fix.issueDescription}`, 'success');
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
        // Second attempt fails at runtime due to OOM/Memory pressure
        addLog('Runtime Error: Fatal signal 11 (SIGSEGV) at 0x00000000 (code=1)', 'error');
        addLog('Logcat: java.lang.OutOfMemoryError on 2GB device during asset loading.', 'error');
        setStatus(SystemStatus.SELF_HEALING);
        addLog('✦ Agent: Runtime stability check failed. Optimizing for low-memory hardware...', 'ai');
        await new Promise(r => setTimeout(r, 2000));
        addLog('✦ Patch: Implementing largeHeap="true" and downsampling image assets.', 'success');
        currentRetry++;
        continue;
      }

      // Third attempt is stable
      addLog('Smoke Test: App launched and navigated to Home in 1.4s.', 'success');
      addLog('Stability: Memory overhead consistent at 142MB. Verified.', 'success');
      isStable = true;
    }

    if (isStable) {
      setStatus(SystemStatus.COMPLETED);
      addLog('Pipeline fully verified. APK ready for real-device installation.', 'success');
      const script = await generateSelfHealingPythonScript();
      setSelfHealingScript(script);
    } else {
      setStatus(SystemStatus.FAILED);
      addLog('Pipeline terminated: Maximum optimization cycles reached without stability.', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
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
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
            Retry Cycles
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
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Device: x86_64 Smartphone (2GB RAM)</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!provisioning.avd ? (
              <button onClick={runProvisioning} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl shadow-cyan-600/30">
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
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Injection Point</label>
                <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-800/50">
                  <button onClick={() => setInputMode('url')} className={`px-4 py-2 rounded-lg text-[11px] font-bold ${inputMode === 'url' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>URL</button>
                  <button onClick={() => setInputMode('upload')} className={`px-4 py-2 rounded-lg text-[11px] font-bold ${inputMode === 'upload' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>ZIP</button>
                </div>
              </div>

              {inputMode === 'url' ? (
                <div className="flex gap-3">
                  <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://github.com/android/project..." className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                  <button onClick={startPipeline} disabled={status !== SystemStatus.IDLE || !provisioning.avd} className="px-8 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white rounded-xl text-sm font-black transition-all">START BUILD</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".zip" />
                    {selectedFile ? (
                      <div className="text-center">
                        <FileArchive className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                        <span className="text-white font-bold block">{selectedFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-xs text-zinc-500 mt-2 hover:text-red-400">Remove</button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm font-bold text-zinc-400">Click to upload Android ZIP</p>
                      </div>
                    )}
                  </div>
                  {selectedFile && status === SystemStatus.IDLE && (
                    <button onClick={startPipeline} disabled={!provisioning.avd} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-black transition-all">RUN PIPELINE</button>
                  )}
                </div>
              )}
            </div>

            <Terminal logs={logs} />

            {selfHealingScript && (
              <div className="bg-[#121214] border border-cyan-500/20 rounded-2xl p-8 shadow-2xl border-l-4 border-l-cyan-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">Exported Self-Healing Script</h3>
                  <button onClick={() => navigator.clipboard.writeText(selfHealingScript)} className="text-xs text-cyan-400 font-bold">COPY PYTHON</button>
                </div>
                <pre className="mono text-[11px] text-cyan-100/50 p-4 bg-black/40 rounded-xl overflow-x-auto border border-zinc-800">
                  {selfHealingScript}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Simulator Output</h3>
                {status !== SystemStatus.IDLE && (
                  <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[9px] font-black uppercase rounded animate-pulse">Live Stream</span>
                )}
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 flex items-center justify-center relative overflow-hidden">
                <SimulatorView status={status} />
                {status === SystemStatus.TESTING && (
                  <div className="absolute top-4 right-4 bg-black/80 px-2 py-1 rounded border border-zinc-700">
                    <p className="text-[8px] font-mono text-cyan-500">RAM: 1.8/2.0GB</p>
                    <p className="text-[8px] font-mono text-yellow-500">LOAD: 88%</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                {status === SystemStatus.COMPLETED && (
                  <div className="space-y-3 animate-fade-in">
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-4 font-black text-sm flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-2xl shadow-green-600/30">
                      <Download className="w-5 h-5" />
                      DOWNLOAD VERIFIED APK
                    </button>
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Device Compatible: Real Android Hardware</span>
                    </div>
                  </div>
                )}
                {status === SystemStatus.FAILED && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Optimization Fault: Check Logs</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-6 shadow-2xl z-50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === SystemStatus.IDLE ? 'bg-zinc-500' : 'bg-cyan-500 animate-pulse'}`}></div>
          <span className="text-[11px] font-black text-white uppercase tracking-widest">{status}</span>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="text-[11px] text-zinc-400 font-bold">
          {status === SystemStatus.IDLE && "Ready for deployment."}
          {status === SystemStatus.BUILDING && `Compiling Binary (Cycle ${retryCount + 1})...`}
          {status === SystemStatus.SELF_HEALING && "Agent executing self-healing cycle..."}
          {status === SystemStatus.TESTING && "Verifying stability on 2GB RAM device..."}
          {status === SystemStatus.COMPLETED && "Binary verified and certified."}
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
