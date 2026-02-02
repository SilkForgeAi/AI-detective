// TypeScript test script for intelligent pattern recognition
// Run with: npx tsx scripts/test-patterns-ts.ts

import { advancedPatternMatcher } from '../lib/analysis/advancedPatternMatcher'
import { intelligentPatternAnalyzer } from '../lib/analysis/intelligentPatterns'
import { Case } from '../types/case'

// Create test cases with patterns
const testCases: Case[] = [
  {
    id: 'case-1',
    title: 'Downtown Robbery Series - Case 1',
    date: '2024-01-15',
    description: 'Armed robbery at convenience store. Suspect used handgun, demanded cash, wore black hoodie. Witness described suspect as 6ft tall, white male, 30s.',
    evidence: [
      { id: 'ev1', type: 'physical', description: 'Black hoodie found at scene', source: 'Crime scene', date: '2024-01-15', confidence: 80 },
      { id: 'ev2', type: 'witness_statement', description: 'Witness saw suspect flee in blue sedan', source: 'Witness', date: '2024-01-15', confidence: 70 },
      { id: 'ev3', type: 'forensic', description: 'Fingerprints on counter', source: 'Lab', date: '2024-01-15', confidence: 85 },
    ],
    jurisdiction: 'Downtown, California',
    status: 'open',
    tags: ['robbery', 'armed'],
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    privacyFlags: { anonymized: true, publicDataOnly: true, requiresVerification: false },
  },
  {
    id: 'case-2',
    title: 'Downtown Robbery Series - Case 2',
    date: '2024-02-12',
    description: 'Armed robbery at gas station. Suspect used handgun, demanded cash, wore black hoodie. Witness described suspect as 6ft tall, white male, 30s.',
    evidence: [
      { id: 'ev4', type: 'physical', description: 'Black hoodie fibers found', source: 'Crime scene', date: '2024-02-12', confidence: 75 },
      { id: 'ev5', type: 'witness_statement', description: 'Witness saw suspect in blue sedan', source: 'Witness', date: '2024-02-12', confidence: 65 },
      { id: 'ev6', type: 'forensic', description: 'Similar fingerprints', source: 'Lab', date: '2024-02-12', confidence: 90 },
    ],
    jurisdiction: 'Downtown, California',
    status: 'open',
    tags: ['robbery', 'armed'],
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    privacyFlags: { anonymized: true, publicDataOnly: true, requiresVerification: false },
  },
  {
    id: 'case-3',
    title: 'Downtown Robbery Series - Case 3',
    date: '2024-03-10',
    description: 'Armed robbery at liquor store. Suspect used handgun, demanded cash, wore black hoodie. Witness described suspect as 6ft tall, white male, 30s.',
    evidence: [
      { id: 'ev7', type: 'physical', description: 'Black hoodie recovered', source: 'Crime scene', date: '2024-03-10', confidence: 85 },
      { id: 'ev8', type: 'witness_statement', description: 'Blue sedan seen leaving scene', source: 'Witness', date: '2024-03-10', confidence: 70 },
      { id: 'ev9', type: 'forensic', description: 'DNA match to previous cases', source: 'Lab', date: '2024-03-10', confidence: 95 },
    ],
    jurisdiction: 'Downtown, California',
    status: 'open',
    tags: ['robbery', 'armed'],
    priority: 'critical',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    privacyFlags: { anonymized: true, publicDataOnly: true, requiresVerification: false },
  },
  {
    id: 'case-4',
    title: 'Uptown Burglary',
    date: '2024-01-20',
    description: 'Residential burglary. Entry through window, jewelry stolen. No witnesses.',
    evidence: [
      { id: 'ev10', type: 'physical', description: 'Window forced open', source: 'Crime scene', date: '2024-01-20', confidence: 90 },
      { id: 'ev11', type: 'forensic', description: 'Footprints in yard', source: 'Lab', date: '2024-01-20', confidence: 60 },
    ],
    jurisdiction: 'Uptown, California',
    status: 'open',
    tags: ['burglary'],
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    privacyFlags: { anonymized: true, publicDataOnly: true, requiresVerification: false },
  },
  {
    id: 'case-5',
    title: 'Suburb Theft',
    date: '2024-02-25',
    description: 'Vehicle theft from parking lot. No forced entry, keys left in car.',
    evidence: [
      { id: 'ev12', type: 'physical', description: 'No signs of forced entry', source: 'Crime scene', date: '2024-02-25', confidence: 95 },
      { id: 'ev13', type: 'witness_statement', description: 'No witnesses', source: 'Investigation', date: '2024-02-25', confidence: 0 },
    ],
    jurisdiction: 'Suburb, California',
    status: 'open',
    tags: ['theft', 'vehicle'],
    priority: 'low',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    privacyFlags: { anonymized: true, publicDataOnly: true, requiresVerification: false },
  },
]

