import React, { useState } from 'react';
import { CloudProvider, ComplianceStandard } from '../types';
import { Play, Loader2, Cloud, Server, Database, Shield, FileText } from 'lucide-react';

interface ScanInterfaceProps {
  onRunScan: (provider: CloudProvider, services: string[], standard: ComplianceStandard) => Promise<void>;
  isScanning: boolean;
}

const servicesList = [
  { id: 'iam', name: 'IAM & Auth', icon: Shield },
  { id: 'storage', name: 'Storage', icon: Database },
  { id: 'compute', name: 'Compute', icon: Server },
  { id: 'network', name: 'Network', icon: Cloud },
];

const ScanInterface: React.FC<ScanInterfaceProps> = ({ onRunScan, isScanning }) => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(CloudProvider.AWS);
  const [selectedServices, setSelectedServices] = useState<string[]>(['iam', 'storage']);
  const [selectedStandard, setSelectedStandard] = useState<ComplianceStandard>(ComplianceStandard.GENERAL);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleScan = () => {
    onRunScan(selectedProvider, selectedServices, selectedStandard);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Provider Selection */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              1. Cloud Provider
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CloudProvider).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-all ${
                    selectedProvider === provider
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-900/50'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
          
           <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              2. Compliance Standard
            </h3>
            <select 
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value as ComplianceStandard)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
                {Object.entries(ComplianceStandard).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Service Scope */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                3. Scope
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {servicesList.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedServices.includes(service.id);
                return (
                    <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`flex items-center gap-2 p-2 rounded border transition-all text-sm ${
                        isSelected
                        ? 'bg-purple-900/40 border-purple-500 text-purple-100'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                    >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-slate-500'}`} />
                    <span>{service.name}</span>
                    </button>
                );
                })}
            </div>
          </div>

           <button
            onClick={handleScan}
            disabled={isScanning || selectedServices.length === 0}
            className={`mt-6 w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              isScanning || selectedServices.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Engine...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Scan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanInterface;
