# Testing Pattern Recognition

## Quick Test Command

```bash
npm run test:patterns
```

This will run a comprehensive test of the intelligent pattern recognition system.

## What Gets Tested

The test script creates 5 test cases:
1. **Downtown Robbery Series - Case 1** (Jan 15, 2024)
2. **Downtown Robbery Series - Case 2** (Feb 12, 2024) 
3. **Downtown Robbery Series - Case 3** (Mar 10, 2024)
4. **Uptown Burglary** (Jan 20, 2024)
5. **Suburb Theft** (Feb 25, 2024)

Cases 1, 2, and 3 are designed to show:
- ✅ **Serial Offender Pattern** - Same MO, location, suspect description
- ✅ **Geographic Cluster** - All in Downtown, California
- ✅ **Temporal Pattern** - Monthly intervals (~28 days apart)
- ✅ **Evidence Chain** - Similar evidence types (physical, witness, forensic)
- ✅ **Suspect Link** - Same suspect description across cases

## Expected Results

When testing Case 1, you should see:

### Pattern Matches
- Case 2: ~85-95% similarity (high MO match)
- Case 3: ~85-95% similarity (high MO match)

### Intelligent Patterns
- **Serial Offender Pattern**: 70-85% confidence
- **Geographic Cluster**: 3 cases in Downtown
- **Temporal Series**: Monthly pattern detected
- **Evidence Chain**: Similar evidence types
- **Suspect Link**: Matching descriptions

### Serial Offender Probability
- **Expected**: 70-85% (HIGH PROBABILITY)

## Manual Testing via UI

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Create test cases via UI or API

3. Run analysis on Case 1

4. Check the "Intelligent Pattern Analysis" section

5. Look for:
   - Serial Offender Probability score
   - Pattern cards with risk levels
   - Recommendations

## API Testing

You can also test via API:

```bash
# Create test cases
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d @test-case-1.json

# Run analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "caseData": { ... },
    "allCases": [ ... ]
  }'
```

## Test Output Example

```
🔍 Testing Intelligent Pattern Recognition

============================================================
Test Cases:
============================================================
1. Downtown Robbery Series - Case 1
   Date: 2024-01-15
   Jurisdiction: Downtown, California
   Evidence: 3 items

...

============================================================

🎯 Analyzing: Downtown Robbery Series - Case 1
============================================================

📊 Running Advanced Pattern Analysis...

✅ Found 2 pattern matches:

   Match 1:
   - Case: Downtown Robbery Series - Case 2
   - Similarity: 92%
   - MO Similarity: 95%
   - Matching Factors: Similar MO, Same jurisdiction, Similar evidence types

...

🧠 Running Intelligent Pattern Analysis...

✅ Serial Offender Probability: 82%
   ⚠️  HIGH PROBABILITY - Serial offender pattern detected!

✅ Found 4 intelligent patterns:

   Pattern 1: Potential Serial Offender Pattern
   - Type: serial_offender
   - Confidence: 82%
   - Risk Level: CRITICAL
   - Cases: 3
   - Description: Strong indicators of serial offender activity across 3 cases
   - Indicators:
     • MO similarity: 92%
     • Temporal pattern: Strong
     • Geographic pattern: Concentrated
   - Recommendations:
     ✓ Coordinate investigation across jurisdictions
     ✓ Create task force if not already established
     ✓ Cross-reference all cases for suspect overlap
     ...

============================================================
✅ Pattern Recognition Test Complete!
============================================================

📈 Summary:
   • Pattern Matches: 2
   • Pattern Insights: 3
   • Geographic Clusters: 1
   • Intelligent Patterns: 4
   • Serial Offender Probability: 82%
```

## Troubleshooting

If the test fails:
1. Make sure dependencies are installed: `npm install`
2. Check TypeScript compilation: `npx tsc --noEmit`
3. Verify tsx is installed: `npm install -D tsx`

## Next Steps

After running the test:
1. Review the pattern matches
2. Check serial offender probability
3. Examine recommendations
4. Test with your own cases!