async function runTest() {
  console.log('🔍 Testing Intelligent Pattern Recognition\n')
  console.log('='.repeat(60))
  console.log('Test Cases:')
  console.log('='.repeat(60))
  testCases.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   Date: ${c.date}`)
    console.log(`   Jurisdiction: ${c.jurisdiction}`)
    console.log(`   Evidence: ${c.evidence.length} items\n`)
  })

  // Test on first case (should find patterns with cases 2 and 3)
  const targetCase = testCases[0]
  const allCases = testCases

  console.log('='.repeat(60))
  console.log(`\n🎯 Analyzing: ${targetCase.title}`)
  console.log('='.repeat(60))

  try {
    // Run advanced pattern matching
    console.log('\n📊 Running Advanced Pattern Analysis...\n')
    const advancedResults = await advancedPatternMatcher.findAdvancedPatterns(targetCase, allCases)

    console.log(`✅ Found ${advancedResults.matches.length} pattern matches:`)
    advancedResults.matches.forEach((match, idx) => {
      console.log(`\n   Match ${idx + 1}:`)
      console.log(`   - Case: ${match.caseTitle}`)
      console.log(`   - Similarity: ${Math.round(match.similarityScore * 100)}%`)
      console.log(`   - MO Similarity: ${Math.round((match.moSimilarity || 0) * 100)}%`)
      console.log(`   - Matching Factors: ${match.matchingFactors.join(', ')}`)
    })

    console.log(`\n✅ Found ${advancedResults.insights.length} pattern insights:`)
    advancedResults.insights.forEach((insight, idx) => {
      console.log(`\n   Insight ${idx + 1}:`)
      console.log(`   - Type: ${insight.type}`)
      console.log(`   - Confidence: ${insight.confidence}%`)
      console.log(`   - Description: ${insight.description}`)
      console.log(`   - Cases: ${insight.cases.length}`)
    })

    console.log(`\n✅ Found ${advancedResults.clusters.length} geographic clusters:`)
    advancedResults.clusters.forEach((cluster, idx) => {
      console.log(`\n   Cluster ${idx + 1}:`)
      console.log(`   - Cases: ${cluster.length}`)
      cluster.forEach(c => console.log(`     • ${c.title}`))
    })

    // Run intelligent pattern analysis
    console.log('\n\n🧠 Running Intelligent Pattern Analysis...\n')
    const intelligentResults = await intelligentPatternAnalyzer.analyzePatterns(targetCase, allCases)

    console.log(`✅ Serial Offender Probability: ${intelligentResults.serialOffenderProbability}%`)
    
    if (intelligentResults.serialOffenderProbability >= 70) {
      console.log('   ⚠️  HIGH PROBABILITY - Serial offender pattern detected!')
    } else if (intelligentResults.serialOffenderProbability >= 50) {
      console.log('   ⚠️  MODERATE PROBABILITY - Possible serial offender')
    }

    console.log(`\n✅ Found ${intelligentResults.patterns.length} intelligent patterns:`)
    intelligentResults.patterns.forEach((pattern, idx) => {
      console.log(`\n   Pattern ${idx + 1}: ${pattern.name}`)
      console.log(`   - Type: ${pattern.type}`)
      console.log(`   - Confidence: ${pattern.confidence}%`)
      console.log(`   - Risk Level: ${pattern.riskLevel.toUpperCase()}`)
      console.log(`   - Cases: ${pattern.cases.length}`)
      console.log(`   - Description: ${pattern.description}`)
      console.log(`   - Indicators:`)
      pattern.indicators.forEach(ind => console.log(`     • ${ind}`))
      console.log(`   - Recommendations:`)
      pattern.recommendations.forEach(rec => console.log(`     ✓ ${rec}`))
    })

    console.log(`\n✅ Generated ${intelligentResults.recommendations.length} recommendations:`)
    intelligentResults.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('✅ Pattern Recognition Test Complete!')
    console.log('='.repeat(60))
    console.log('\n📈 Summary:')
    console.log(`   • Pattern Matches: ${advancedResults.matches.length}`)
    console.log(`   • Pattern Insights: ${advancedResults.insights.length}`)
    console.log(`   • Geographic Clusters: ${advancedResults.clusters.length}`)
    console.log(`   • Intelligent Patterns: ${intelligentResults.patterns.length}`)
    console.log(`   • Serial Offender Probability: ${intelligentResults.serialOffenderProbability}%`)
    console.log('\n')

  } catch (error) {
    console.error('❌ Test failed:', error)
    if (error instanceof Error) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run the test
runTest().catch(console.error)
