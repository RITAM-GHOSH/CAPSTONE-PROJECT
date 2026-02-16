import { ScanResult, Finding } from "../types";

export const exportService = {
  /**
   * Trigger a download of the scan result as JSON
   */
  downloadJSON: (scan: ScanResult): void => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cloudsploit_scan_${scan.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  /**
   * Trigger a download of findings as CSV
   */
  downloadCSV: (findings: Finding[]): void => {
    if (!findings.length) return;

    const headers = ["ID", "Status", "Severity", "Plugin", "Category", "Resource", "Title", "Description"];
    
    const rows = findings.map(f => [
      f.id,
      f.status,
      f.severity,
      f.plugin,
      f.category,
      f.resource,
      `"${f.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${f.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", csvContent);
    downloadAnchorNode.setAttribute("download", `cloudsploit_findings_${new Date().getTime()}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};
