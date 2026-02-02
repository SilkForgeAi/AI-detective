// Privacy and anonymization utilities

export interface PrivacyConfig {
  anonymizeNames: boolean
  anonymizeLocations: boolean
  redactSensitiveInfo: boolean
  publicDataOnly: boolean
}

const defaultConfig: PrivacyConfig = {
  anonymizeNames: true,
  anonymizeLocations: false,
  redactSensitiveInfo: true,
  publicDataOnly: true,
}

// Common patterns for sensitive information
const SENSITIVE_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
}

// Common name patterns (simplified - can be enhanced with NER)
const NAME_PATTERNS = [
  /\b(Mr|Mrs|Ms|Dr)\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(Jr|Sr|III|IV)\b/g,
]

export function anonymizeText(text: string, config: PrivacyConfig = defaultConfig): string {
  let anonymized = text

  if (config.redactSensitiveInfo) {
    // Redact SSNs, phone numbers, emails, credit cards
    anonymized = anonymized.replace(SENSITIVE_PATTERNS.ssn, '[SSN REDACTED]')
    anonymized = anonymized.replace(SENSITIVE_PATTERNS.phone, '[PHONE REDACTED]')
    anonymized = anonymized.replace(SENSITIVE_PATTERNS.email, '[EMAIL REDACTED]')
    anonymized = anonymized.replace(SENSITIVE_PATTERNS.creditCard, '[CARD REDACTED]')
  }

  if (config.anonymizeNames) {
    // Replace potential names with placeholders
    NAME_PATTERNS.forEach(pattern => {
      anonymized = anonymized.replace(pattern, '[NAME REDACTED]')
    })
    
    // Simple heuristic: capitalize words that might be names
    // This is a simplified approach - production should use NER
    const words = anonymized.split(/\s+/)
    const anonymizedWords = words.map(word => {
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word) && Math.random() > 0.7) {
        return '[NAME]'
      }
      return word
    })
    anonymized = anonymizedWords.join(' ')
  }

  return anonymized
}

export function validatePublicDataOnly(data: any): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check for indicators of non-public data
  const dataString = JSON.stringify(data).toLowerCase()
  
  const restrictedIndicators = [
    'confidential',
    'classified',
    'sealed',
    'restricted',
    'internal use only',
    'law enforcement only',
  ]

  restrictedIndicators.forEach(indicator => {
    if (dataString.includes(indicator)) {
      warnings.push(`Potential restricted data detected: "${indicator}"`)
    }
  })

  return {
    valid: warnings.length === 0,
    warnings,
  }
}

export function createAuditEntry(
  action: string,
  details: Record<string, any>,
  userId?: string
): { timestamp: string; action: string; userId?: string; details: Record<string, any> } {
  return {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details: {
      ...details,
      privacyFlags: {
        anonymized: true,
        publicDataOnly: true,
      },
    },
  }
}
