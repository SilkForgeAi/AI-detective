// Example Fraud Investigation Plugin
// Demonstrates how plugins can extend functionality for different domains

import { Plugin, PatternPlugin } from '../pluginSystem'
import { Case } from '@/types/case'

export const fraudPlugin: PatternPlugin = {
  id: 'fraud-investigation',
  name: 'Fraud Pattern Detector',
  version: '1.0.0',
  description: 'Detects fraud patterns across financial transactions and claims',
  author: 'Community',
  type: 'pattern',
  enabled: false, // Disabled by default, enable via config

  async findPatterns(targetCase: Case, allCases: Case[]) {
    const fraudPatterns: any[] = []

    // Fraud-specific pattern detection
    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      // Check for similar financial patterns
      const financialSimilarity = this.calculateFinancialSimilarity(targetCase, otherCase)
      
      // Check for similar claim patterns
      const claimSimilarity = this.calculateClaimSimilarity(targetCase, otherCase)

      if (financialSimilarity > 0.6 || claimSimilarity > 0.6) {
        fraudPatterns.push({
          caseId: otherCase.id,
          caseTitle: otherCase.title,
          similarityScore: Math.max(financialSimilarity, claimSimilarity),
          type: 'fraud_pattern',
          indicators: [
            financialSimilarity > 0.6 ? 'Similar financial patterns' : null,
            claimSimilarity > 0.6 ? 'Similar claim patterns' : null,
          ].filter(Boolean),
        })
      }
    }

    return fraudPatterns
  },

  calculateFinancialSimilarity(case1: Case, case2: Case): number {
    // Extract financial keywords
    const financialKeywords = ['amount', 'transaction', 'payment', 'transfer', 'account', 'bank', 'credit', 'debit']
    
    const desc1 = (case1.description + ' ' + case1.evidence.map(e => e.description).join(' ')).toLowerCase()
    const desc2 = (case2.description + ' ' + case2.evidence.map(e => e.description).join(' ')).toLowerCase()

    let matches = 0
    for (const keyword of financialKeywords) {
      if (desc1.includes(keyword) && desc2.includes(keyword)) matches++
    }

    return matches / financialKeywords.length
  },

  calculateClaimSimilarity(case1: Case, case2: Case): number {
    // Check for similar claim characteristics
    const claimKeywords = ['claim', 'policy', 'coverage', 'benefit', 'premium', 'deductible']
    
    const desc1 = (case1.description + ' ' + case1.evidence.map(e => e.description).join(' ')).toLowerCase()
    const desc2 = (case2.description + ' ' + case2.evidence.map(e => e.description).join(' ')).toLowerCase()

    let matches = 0
    for (const keyword of claimKeywords) {
      if (desc1.includes(keyword) && desc2.includes(keyword)) matches++
    }

    return matches / claimKeywords.length
  },
}

// This would be registered when the plugin is loaded
// import { pluginRegistry } from '../pluginSystem'
// pluginRegistry.register(fraudPlugin)
