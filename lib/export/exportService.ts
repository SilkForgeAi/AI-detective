// Export service for cases and reports

import { Case, CaseAnalysis } from '@/types/case'
import { jsPDF } from 'jspdf'

export class ExportService {
  async exportCaseToJSON(caseData: Case): Promise<string> {
    return JSON.stringify(caseData, null, 2)
  }

  async exportCaseToPDF(caseData: Case, analysis?: CaseAnalysis): Promise<Blob> {
    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(18)
    doc.text(caseData.title, 20, yPos)
    yPos += 10

    // Case info
    doc.setFontSize(12)
    doc.text(`Case Number: ${caseData.caseNumber || 'N/A'}`, 20, yPos)
    yPos += 7
    doc.text(`Date: ${caseData.date}`, 20, yPos)
    yPos += 7
    doc.text(`Status: ${caseData.status}`, 20, yPos)
    yPos += 7
    doc.text(`Jurisdiction: ${caseData.jurisdiction || 'N/A'}`, 20, yPos)
    yPos += 10

    // Description
    doc.setFontSize(14)
    doc.text('Description', 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    const descriptionLines = doc.splitTextToSize(caseData.description, 170)
    doc.text(descriptionLines, 20, yPos)
    yPos += descriptionLines.length * 5 + 10

    // Evidence
    if (caseData.evidence.length > 0) {
      doc.setFontSize(14)
      doc.text('Evidence', 20, yPos)
      yPos += 7
      doc.setFontSize(10)
      caseData.evidence.forEach((evidence, idx) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`${idx + 1}. ${evidence.type}: ${evidence.description}`, 20, yPos)
        yPos += 6
      })
      yPos += 5
    }

    // Analysis
    if (analysis) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text('AI Analysis', 20, yPos)
      yPos += 7
      doc.setFontSize(10)

      // Insights
      if (analysis.insights.length > 0) {
        doc.text('Insights:', 20, yPos)
        yPos += 6
        analysis.insights.forEach((insight) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          const lines = doc.splitTextToSize(`• ${insight}`, 170)
          doc.text(lines, 25, yPos)
          yPos += lines.length * 5
        })
        yPos += 5
      }

      // Hypotheses
      if (analysis.hypotheses.length > 0) {
        doc.text('Hypotheses:', 20, yPos)
        yPos += 6
        analysis.hypotheses.forEach((hyp) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`${hyp.title} (${hyp.confidence}% confidence)`, 25, yPos)
          yPos += 5
          const descLines = doc.splitTextToSize(hyp.description, 165)
          doc.text(descLines, 25, yPos)
          yPos += descLines.length * 5 + 3
        })
      }
    }

    return doc.output('blob')
  }

  async exportAllCasesToJSON(cases: Case[]): Promise<string> {
    return JSON.stringify(cases, null, 2)
  }

  downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = typeof content === 'string' 
      ? new Blob([content], { type: mimeType })
      : content
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const exportService = new ExportService()
