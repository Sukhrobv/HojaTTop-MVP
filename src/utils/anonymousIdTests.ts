// Tests for anonymous ID generation
// Run these tests to verify anonymous ID functionality

import { AnonymousIdUtils } from '@/services/anonymousAuth'

// Test runner for React Native (console-based)
export function runAnonymousIdTests(): void {
  console.log('🧪 Running Anonymous ID Tests...\n')

  // Test 1: Basic ID generation
  testBasicIdGeneration()
  
  // Test 2: ID format validation
  testIdFormatValidation()
  
  // Test 3: Display name generation
  testDisplayNameGeneration()
  
  // Test 4: Uniqueness test
  testIdUniqueness()
  
  // Test 5: Utility functions
  testUtilityFunctions()
  
  console.log('✅ All Anonymous ID tests completed!')
}

function testBasicIdGeneration(): void {
  console.log('Test 1: Basic ID Generation')
  
  try {
    const id1 = AnonymousIdUtils.generate()
    const id2 = AnonymousIdUtils.generate()
    
    // Should be 6 characters
    console.assert(id1.length === 6, `❌ ID length should be 6, got ${id1.length}`)
    console.assert(id2.length === 6, `❌ ID length should be 6, got ${id2.length}`)
    
    // Should be uppercase
    console.assert(id1 === id1.toUpperCase(), `❌ ID should be uppercase: ${id1}`)
    console.assert(id2 === id2.toUpperCase(), `❌ ID should be uppercase: ${id2}`)
    
    // Should be different
    console.assert(id1 !== id2, `❌ IDs should be unique: ${id1} === ${id2}`)
    
    console.log(`✅ Generated IDs: ${id1}, ${id2}`)
  } catch (error) {
    console.error('❌ Basic ID generation test failed:', error)
  }
  
  console.log('')
}

function testIdFormatValidation(): void {
  console.log('Test 2: ID Format Validation')
  
  try {
    // Valid IDs
    console.assert(AnonymousIdUtils.isValid('ABC123'), '❌ ABC123 should be valid')
    console.assert(AnonymousIdUtils.isValid('XYZ789'), '❌ XYZ789 should be valid')
    console.assert(AnonymousIdUtils.isValid('000000'), '❌ 000000 should be valid')
    
    // Invalid IDs
    console.assert(!AnonymousIdUtils.isValid('abc123'), '❌ abc123 should be invalid (lowercase)')
    console.assert(!AnonymousIdUtils.isValid('ABC12'), '❌ ABC12 should be invalid (too short)')
    console.assert(!AnonymousIdUtils.isValid('ABC1234'), '❌ ABC1234 should be invalid (too long)')
    console.assert(!AnonymousIdUtils.isValid('ABC@23'), '❌ ABC@23 should be invalid (special chars)')
    console.assert(!AnonymousIdUtils.isValid(''), '❌ Empty string should be invalid')
    
    console.log('✅ All validation tests passed')
  } catch (error) {
    console.error('❌ ID format validation test failed:', error)
  }
  
  console.log('')
}

function testDisplayNameGeneration(): void {
  console.log('Test 3: Display Name Generation')
  
  try {
    // Generate with existing ID
    const displayName1 = AnonymousIdUtils.generateDisplayName('ABC123')
    console.assert(displayName1 === 'Аноним #ABC123', `❌ Expected 'Аноним #ABC123', got '${displayName1}'`)
    
    // Generate with auto-generated ID
    const displayName2 = AnonymousIdUtils.generateDisplayName()
    console.assert(displayName2.startsWith('Аноним #'), `❌ Display name should start with 'Аноним #': ${displayName2}`)
    console.assert(displayName2.length === 13, `❌ Display name should be 13 chars: ${displayName2}`)
    
    // Test extraction
    const extractedId = AnonymousIdUtils.extractId(displayName1)
    console.assert(extractedId === 'ABC123', `❌ Extracted ID should be 'ABC123', got '${extractedId}'`)
    
    // Test anonymous name detection
    console.assert(AnonymousIdUtils.isAnonymousName(displayName1), `❌ Should detect anonymous name: ${displayName1}`)
    console.assert(!AnonymousIdUtils.isAnonymousName('John Doe'), `❌ Should not detect regular name as anonymous`)
    
    console.log(`✅ Display names: ${displayName1}, ${displayName2}`)
  } catch (error) {
    console.error('❌ Display name generation test failed:', error)
  }
  
  console.log('')
}

function testIdUniqueness(): void {
  console.log('Test 4: ID Uniqueness')
  
  try {
    const ids = AnonymousIdUtils.generateMultiple(100)
    const uniqueIds = new Set(ids)
    
    console.assert(ids.length === 100, `❌ Should generate 100 IDs, got ${ids.length}`)
    console.assert(uniqueIds.size === 100, `❌ All IDs should be unique, got ${uniqueIds.size} unique out of 100`)
    
    // Check format of all IDs
    for (const id of ids) {
      console.assert(AnonymousIdUtils.isValid(id), `❌ Generated ID should be valid: ${id}`)
    }
    
    console.log(`✅ Generated 100 unique IDs successfully`)
  } catch (error) {
    console.error('❌ ID uniqueness test failed:', error)
  }
  
  console.log('')
}

function testUtilityFunctions(): void {
  console.log('Test 5: Utility Functions')
  
  try {
    // Test ensureValid with valid ID
    const validId = AnonymousIdUtils.ensureValid('ABC123')
    console.assert(validId === 'ABC123', `❌ Should keep valid ID: ${validId}`)
    
    // Test ensureValid with invalid ID
    const fixedId = AnonymousIdUtils.ensureValid('invalid')
    console.assert(AnonymousIdUtils.isValid(fixedId), `❌ Should generate valid ID: ${fixedId}`)
    
    // Test ensureValid with undefined
    const newId = AnonymousIdUtils.ensureValid(undefined)
    console.assert(AnonymousIdUtils.isValid(newId), `❌ Should generate valid ID from undefined: ${newId}`)
    
    console.log(`✅ Utility functions work correctly`)
  } catch (error) {
    console.error('❌ Utility functions test failed:', error)
  }
  
  console.log('')
}

// Export individual test functions for selective testing
export {
  testBasicIdGeneration,
  testIdFormatValidation,
  testDisplayNameGeneration,
  testIdUniqueness,
  testUtilityFunctions
}