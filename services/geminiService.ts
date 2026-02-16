import { GoogleGenAI, Type } from "@google/genai";
import { CloudProvider, Finding, Severity, Status, ComplianceStandard, ScanResult } from "../types";
import { storageService } from "./storageService";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to validate/mock data if API fails or key is missing
const mockFindings: Finding[] = [
  {
    id: 'mock-1',
    plugin: 'aws/s3/bucketPublicAccessBlock',
    category: 'Storage',
    title: 'S3 Bucket Public Access Block',
    description: 'Ensure S3 buckets have Public Access Blocks enabled.',
    status: Status.FAIL,
    severity: Severity.CRITICAL,
    resource: 'arn:aws:s3:::company-sensitive-data',
  },
  {
    id: 'mock-2',
    plugin: 'aws/iam/rootAccessMfa',
    category: 'IAM',
    title: 'Root Account MFA Enabled',
    description: 'Ensure the root account has MFA enabled.',
    status: Status.FAIL,
    severity: Severity.CRITICAL,
    resource: 'AWS::Account::Root',
  },
  {
    id: 'mock-3',
    plugin: 'aws/ec2/securityGroupOpenToWorld',
    category: 'Compute',
    title: 'EC2 Security Group Open to World',
    description: 'Security groups should not allow unrestricted ingress access on common ports.',
    status: Status.PASS,
    severity: Severity.HIGH,
    resource: 'sg-0123456789abcdef0',
  }
];

export const runSimulatedScan = async (
  provider: CloudProvider,
  serviceScope: string[],
  standard: ComplianceStandard
): Promise<ScanResult> => {
  const scanId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  let findings: Finding[] = [];

  if (!apiKey) {
    console.warn("No API Key provided, returning mock data.");
    findings = mockFindings;
  } else {
    try {
      const systemInstruction = `You are the engine for CloudSploit, an open-source cloud security scanner. 
      Generate realistic security audit findings for ${provider}.
      
      Strictly follow these rules:
      1. Use realistic CloudSploit plugin names in the format: 'service/subservice/checkName' (e.g., 'aws/s3/bucketEncryption', 'azure/storage/blobPublic').
      2. If Compliance Standard is '${standard}', prioritize findings relevant to that framework.
      3. Focus on services: ${serviceScope.join(', ')}.
      4. Return a mix of PASS, WARN, and FAIL.
      5. Resources should look like real cloud identifiers (ARNs, Resource IDs).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 6-10 security findings.
        Output strictly JSON format.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                plugin: { type: Type.STRING, description: "CloudSploit plugin path e.g. aws/s3/bucketEncryption" },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["FAIL", "WARN", "PASS"] },
                severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
                resource: { type: Type.STRING },
              },
              required: ["id", "plugin", "category", "title", "description", "status", "severity", "resource"],
            },
          },
        },
      });

      const text = response.text;
      if (text) {
        findings = JSON.parse(text) as Finding[];
      } else {
        findings = mockFindings;
      }

      // Sanitize enums
      findings = findings.map(f => ({
        ...f,
        status: f.status as Status,
        severity: f.severity as Severity,
        id: f.id || crypto.randomUUID(), // Ensure ID exists
      }));

    } catch (error) {
      console.error("Gemini scan simulation failed:", error);
      findings = mockFindings;
    }
  }

  // Construct Scan Result
  const result: ScanResult = {
    id: scanId,
    timestamp,
    provider,
    standard,
    servicesScanned: serviceScope,
    findings,
    summary: {
      total: findings.length,
      fail: findings.filter(f => f.status === Status.FAIL).length,
      warn: findings.filter(f => f.status === Status.WARN).length,
      pass: findings.filter(f => f.status === Status.PASS).length,
    }
  };

  // Save to "Database"
  storageService.saveScan(result);

  return result;
};

export const getRemediationAdvice = async (finding: Finding): Promise<string> => {
    if (!apiKey) {
        return "No API Key provided. Mock remediation: \n1. Go to console.\n2. Fix it.";
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Provide a technical remediation guide for this CloudSploit finding.
            
            Plugin: ${finding.plugin}
            Finding: ${finding.title}
            Description: ${finding.description}
            Resource: ${finding.resource}
            Severity: ${finding.severity}
            
            Structure:
            1. **Console Remediation**: Step-by-step UI instructions.
            2. **CLI Remediation**: Specific CLI command to fix or verify.
            3. **Terraform/IaC**: Code snippet to enforce security.
            
            Keep it technical and concise (Markdown).`,
        });

        return response.text || "No remediation advice generated.";
    } catch (error) {
        console.error("Gemini remediation failed:", error);
        return "Failed to retrieve remediation advice.";
    }
};
