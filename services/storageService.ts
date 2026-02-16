import { ScanResult } from "../types";

const STORAGE_KEY = 'cloudsploit_scan_history';

export const storageService = {
  /**
   * Save a completed scan to local storage
   */
  saveScan: (scan: ScanResult): void => {
    try {
      const history = storageService.getHistory();
      // Prepend new scan
      const updatedHistory = [scan, ...history];
      // Keep only last 50 scans to prevent quota issues
      if (updatedHistory.length > 50) {
        updatedHistory.length = 50;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save scan to storage", error);
    }
  },

  /**
   * Retrieve all past scans
   */
  getHistory: (): ScanResult[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to retrieve scan history", error);
      return [];
    }
  },

  /**
   * Get a specific scan by ID
   */
  getScanById: (id: string): ScanResult | undefined => {
    const history = storageService.getHistory();
    return history.find(s => s.id === id);
  },

  /**
   * Clear all history
   */
  clearHistory: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
  
  /**
   * Calculate aggregate stats from history
   */
  getAggregateStats: () => {
    const history = storageService.getHistory();
    if (history.length === 0) {
      return {
        scansPerformed: 0,
        resourcesScanned: 0,
        openRisks: 0,
        complianceScore: 100
      };
    }

    const latestScan = history[0];
    const openRisks = latestScan.findings.filter(f => f.status === 'FAIL').length;
    const totalChecks = latestScan.findings.length;
    
    // Simple score calculation: (Pass / Total) * 100
    const passed = latestScan.findings.filter(f => f.status === 'PASS').length;
    const score = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 100;

    return {
      scansPerformed: history.length,
      resourcesScanned: history.reduce((acc, curr) => acc + curr.findings.length, 0), // Approximation
      openRisks,
      complianceScore: score
    };
  }
};
