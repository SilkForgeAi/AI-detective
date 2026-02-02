// Core Cold Case Plugin
// Refactored existing cold case functionality as first plugin

import { Plugin, PatternPlugin } from '../pluginSystem'
import { findPatternMatches } from '@/lib/analysis/patternMatcher'
import { detectAnomalies } from '@/lib/analysis/anomalyDetector'
import { Case } from '@/types/case'

export const coldCasePlugin: PatternPlugin = {
  id: 'core-cold-case',
  name: 'Cold Case Analyzer',
  version: '1.0.0',
  description: 'Core cold case pattern recognition and analysis',
  author: 'AI Detective Team',
  type: 'pattern',
  enabled: true,

  async findPatterns(targetCase: Case, allCases: Case[]) {
    // Use existing pattern matcher
    return findPatternMatches(targetCase, allCases)
  },
}

// Register on module load
import { pluginRegistry } from '../pluginSystem'
pluginRegistry.register(coldCasePlugin)
