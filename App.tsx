import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, History, Menu, Github, Download, Trash2 } from 'lucide-react';
import ScanInterface from './components/ScanInterface';
import FindingsTable from './components/FindingsTable';
import DashboardCharts from './components/DashboardCharts';
import RemediationModal from './components/RemediationModal';
import ScanHistory from './components/ScanHistory';
import { runSimulatedScan } from './services/geminiService';
import { storageService } from './services/storageService';
import { exportService } from './services/exportService';
import { CloudProvider, Finding, ComplianceStandard, ScanResult } from './types';

const App: React.FC = () => {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [history, setHistory] = useState<ScanResult[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(storageService.getHistory());
  }, []);

  const handleScan = async (provider: CloudProvider, services: string[], standard: ComplianceStandard) => {
    setIsScanning(true);
    
    // Slight artificial delay to show "Scanning" state better
    await new Promise(r => setTimeout(r, 1500));
    
    const result = await runSimulatedScan(provider, services, standard);
    setCurrentScan(result);
    setHistory(storageService.getHistory()); // Update local history state
    setIsScanning(false);
  };

  const handleViewHistoricalScan = (scan: ScanResult) => {
    setCurrentScan(scan);
    setActiveTab('dashboard');
  };

  const handleClearHistory = () => {
    if(confirm("Are you sure you want to clear all scan history?")) {
        storageService.clearHistory();
        setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                CloudSploit <span className="text-blue-400 font-light">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a 
                href="https://github.com/aquasecurity/cloudsploit" 
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <div className="h-4 w-px bg-slate-700"></div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                v2.0.0-simulator
              </span>
            </div>
            <div className="md:hidden">
              <button className="text-slate-400 hover:text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {activeTab === 'dashboard' ? 'Security Dashboard' : 'Scan History'}
                </h1>
                <p className="text-slate-400">
                  {activeTab === 'dashboard' 
                    ? 'Manage your cloud security posture and compliance.'
                    : 'View and manage past security assessment reports.'
                  }
                </p>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
             </div>
          </div>

          {activeTab === 'dashboard' ? (
            <>
              {/* Scan Trigger Area */}
              <ScanInterface onRunScan={handleScan} isScanning={isScanning} />

              {/* Scan Results Area */}
              {currentScan ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Report ID: <span className="font-mono text-slate-300">{currentScan.id.substring(0,8)}...</span></span>
                        <span>•</span>
                        <span>Standard: <span className="text-slate-300">{currentScan.standard}</span></span>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => exportService.downloadCSV(currentScan.findings)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button 
                            onClick={() => exportService.downloadJSON(currentScan)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export JSON
                        </button>
                    </div>
                  </div>

                  <DashboardCharts findings={currentScan.findings} />
                  
                  {/* Detailed Table */}
                  <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Detailed Findings</h3>
                      <span className="text-sm text-slate-400">
                        Total Issues: {currentScan.findings.filter(f => f.status !== 'PASS').length}
                      </span>
                    </div>
                    <FindingsTable 
                      findings={currentScan.findings} 
                      onSelectFinding={setSelectedFinding} 
                    />
                  </div>
                </div>
              ) : (
                 /* Empty State */
                !isScanning && (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                  <div className="bg-slate-900 inline-flex p-4 rounded-full mb-4">
                     <Shield className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300">Ready to Scan</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    Select a cloud provider, scope, and compliance standard to run a simulated security assessment.
                  </p>
                </div>
                )
              )}
            </>
          ) : (
            /* History Tab */
            <div className="space-y-4">
                <div className="flex justify-end">
                     <button 
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded text-sm transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                </div>
                <ScanHistory history={history} onSelectScan={handleViewHistoricalScan} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RemediationModal 
        finding={selectedFinding} 
        onClose={() => setSelectedFinding(null)} 
      />
    </div>
  );
};

export default App;
