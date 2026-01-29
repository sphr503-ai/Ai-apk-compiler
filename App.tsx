
import React, { useState, useEffect, useCallback } from 'react';
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
  Box
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
  const [selfHealingScript, setSelfHealingScript] = useState<string | null>(null);

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

  const startPipeline = async () => {
    if (!projectUrl) {
      addLog('Error: Please provide a Project URL or ZIP.', 'error');
      return;
    }

    setStatus(SystemStatus.ANALYZING);
    addLog(`Cloning repository: ${projectUrl}`, 'info');
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

      // Fetch the python script to show the user
      const script = await generateSelfHealingPythonScript();
      setSelfHealingScript(script);

    } catch (err) {
      addLog('Self-healing failed due to API error.', 'error');
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
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Project Source</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="Paste GitHub URL or Drag ZIP file here..."
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
                  <button className="text-xs text-cyan-400 hover:underline">Copy Code</button>
                </div>
                <pre className="mono text-xs text-cyan-100/70 p-4 bg-black/40 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
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
              <div className="flex-1 bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                <SimulatorView status={status} />
              </div>
              
              {status === SystemStatus.COMPLETED && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg py-4 font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-600/20">
                    <Download className="w-5 h-5" />
                    DOWNLOAD FINAL APK
                  </button>
                  <p className="text-center text-[10px] text-zinc-500 mt-3">Verified by Autonomous Engine v1.0.4</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Status Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#18181b]/90 backdrop-blur border border-zinc-700 rounded-full flex items-center gap-4 shadow-2xl z-50">
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
