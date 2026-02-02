// Script to fetch sample public cases for testing
// These are well-known public cases that can be used for testing

const sampleCases = [
  {
    id: `case-${Date.now()}-1`,
    title: "DB Cooper - Unsolved Hijacking",
    date: "1971-11-24",
    status: "cold",
    description: "On November 24, 1971, a man identifying himself as Dan Cooper hijacked Northwest Orient Airlines Flight 305, extorted $200,000 in ransom, and parachuted from the aircraft. Despite an extensive investigation, Cooper was never found and the case remains unsolved.",
    evidence: [
      {
        id: `ev-${Date.now()}-1`,
        type: "document",
        description: "Hijacker's note demanding $200,000 and parachutes",
        source: "FBI Evidence",
        date: "1971-11-24"
      },
      {
        id: `ev-${Date.now()}-2`,
        type: "witness",
        description: "Flight attendant descriptions of the hijacker",
        source: "Flight Crew Testimony",
        date: "1971-11-24"
      },
      {
        id: `ev-${Date.now()}-3`,
        type: "physical",
        description: "Tie and tie clip left on the aircraft",
        source: "FBI Evidence",
        date: "1971-11-24"
      }
    ],
    priority: "high",
    jurisdiction: "Oregon, USA",
    tags: ["hijacking", "unsolved", "famous"],
    privacyFlags: {
      anonymized: true,
      publicDataOnly: true,
      requiresVerification: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: `case-${Date.now()}-2`,
    title: "Amelia Earhart Disappearance",
    date: "1937-07-02",
    status: "cold",
    description: "Aviation pioneer Amelia Earhart and navigator Fred Noonan disappeared over the Pacific Ocean during their attempt to circumnavigate the globe. Despite extensive searches, no definitive evidence of their fate has been found.",
    evidence: [
      {
        id: `ev-${Date.now()}-4`,
        type: "document",
        description: "Last radio transmissions from Earhart",
        source: "Coast Guard Records",
        date: "1937-07-02"
      },
      {
        id: `ev-${Date.now()}-5`,
        type: "physical",
        description: "Possible aircraft wreckage found on Nikumaroro Island",
        source: "TIGHAR Research",
        date: "Various"
      },
      {
        id: `ev-${Date.now()}-6`,
        type: "document",
        description: "Flight plan and navigation logs",
        source: "Historical Records",
        date: "1937-07-02"
      }
    ],
    priority: "high",
    jurisdiction: "Pacific Ocean",
    tags: ["aviation", "missing person", "historical"],
    privacyFlags: {
      anonymized: true,
      publicDataOnly: true,
      requiresVerification: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: `case-${Date.now()}-3`,
    title: "The Somerton Man - Tamam Shud Case",
    date: "1948-12-01",
    status: "cold",
    description: "An unidentified man was found dead on Somerton Beach in Adelaide, Australia. A scrap of paper with 'Tamam Shud' (Persian for 'ended' or 'finished') was found in a hidden pocket. The case remains one of Australia's most famous unsolved mysteries.",
    evidence: [
      {
        id: `ev-${Date.now()}-7`,
        type: "physical",
        description: "Tamam Shud scrap of paper",
        source: "Police Evidence",
        date: "1948-12-01"
      },
      {
        id: `ev-${Date.now()}-8`,
        type: "document",
        description: "Code found in book of Persian poetry",
        source: "Police Evidence",
        date: "1948-12-01"
      },
      {
        id: `ev-${Date.now()}-9`,
        type: "physical",
        description: "Unusual physical characteristics noted in autopsy",
        source: "Medical Examiner",
        date: "1948-12-01"
      }
    ],
    priority: "high",
    jurisdiction: "Adelaide, Australia",
    tags: ["unidentified", "code", "historical"],
    privacyFlags: {
      anonymized: true,
      publicDataOnly: true,
      requiresVerification: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Save to file
const fs = require('fs')
const path = require('path')

const outputPath = path.join(__dirname, '..', 'sample-cases.json')
fs.writeFileSync(outputPath, JSON.stringify(sampleCases, null, 2))

console.log(`✅ Created ${sampleCases.length} sample cases`)
console.log(`📁 Saved to: ${outputPath}`)
console.log('\n📋 Sample cases created:')
sampleCases.forEach((c, i) => {
  console.log(`   ${i + 1}. ${c.title}`)
})
console.log('\n💡 You can import these cases manually through the UI or use them as templates.')
