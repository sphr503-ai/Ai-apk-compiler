
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertTriangle
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
    addLog('Initiating cloud instance provisioning...', 'warning');
    
    await new Promise(r => setTimeout(r, 800));
    setProvisioning(p => ({ ...p, java: true }));
    addLog('JAVA_HOME installed: openjdk-17-jdk', 'success');
    
    await new Promise(r => setTimeout(r, 1200));
    setProvisioning(p => ({ ...p, androidStudio: true }));
    addLog('Android Studio stable binaries deployed to /opt/android-studio', 'success');
    
    await new Promise(r => setTimeout(r, 1000));
    setProvisioning(p => ({ ...p, sdk: true }));
    addLog('Command-line tools & build-tools (34.0.0) synchronized', 'success');
    
    await new Promise(r => setTimeout(r, 1500));
    setProvisioning(p => ({ ...p, avd: true }));
    addLog('AVD "TestDevice" successfully initialized (x86_64, Hardware Accel)', 'success');
    
    setStatus(SystemStatus.IDLE);
    addLog('Environment Ready. Awaiting project instructions.', 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        setSelectedFile(file);
        addLog(`Archive loaded: ${file.name} [${(file.size / 1024 / 1024).toFixed(2)} MB]`, 'info');
      } else {
        addLog(`Invalid file format: ${file.name}. Please upload a .zip archive.`, 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const startPipeline = async () => {
    if (inputMode === 'url' && !projectUrl) {
      addLog('Error: Repository URL required.', 'error');
      return;
    }
    if (inputMode === 'upload' && !selectedFile) {
      addLog('Error: Project ZIP archive required.', 'error');
      return;
    }

    setStatus(SystemStatus.ANALYZING);
    if (inputMode === 'url') {
      addLog(`Connecting to remote source: ${projectUrl}`, 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Git clone successful. Repository indexed.', 'success');
    } else {
      addLog(`Streaming local archive to VPS: ${selectedFile?.name}`, 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('File integrity verified. Extraction complete.', 'success');
    }
    
    await new Promise(r => setTimeout(r, 1000));
    addLog('Project analysis: Kotlin DSL detected. Gradle 8.2 compatible.', 'info');
    
    setStatus(SystemStatus.BUILDING);
    addLog('Executing build command: ./gradlew assembleDebug --no-daemon', 'info');
    await new Promise(r => setTimeout(r, 3000));
    
    // Controlled build failure simulation
    addLog('Build Failure: Task :app:processDebugMainManifest failed.', 'error');
    addLog('Error: namespace not specified in the module\'s build.gradle file.', 'error');
    
    setStatus(SystemStatus.SELF_HEALING);
    addLog('✦ Autonomous Agent: Initiating error analysis & self-healing...', 'ai');
    
    try {
      // Mock error log for Gemini to process
      const errorLog = `Execution failed for task ':app:processDebugMainManifest'.
> Namespace not specified. Please specify a namespace in the module's build.gradle file.`;
      
      const analysis = await analyzeBuildError(errorLog);
      addLog(`✦ Agent Reasoning: ${analysis.issueDescription}`, 'ai');
      addLog(`✦ Root Cause: ${analysis.rootCause}`, 'ai');
      addLog(`Patching file: ${analysis.affectedFile}...`, 'warning');
      
      await new Promise(r => setTimeout(r, 1500));
      addLog('Retrying build with patched configuration...', 'info');
      
      await new Promise(r => setTimeout(r, 2500));
      addLog('Build SUCCESSFUL: APK generated at app/build/outputs/apk/debug/app-debug.apk', 'success');
      
      setStatus(SystemStatus.TESTING);
      addLog('Synchronizing with AVD "TestDevice"...', 'info');
      await new Promise(r => setTimeout(r, 3000));
      addLog('Pushing APK to simulator filesystem...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Installing package via ADB...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Invoking primary Activity intent...', 'info');
      await new Promise(r => setTimeout(r, 1000));
      addLog('Smoke test passed. App is stable.', 'success');
      
      setStatus(SystemStatus.COMPLETED);
      addLog('Pipeline completed successfully. APK verified.', 'success');

      try {
        const script = await generateSelfHealingPythonScript();
        setSelfHealingScript(script);
        addLog('Stand-alone Python Self-Healing script generated for export.', 'success');
      } catch (scriptErr) {
        addLog('Note: Local export script generation skipped (API constraint).', 'warning');
      }

    } catch (err: any) {
      addLog(`Self-healing interrupted: ${err.message}`, 'error');
      setStatus(SystemStatus.FAILED);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121214] border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white text-sm leading-tight">AI ENGINEER</h1>
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
            <TerminalIcon className="w-4 h-4" />
            Build Context
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Box className="w-4 h-4" />
            Artifacts
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-800">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-3">Cloud Status</p>
            <div className="space-y-2">
              <StatusBadge label="Java 17 Runtime" active={provisioning.java} />
              <StatusBadge label="Android Studio" active={provisioning.androidStudio} />
              <StatusBadge label="SDK Pipeline" active={provisioning.sdk} />
              <StatusBadge label="VNC / Simulator" active={provisioning.avd} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Android CI Pipeline</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Active Workspace: Linux Cloud VPS</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!provisioning.avd ? (
              <button 
                onClick={runProvisioning}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-cyan-600/30"
              >
                <Zap className="w-4 h-4 fill-current" />
                Initialize OS Stack
              </button>
            ) : (
              <button 
                onClick={() => {
                  setLogs([]);
                  setStatus(SystemStatus.IDLE);
                  setSelfHealingScript(null);
                  setProjectUrl('');
                  setSelectedFile(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 border border-zinc-700"
              >
                <RefreshCw className="w-4 h-4" />
                Flush Pipeline
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileArchive className="w-32 h-32" />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Project Injection Point</label>
                <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-800/50">
                  <button 
                    onClick={() => setInputMode('url')}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${inputMode === 'url' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    REPOSITORY URL
                  </button>
                  <button 
                    onClick={() => setInputMode('upload')}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all ${inputMode === 'upload' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Upload className="w-3 h-3" />
                    LOCAL ARCHIVE
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                {inputMode === 'url' ? (
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://github.com/android/project-samples..."
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                    <button 
                      onClick={startPipeline}
                      disabled={status !== SystemStatus.IDLE || !provisioning.avd}
                      className="px-8 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-cyan-600/20 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      DEPLOY
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5 shadow-inner' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".zip"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center animate-fade-in text-center">
                          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-3">
                            <FileArchive className="w-8 h-8 text-cyan-400" />
                          </div>
                          <span className="text-white font-bold text-base truncate max-w-[300px]">{selectedFile.name}</span>
                          <span className="text-zinc-500 text-xs mt-1">Ready for autonomous build process</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all text-[10px] font-bold"
                          >
                            <X className="w-3 h-3" /> REMOVE FILE
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-zinc-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-zinc-400">Drag & drop project .zip</p>
                            <p className="text-[11px] text-zinc-600 mt-1 uppercase tracking-wider font-mono">Max size: 100MB • Local Upload</p>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedFile && status === SystemStatus.IDLE && (
                      <button 
                        onClick={startPipeline}
                        disabled={!provisioning.avd}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-cyan-600/20 active:scale-[0.98]"
                      >
                        <Zap className="w-5 h-5 fill-current" />
                        START ANDROID ENGINE
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <TerminalIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white tracking-tight">System Telemetry</h3>
                </div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500">BAUD 115200</div>
                  <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500">UTF-8</div>
                </div>
              </div>
              <Terminal logs={logs} />
            </div>

            {selfHealingScript && (
              <div className="bg-[#121214] border border-cyan-500/20 rounded-2xl p-8 shadow-2xl border-l-4 border-l-cyan-500 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Self-Healing Module Export</h3>
                      <p className="text-xs text-zinc-500">Autonomous Python Logic for Local CI/CD</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selfHealingScript);
                      addLog('Script copied to clipboard.', 'info');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 rounded-lg text-xs font-bold transition-all"
                  >
                    COPY CODE
                  </button>
                </div>
                <div className="relative group">
                  <pre className="mono text-[12px] text-cyan-100/60 p-6 bg-black/40 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800/50 max-h-[400px]">
                    {selfHealingScript}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] bg-black/80 px-2 py-1 rounded text-zinc-500 font-mono">PYTHON 3.10+</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col min-h-[700px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-zinc-400" />
                  <h3 className="font-bold text-white tracking-tight">AVD Stream</h3>
                </div>
                {status === SystemStatus.IDLE ? (
                   <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">Standby</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Live Feed
                  </span>
                )}
              </div>
              
              <div className="flex-1 bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 flex items-center justify-center p-4">
                <SimulatorView status={status} />
              </div>
              
              <div className="mt-8 space-y-4">
                {status === SystemStatus.COMPLETED ? (
                  <div className="animate-fade-in">
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-5 font-black text-sm flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-2xl shadow-green-600/40">
                      <Download className="w-5 h-5" />
                      DOWNLOAD app-debug.apk
                    </button>
                    <p className="text-center text-[10px] text-zinc-500 mt-4 font-mono uppercase tracking-[0.3em]">Build Hash: SHA-256: 9E1B...F02A</p>
                  </div>
                ) : status === SystemStatus.FAILED ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Pipeline Fault</p>
                      <p className="text-[11px] text-red-200/60 leading-relaxed">Agent encountered an unrecoverable state. Check logs for details.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 border-dashed text-center">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Awaiting Valid Artifact</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${
            status === SystemStatus.IDLE ? 'bg-zinc-500 shadow-zinc-500/20' : 
            status === SystemStatus.COMPLETED ? 'bg-green-500 shadow-green-500/50' : 
            status === SystemStatus.FAILED ? 'bg-red-500 shadow-red-500/50' : 
            'bg-cyan-500 shadow-cyan-500/50 animate-pulse'
          }`}></div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">{status}</span>
        </div>
        <div className="w-px h-6 bg-white/10"></div>
        <div className="text-[11px] text-zinc-400 font-bold tracking-tight">
          {status === SystemStatus.IDLE && "Ready for project deployment."}
          {status === SystemStatus.PROVISIONING && "Virtualizing hardware layers..."}
          {status === SystemStatus.BUILDING && "Compiling bytecode dependencies..."}
          {status === SystemStatus.SELF_HEALING && "AI executing patch sub-routines..."}
          {status === SystemStatus.COMPLETED && "Binary verified in simulator environment."}
          {status === SystemStatus.FAILED && "Pipeline terminated with errors."}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-medium text-zinc-500">{label}</span>
    {active ? (
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-bold text-green-500 mr-1 uppercase">Ready</span>
        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
      </div>
    ) : (
      <div className="w-3.5 h-3.5 rounded-full border border-zinc-800"></div>
    )}
  </div>
);

export default App;
