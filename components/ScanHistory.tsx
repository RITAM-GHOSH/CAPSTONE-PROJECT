import React from 'react';
import { ScanResult, Status } from '../types';
import { Calendar, Cloud, FileText, Download } from 'lucide-react';
import { exportService } from '../services/exportService';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onSelectScan }) => {
  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-800 rounded-lg border border-slate-700">
        No scan history available.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
             <h3 className="text-lg font-semibold text-white">Scan History</h3>
        </div>
        <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Provider</th>
            <th className="px-6 py-3">Standard</th>
            <th className="px-6 py-3 text-center">Issues (F/W/P)</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-800">
          {history.map((scan) => (
            <tr 
              key={scan.id} 
              className="hover:bg-slate-700/50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(scan.timestamp).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    {scan.provider}
                </div>
              </td>
              <td className="px-6 py-4">
                 <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                    {scan.standard}
                 </span>
              </td>
              <td className="px-6 py-4 text-center font-mono text-xs">
                <span className="text-red-400">{scan.summary.fail}</span> / {' '}
                <span className="text-yellow-400">{scan.summary.warn}</span> / {' '}
                <span className="text-green-400">{scan.summary.pass}</span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button 
                    onClick={() => onSelectScan(scan)}
                    className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                    title="View Report"
                >
                    <FileText className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => exportService.downloadJSON(scan)}
                    className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                    title="Download JSON"
                >
                    <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ScanHistory;
