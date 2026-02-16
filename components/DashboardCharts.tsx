import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Finding, Severity, Status } from '../types';

interface DashboardChartsProps {
  findings: Finding[];
}

const COLORS = {
  FAIL: '#ef4444', // Red-500
  WARN: '#f59e0b', // Amber-500
  PASS: '#22c55e', // Green-500
};

const SEVERITY_COLORS = {
  [Severity.CRITICAL]: '#7f1d1d', // Red-900
  [Severity.HIGH]: '#ea580c',     // Orange-600
  [Severity.MEDIUM]: '#ca8a04',   // Yellow-600
  [Severity.LOW]: '#2563eb',      // Blue-600
  [Severity.UNKNOWN]: '#4b5563',  // Gray-600
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg text-xs">
        <p className="text-slate-200">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ findings }) => {
  // Aggregate for Pie Chart (Status)
  const statusData = [
    { name: 'Fail', value: findings.filter(f => f.status === Status.FAIL).length, color: COLORS.FAIL },
    { name: 'Warn', value: findings.filter(f => f.status === Status.WARN).length, color: COLORS.WARN },
    { name: 'Pass', value: findings.filter(f => f.status === Status.PASS).length, color: COLORS.PASS },
  ].filter(d => d.value > 0);

  // Aggregate for Bar Chart (Severity of Failures)
  const failures = findings.filter(f => f.status === Status.FAIL || f.status === Status.WARN);
  const severityCounts = failures.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = Object.keys(SEVERITY_COLORS).map(sev => ({
    name: sev,
    value: severityCounts[sev] || 0,
    fill: SEVERITY_COLORS[sev as Severity],
  })).filter(d => d.value > 0);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Compliance Status */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Compliance Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          {statusData.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
              <span className="text-slate-300 text-sm">{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risks by Severity */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Open Risks by Severity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={60} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {severityData.map((entry, index) => (
                   <Cell key={`cell-sev-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
