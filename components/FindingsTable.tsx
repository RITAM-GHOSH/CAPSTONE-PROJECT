import React from 'react';
import { Finding, Status, Severity } from '../types';
import { AlertTriangle, CheckCircle, XCircle, ChevronRight, ShieldAlert } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const colors = {
    [Severity.CRITICAL]: 'bg-red-900 text-red-200 border-red-700',
    [Severity.HIGH]: 'bg-orange-900 text-orange-200 border-orange-700',
    [Severity.MEDIUM]: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    [Severity.LOW]: 'bg-blue-900 text-blue-200 border-blue-700',
    [Severity.UNKNOWN]: 'bg-gray-700 text-gray-300 border-gray-600',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const StatusIcon = ({ status }: { status: Status }) => {
  switch (status) {
    case Status.FAIL:
      return <XCircle className="w-5 h-5 text-red-500" />;
    case Status.WARN:
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case Status.PASS:
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return <ShieldAlert className="w-5 h-5 text-gray-500" />;
  }
};

const FindingsTable: React.FC<FindingsTableProps> = ({ findings, onSelectFinding }) => {
  if (findings.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-800 rounded-lg border border-slate-700">
        No findings available. Run a scan to see results.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Severity</th>
            <th className="px-6 py-3">Plugin / Check</th>
            <th className="px-6 py-3">Resource</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-900">
          {findings.map((finding) => (
            <tr 
              key={finding.id} 
              className="hover:bg-slate-800 transition-colors cursor-pointer group"
              onClick={() => onSelectFinding(finding)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusIcon status={finding.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <SeverityBadge severity={finding.severity} />
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-100">{finding.title}</div>
                <div className="text-xs text-slate-500 truncate max-w-xs">{finding.description}</div>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-xs" title={finding.resource}>
                {finding.resource}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">
                  {finding.category}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                 <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FindingsTable;
