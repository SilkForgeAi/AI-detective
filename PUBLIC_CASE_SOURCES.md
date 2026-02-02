# Public Case Sources for AI Detective

## Built-in Features

### 1. Fetch Public Cases Button
In the app, click the **"Fetch Public"** button in the header to access pre-configured public cases.

### 2. Zodiac Killer Case
Run this command to fetch the Zodiac Killer case:
```bash
npm run fetch:zodiac
```

## Public Case Databases & Resources

### Official Databases

1. **NamUs (National Missing and Unidentified Persons System)**
   - URL: https://www.namus.gov/
   - Contains: Missing persons, unidentified remains, unclaimed persons
   - Data: Public API available
   - Format: JSON/XML
   - **How to use**: Cases are publicly available, can be manually entered

2. **FBI ViCAP (Violent Criminal Apprehension Program)**
   - URL: https://www.fbi.gov/wanted/vicap
   - Contains: Violent crime patterns, serial offenders
   - Data: Public bulletins and case summaries
   - Format: Web pages, PDFs
   - **How to use**: Manual entry from public bulletins

3. **Charley Project**
   - URL: https://charleyproject.org/
   - Contains: Missing persons cases
   - Data: Detailed case files
   - Format: HTML pages
   - **How to use**: Manual entry or web scraping (with permission)

4. **Doe Network**
   - URL: https://www.doenetwork.org/
   - Contains: Unidentified decedents, missing persons
   - Data: Case files with photos
   - Format: HTML pages
   - **How to use**: Manual entry

### Historical Cold Cases

5. **Wikipedia Cold Case Lists**
   - Search: "List of unsolved murders" or "Cold case"
   - Contains: Historical unsolved cases
   - Format: Wikipedia articles
   - **How to use**: Extract case details and create cases

6. **FBI Most Wanted**
   - URL: https://www.fbi.gov/wanted
   - Contains: Fugitives, missing persons
   - Data: Public case files
   - Format: Web pages
   - **How to use**: Manual entry

7. **Interpol Red Notices**
   - URL: https://www.interpol.int/How-we-work/Notices/View-Red-Notices
   - Contains: International fugitives
   - Data: Public notices
   - Format: Web pages
   - **How to use**: Manual entry

### Research & Academic Sources

8. **National Center for Missing & Exploited Children**
   - URL: https://www.missingkids.org/
   - Contains: Missing children cases
   - Data: Public case files
   - Format: Web pages
   - **How to use**: Manual entry (respect privacy)

9. **Cold Case Foundation**
   - Contains: Various cold cases
   - Data: Case summaries
   - Format: Various
   - **How to use**: Manual entry

10. **True Crime Podcasts & Documentaries**
    - Many podcasts cover cold cases with detailed information
    - Examples: "Unsolved Mysteries", "Cold Case Files"
    - **How to use**: Extract case details from episodes

## How to Add Cases to AI Detective

### Method 1: Manual Entry (Recommended)
1. Click **"New Case"** button
2. Fill in case details:
   - Title
   - Date
   - Description
   - Evidence items
   - Timeline events
3. Click **"Create Case"**
4. Click **"Analyze"** to run AI analysis

### Method 2: Use Fetch Public Feature
1. Click **"Fetch Public"** button
2. Select a pre-configured case
3. Import it directly

### Method 3: Bulk Import (Future Feature)
- Create a JSON file with case data
- Import multiple cases at once
- Format matches the Case interface

## Example Case Structure

```json
{
  "title": "Case Title",
  "date": "2024-01-01",
  "status": "cold",
  "description": "Case description...",
  "evidence": [
    {
      "type": "document",
      "description": "Evidence description",
      "source": "Source of evidence"
    }
  ],
  "priority": "high",
  "jurisdiction": "City, State"
}
```

## Ethical Guidelines

⚠️ **Important**: When using public case data:

1. **Respect Privacy**: Only use publicly available information
2. **No Personal Info**: Don't include private details about victims/families
3. **Public Data Only**: Use only information that's already public
4. **Sensitivity**: Be respectful when discussing violent crimes
5. **Purpose**: Use for legitimate investigative purposes only

## Suggested Test Cases

### Easy to Find:
- **Zodiac Killer** (already configured)
- **Jack the Ripper** (historical)
- **DB Cooper** (unsolved hijacking)
- **Amelia Earhart** (missing person)

### Modern Cases:
- Cases from NamUs database
- FBI ViCAP bulletins
- Local news cold case reports

## Tips for Finding Cases

1. **Search Terms**:
   - "unsolved murder [location]"
   - "cold case [year]"
   - "missing person [location]"
   - "unidentified remains"

2. **News Archives**:
   - Local newspaper archives
   - Historical news databases
   - True crime websites

3. **Documentaries**:
   - Netflix true crime series
   - YouTube cold case channels
   - Podcast transcripts

## Future Enhancements

Planned features:
- [ ] Direct NamUs API integration
- [ ] ViCAP data import
- [ ] Case template library
- [ ] Community case sharing
- [ ] Bulk import from CSV/JSON

---

**Remember**: Always use public data only and respect privacy. The AI Detective is a tool to assist investigations, not replace them.
