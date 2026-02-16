import React, { useEffect, useState } from 'react';
import { Finding } from '../types';
import { getRemediationAdvice } from '../services/geminiService';
import { X, Bot, Terminal, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RemediationModalProps {
  finding: Finding | null;
  onClose: () => void;
}

const RemediationModal: React.FC<RemediationModalProps> = ({ finding, onClose }) => {
  const [remediation, setRemediation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (finding) {
      setLoading(true);
      setRemediation('');
      getRemediationAdvice(finding)
        .then(text => setRemediation(text))
        .finally(() => setLoading(false));
    }
  }, [finding]);

  const handleCopy = () => {
    if (remediation) {
      navigator.clipboard.writeText(remediation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${finding.status === 'FAIL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              {finding.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-mono">{finding.resource}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-800">
              {finding.description}
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Remediation Guide
              </h3>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
           
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 font-mono text-sm text-slate-300 leading-relaxed shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse">Analyzing resource configuration...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                    <ReactMarkdown 
                        components={{
                            code({node, inline, className, children, ...props}: any) {
                                return !inline ? (
                                    <div className="relative group">
                                         <Terminal className="absolute top-2 right-2 w-4 h-4 text-slate-600 opacity-50" />
                                         <code className={`${className} block bg-black/30 p-4 rounded my-4 overflow-x-auto`} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                   
                                ) : (
                                    <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {remediation}
                    </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
          <button 
            onClick={onClose} // In a real app, this would trigger a re-scan of this specific resource
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-lg shadow-blue-900/20"
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemediationModal;
