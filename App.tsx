
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
  X
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
    addLog('Starting System Provisioning Phase 1...', 'warning');
    
    await new Promise(r => setTimeout(r, 1000));
    setProvisioning(p => ({ ...p, java: true }));
    addLog('JAVA_HOME set to /usr/lib/jvm/java-17-openjdk-amd64', 'success');
    
    await new Promise(r => setTimeout(r, 1500));
    setProvisioning(p => ({ ...p, androidStudio: true }));
    addLog('Android Studio installed to /opt/android-studio', 'success');
    
    await new Promise(r => setTimeout(r, 1200));
    setProvisioning(p => ({ ...p, sdk: true }));
    addLog('Android SDK Platforms and Build-Tools detected', 'success');
    
    await new Promise(r => setTimeout(r, 1800));
    setProvisioning(p => ({ ...p, avd: true }));
    addLog('AVD "TestDevice" created (2GB RAM, x86_64)', 'success');
    
    setStatus(SystemStatus.IDLE);
    addLog('System ready for project input.', 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      addLog(`File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'info');
    } else if (file) {
      addLog('Error: Please select a valid .zip project archive.', 'error');
    }
  };

  const startPipeline = async () => {
    if (inputMode === 'url' && !projectUrl) {
      addLog('Error: Please provide a Project URL.', 'error');
      return;
    }
    if (inputMode === 'upload' && !selectedFile) {
      addLog('Error: Please upload a ZIP project archive.', 'error');
      return;
    }

    setStatus(SystemStatus.ANALYZING);
    if (inputMode === 'url') {
      addLog(`Cloning repository: ${projectUrl}`, 'info');
    } else {
      addLog(`Unpacking archive: ${selectedFile?.name}`, 'info');
    }
    
    await new Promise(r => setTimeout(r, 2000));
    addLog('Analysis: Kotlin project detected. build.gradle (8.2.0) compatible.', 'info');
    
    setStatus(SystemStatus.BUILDING);
    addLog('Executing command: ./gradlew assembleDebug', 'info');
    await new Promise(r => setTimeout(r, 3000));
    
    // Simulate Build Failure
    addLog('Build FAILED: Namespace not found in AndroidManifest.xml or build.gradle', 'error');
    addLog('Execution failed for task \':app:processDebugMainManifest\'.', 'error');
    
    setStatus(SystemStatus.SELF_HEALING);
    addLog('Invoking Autonomous Self-Healing AI Engine...', 'ai');
    
    try {
      const errorSample = `FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':app:processDebugMainManifest'.
> Namespace not specified. Please specify a namespace in the module's build.gradle file like so:
  android {
      namespace 'com.example.app'
  }`;
      
      const analysis = await analyzeBuildError(errorSample);
      addLog(`AI Analysis: ${analysis.issueDescription}`, 'ai');
      addLog(`Root Cause: ${analysis.rootCause}`, 'ai');
      addLog(`Applying Fix to ${analysis.affectedFile}...`, 'warning');
      
      await new Promise(r => setTimeout(r, 2000));
      addLog('Retrying build with patched configuration...', 'info');
      
      await new Promise(r => setTimeout(r, 3000));
      addLog('Build SUCCESSFUL: Generated app-debug.apk (3.4MB)', 'success');
      
      setStatus(SystemStatus.TESTING);
      addLog('Booting AVD TestDevice...', 'info');
      await new Promise(r => setTimeout(r, 4000));
      addLog('Installing APK via adb install...', 'info');
      await new Promise(r => setTimeout(r, 2000));
      addLog('Launching MainActivity...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Validation: App launched successfully. No crashes found.', 'success');
      
      setStatus(SystemStatus.COMPLETED);
      addLog('Deployment pipeline finished.', 'success');

      try {
        addLog('Generating stand-alone self-healing script for local use...', 'info');
        const script = await generateSelfHealingPythonScript();
        setSelfHealingScript(script);
        addLog('Self-healing script generated successfully.', 'success');
      } catch (scriptErr) {
        addLog('Warning: Could not generate Python script for download, but build was successful.', 'warning');
      }

    } catch (err) {
      addLog('Self-healing failed due to AI API error.', 'error');
      setStatus(SystemStatus.FAILED);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121214] border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-600/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold tracking-tight text-white">AI ENGINEER</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Box className="w-4 h-4" />
            Environments
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <Code className="w-4 h-4" />
            Build Logs
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-800">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-3">Provisioning Status</p>
            <div className="space-y-2">
              <StatusBadge label="Android Studio" active={provisioning.androidStudio} />
              <StatusBadge label="Java 17 JDK" active={provisioning.java} />
              <StatusBadge label="SDK Platform" active={provisioning.sdk} />
              <StatusBadge label="TestDevice AVD" active={provisioning.avd} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Autonomous Pipeline</h2>
            <p className="text-zinc-500 text-sm">Orchestrating OS, Code, and Emulation layers</p>
          </div>
          <div className="flex gap-3">
            {!provisioning.avd && (
              <button 
                onClick={runProvisioning}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                Initialize Environment
              </button>
            )}
            <button 
              onClick={() => {
                setLogs([]);
                setStatus(SystemStatus.IDLE);
                setSelfHealingScript(null);
                setProjectUrl('');
                setSelectedFile(null);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input and Terminal */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Source</label>
                <div className="flex bg-black/40 p-1 rounded-lg border border-zinc-800">
                  <button 
                    onClick={() => setInputMode('url')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-2 transition-all ${inputMode === 'url' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    URL
                  </button>
                  <button 
                    onClick={() => setInputMode('upload')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-2 transition-all ${inputMode === 'upload' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Upload className="w-3 h-3" />
                    ZIP UPLOAD
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {inputMode === 'url' ? (
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      placeholder="Paste GitHub URL (e.g. https://github.com/user/repo)..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <button 
                      onClick={startPipeline}
                      disabled={status !== SystemStatus.IDLE || !provisioning.avd}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      BUILD APK
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".zip"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center animate-fade-in">
                          <FileArchive className="w-12 h-12 text-cyan-400 mb-2" />
                          <span className="text-white font-medium text-sm">{selectedFile.name}</span>
                          <span className="text-zinc-500 text-xs">Ready for build</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="mt-4 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-zinc-700" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-zinc-400">Click or drag ZIP file here</p>
                            <p className="text-xs text-zinc-600 mt-1">Accepts Android Project archives (.zip)</p>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedFile && (
                      <button 
                        onClick={startPipeline}
                        disabled={status !== SystemStatus.IDLE || !provisioning.avd}
                        className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        START ANDROID BUILD PIPELINE
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Live Execution Logs</h3>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">STDOUT / STDERR</div>
              </div>
              <Terminal logs={logs} />
            </div>

            {selfHealingScript && (
              <div className="bg-[#121214] border border-cyan-900/30 rounded-xl p-6 shadow-xl border-l-4 border-l-cyan-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Generated Self-Healing Logic (Python)</h3>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(selfHealingScript)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="mono text-[11px] text-cyan-100/70 p-4 bg-black/40 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
                  {selfHealingScript}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Simulator and Results */}
          <div className="space-y-8">
            <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Smartphone className="w-5 h-5 text-zinc-400" />
                <h3 className="font-semibold text-white">Emulator Live Stream</h3>
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center min-h-[500px]">
                <SimulatorView status={status} />
              </div>
              
              {status === SystemStatus.COMPLETED && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg py-4 font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-600/20">
                    <Download className="w-5 h-5" />
                    DOWNLOAD FINAL APK
                  </button>
                  <p className="text-center text-[10px] text-zinc-500 mt-3 font-mono uppercase tracking-widest">Signed & Verified v1.0.4</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Status Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#18181b]/90 backdrop-blur border border-zinc-700 rounded-full flex items-center gap-4 shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === SystemStatus.IDLE ? 'bg-zinc-500' : 'bg-cyan-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">{status}</span>
        </div>
        <div className="w-px h-4 bg-zinc-700"></div>
        <div className="text-xs text-zinc-400 font-medium">
          {status === SystemStatus.IDLE && "System Idle"}
          {status === SystemStatus.PROVISIONING && "Deploying cloud tools..."}
          {status === SystemStatus.BUILDING && "Compiling project..."}
          {status === SystemStatus.SELF_HEALING && "AI Fixing Build Errors..."}
          {status === SystemStatus.COMPLETED && "App Verified & Ready"}
          {status === SystemStatus.FAILED && "Pipeline Interrupted"}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-zinc-400">{label}</span>
    {active ? (
      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <div className="w-3 h-3 rounded-full border border-zinc-700"></div>
    )}
  </div>
);

export default App;
