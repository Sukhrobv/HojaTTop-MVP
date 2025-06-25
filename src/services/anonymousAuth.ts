// Anonymous authentication service for HojaTTop
// Handles anonymous ID generation and user anonymity preferences

// Generate unique anonymous ID for registered users
export function generateAnonymousId(): string {
    // Generate 6-character uppercase alphanumeric ID
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  }
  
  // Generate anonymous display name with prefix
  export function generateAnonymousDisplayName(anonymousId?: string): string {
    const id = anonymousId || generateAnonymousId()
    return `Аноним #${id}`
  }
  
  // Validate anonymous ID format
  export function isValidAnonymousId(id: string): boolean {
    // Should be 6 characters, uppercase letters and numbers only
    const pattern = /^[A-Z0-9]{6}$/
    return pattern.test(id)
  }
  
  // Generate fallback ID if current one is invalid
  export function ensureValidAnonymousId(currentId?: string): string {
    if (currentId && isValidAnonymousId(currentId)) {
      return currentId
    }
    return generateAnonymousId()
  }
  
  // Check if display name is anonymous
  export function isAnonymousDisplayName(displayName: string): boolean {
    return displayName.startsWith('Аноним #')
  }
  
  // Extract anonymous ID from display name
  export function extractAnonymousId(displayName: string): string | null {
    const match = displayName.match(/^Аноним #([A-Z0-9]{6})$/)
    return match ? match[1] : null
  }
  
  // Generate multiple unique IDs (for testing or batch operations)
  export function generateMultipleAnonymousIds(count: number): string[] {
    const ids = new Set<string>()
    
    while (ids.size < count) {
      ids.add(generateAnonymousId())
    }
    
    return Array.from(ids)
  }
  
  // Anonymous ID utilities for display formatting
  export const AnonymousIdUtils = {
    generate: generateAnonymousId,
    generateDisplayName: generateAnonymousDisplayName,
    isValid: isValidAnonymousId,
    ensureValid: ensureValidAnonymousId,
    isAnonymousName: isAnonymousDisplayName,
    extractId: extractAnonymousId,
    generateMultiple: generateMultipleAnonymousIds
  }