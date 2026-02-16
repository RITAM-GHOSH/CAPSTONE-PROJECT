export enum CloudProvider {
  AWS = 'AWS',
  AZURE = 'Azure',
  GCP = 'GCP',
  ORACLE = 'Oracle',
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  UNKNOWN = 'Unknown',
}

export enum Status {
  FAIL = 'FAIL',
  WARN = 'WARN',
  PASS = 'PASS',
}

export enum ComplianceStandard {
  GENERAL = 'General Best Practices',
  CIS = 'CIS Benchmarks',
  PCI = 'PCI DSS',
  HIPAA = 'HIPAA',
  GDPR = 'GDPR',
}

export interface Finding {
  id: string;
  plugin: string; // e.g., 'aws/s3/bucketPublic'
  category: string;
  title: string;
  description: string;
  status: Status;
  severity: Severity;
  resource: string;
  remediation_guide?: string;
}

export interface ScanResult {
  id: string;
  timestamp: string; // ISO string
  provider: CloudProvider;
  standard: ComplianceStandard;
  findings: Finding[];
  servicesScanned: string[];
  summary: {
    total: number;
    fail: number;
    warn: number;
    pass: number;
  };
}

export interface DashboardStats {
  complianceScore: number;
  openRisks: number;
  resourcesScanned: number;
  scansPerformed: number;
}
