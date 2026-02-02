# Fetch Public Case Files

## Quick Commands

### Fetch Zodiac Killer Case

**Option 1: Using npm script**
```bash
npm run fetch:zodiac
```

**Option 2: Using shell script**
```bash
./scripts/fetch-zodiac.sh
```

**Option 3: Using Node.js script directly**
```bash
node scripts/fetch-zodiac.js
```

**Option 4: Using curl (when server is running)**
```bash
curl -X GET "http://localhost:3000/api/cases/fetch-public?case=zodiac" | jq '.'
```

**Option 5: Via UI**
1. Start dev server: `npm run dev`
2. Click "Fetch Public" button in header
3. Click "Fetch Zodiac Killer Case"

## API Endpoints

### GET `/api/cases/fetch-public?case=zodiac`
Fetch Zodiac Killer case data

### GET `/api/cases/fetch-public?q=zodiac`
Search public databases for cases matching query

### POST `/api/cases/fetch-public`
```json
{
  "query": "zodiac killer",
  "caseName": "zodiac"
}
```

## What Gets Fetched

The Zodiac Killer case includes:
- ✅ Complete case description
- ✅ 6 evidence items (letters, cryptograms, fingerprints, etc.)
- ✅ Timeline information
- ✅ Case metadata (jurisdiction, case number, etc.)
- ✅ Tags and categorization

## Data Sources

Currently implemented:
- ✅ Zodiac Killer case (structured data)

Planned integrations:
- [ ] Wikipedia API
- [ ] FBI public records
- [ ] NamUs (National Missing and Unidentified Persons System)
- [ ] ViCAP (Violent Criminal Apprehension Program) public data
- [ ] Local news archives
- [ ] Court records (public)

## Privacy & Ethics

- ✅ Only fetches publicly available data
- ✅ Automatically anonymizes sensitive information
- ✅ Complies with FOIA and public records laws
- ✅ No access to restricted or classified information

## Example Usage

### Command Line
```bash
# Fetch Zodiac case
npm run fetch:zodiac

# Output saved to: zodiac-killer-case.json
```

### Programmatic
```typescript
import { publicCaseFetcher } from '@/lib/data/fetchPublicCases'

const zodiacCase = await publicCaseFetcher.fetchZodiacKillerCase()
console.log(zodiacCase)
```

### API Call
```bash
# Search for cases
curl "http://localhost:3000/api/cases/fetch-public?q=zodiac"

# Fetch specific case
curl "http://localhost:3000/api/cases/fetch-public?case=zodiac"
```

## Adding More Cases

To add more public cases, edit:
- `lib/data/fetchPublicCases.ts` - Add new case fetchers
- `app/api/cases/fetch-public/route.ts` - Add new endpoints

## Notes

- All fetched data is from public sources only
- Data is automatically validated for privacy compliance
- Cases are ready for immediate analysis
- Evidence items are pre-structured and categorized
