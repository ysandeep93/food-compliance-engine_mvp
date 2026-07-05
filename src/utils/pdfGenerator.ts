/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ComplianceReport } from '../types';

export function generateCompliancePDF(report: ComplianceReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Helper to add page headers & footers
  const addPageDecoration = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('FSSAI PACKAGED FOOD COMPLIANCE AUDIT REPORT', 15, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - 25, pageHeight - 10);
    doc.setDrawColor(230, 230, 230);
    doc.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14);
  };

  addPageDecoration(1);

  // Title block
  doc.setFillColor(34, 49, 63); // Deep slate charcoal
  doc.rect(15, yPos, pageWidth - 30, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FSSAI COMPLIANCE SCANNER', 20, yPos + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('AUTOMATED PACKAGED FOOD LABEL AUDIT REPORT', 20, yPos + 18);

  yPos += 35;

  // Product Meta Information
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(report.productName, 15, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Brand: ${report.brandName || 'N/A'}`, 15, yPos + 6);
  doc.text(`FSSAI Lic. No: ${report.productData.fssaiLicenses.value || 'Not Found'}`, 15, yPos + 12);
  doc.text(`Audit Date: ${new Date(report.timestamp).toLocaleDateString('en-IN')}`, 15, yPos + 18);

  // Scores
  doc.setFillColor(245, 247, 250);
  doc.rect(pageWidth - 85, yPos - 5, 70, 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text('COMPLIANCE SCORE', pageWidth - 80, yPos + 2);
  
  const scoreColor = report.overallScore >= 80 ? [39, 174, 96] : report.overallScore >= 60 ? [243, 156, 18] : [192, 57, 43];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(22);
  doc.text(`${report.overallScore}/100`, pageWidth - 80, yPos + 14);

  yPos += 30;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  // Section: Deterministic Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 49, 63);
  doc.text('DETERMINISTIC COMPLIANCE AUDIT', 15, yPos);
  yPos += 8;

  const fails = report.deterministicFindings.filter(f => f.status === 'FAIL');
  const warnings = report.deterministicFindings.filter(f => f.status === 'WARNING');
  const passes = report.deterministicFindings.filter(f => f.status === 'PASS');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Total Rules Scanned: ${report.deterministicFindings.length}  |  Passed: ${passes.length}  |  Violations: ${fails.length}  |  Warnings: ${warnings.length}`, 15, yPos);
  yPos += 12;

  // List violations
  const listIssues = (title: string, items: typeof fails, color: [number, number, number]) => {
    if (items.length === 0) return;
    
    // Header for this group (e.g. Critical Non-Compliance)
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
      addPageDecoration(doc.getNumberOfPages());
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title, 15, yPos);
    yPos += 7;

    for (const item of items) {
      const evidenceLines = doc.splitTextToSize(`Evidence: ${item.evidence}`, pageWidth - 40);
      const fixLines = item.suggestedFix ? doc.splitTextToSize(`Fix: ${item.suggestedFix}`, pageWidth - 40) : [];
      
      // Calculate estimated height for this finding:
      // Title: 5
      // Ref: 4
      // Evidence: evidenceLines.length * 4.5
      // Fix: fixLines.length * 4.5
      // Spacing / Margins: 6
      const estimatedHeight = 5 + 4 + (evidenceLines.length * 4.5) + (fixLines.length > 0 ? (fixLines.length * 4.5) : 0) + 8;

      if (yPos + estimatedHeight > pageHeight - 15) {
        doc.addPage();
        yPos = 20;
        addPageDecoration(doc.getNumberOfPages());
      }
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      doc.text(`• [${item.category}] ${item.title}`, 18, yPos);
      yPos += 4.5;
      
      // Citation Reference
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(`Ref: ${item.citation}`, 18, yPos);
      yPos += 4;
      
      // Evidence text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(evidenceLines, 22, yPos);
      yPos += (evidenceLines.length * 4.5) + 2;

      // Suggested Fix if any
      if (item.suggestedFix) {
        doc.setTextColor(130, 85, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(fixLines, 22, yPos);
        yPos += (fixLines.length * 4.5) + 2;
        doc.setTextColor(60, 60, 60);
      }
      
      yPos += 4; // space between findings
    }
    yPos += 4; // space after section
  };

  listIssues('Critical Non-Compliance (FAIL)', fails, [192, 57, 43]);
  listIssues('Advisory / Marketing Warnings (WARNING)', warnings, [230, 126, 34]);

  // Section: Claims Verification
  if (report.aiClaimFindings.length > 0) {
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = 20;
      addPageDecoration(doc.getNumberOfPages());
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(34, 49, 63);
    doc.text('AI SEMANTIC CLAIMS VERIFICATION', 15, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Evaluation of marketing claims based on FSSAI (Advertising and Claims) Regulations, 2018.', 15, yPos);
    yPos += 8;

    for (const claim of report.aiClaimFindings) {
      const reasonLines = doc.splitTextToSize(`Reasoning: ${claim.reasoning}`, pageWidth - 40);
      const fixLines = claim.suggestedFix ? doc.splitTextToSize(`Required Fix: ${claim.suggestedFix}`, pageWidth - 40) : [];
      
      const estimatedHeight = 5 + (reasonLines.length * 4.5) + (fixLines.length > 0 ? (fixLines.length * 4.5) : 0) + 10;

      if (yPos + estimatedHeight > pageHeight - 15) {
        doc.addPage();
        yPos = 20;
        addPageDecoration(doc.getNumberOfPages());
      }

      const claimColor = claim.assessment === 'COMPLIANT' ? [39, 174, 96] : claim.assessment === 'MISLEADING' ? [192, 57, 43] : [243, 156, 18];
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      doc.text(`Claim: "${claim.claim}"`, 18, yPos);
      
      doc.setFontSize(8);
      doc.setTextColor(claimColor[0], claimColor[1], claimColor[2]);
      doc.text(`Assessment: ${claim.assessment}`, pageWidth - 55, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(reasonLines, 22, yPos);
      yPos += (reasonLines.length * 4.5) + 2;

      if (claim.suggestedFix) {
        doc.setTextColor(120, 80, 0);
        doc.text(fixLines, 22, yPos);
        yPos += (fixLines.length * 4.5) + 2;
      }
      
      yPos += 4;
    }
  }

  // Save the PDF
  const safeName = report.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`fssai-audit-${safeName || 'report'}.pdf`);
}
