// Simple in-memory cache for reasoning chains
// In production, use Redis or database

const reasoningCache = new Map<string, any>()

export function getReasoningChain(caseId: string): any | null {
  return reasoningCache.get(caseId) || null
}

export function setReasoningChain(caseId: string, chain: any): void {
  reasoningCache.set(caseId, chain)
  // Keep only last 50 chains
  if (reasoningCache.size > 50) {
    const firstKey = reasoningCache.keys().next().value
    reasoningCache.delete(firstKey)
  }
}

export function clearReasoningCache(): void {
  reasoningCache.clear()
}
