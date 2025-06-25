// Tests for AuthStorageService
// Run these tests to verify AsyncStorage functionality

import { AuthStorageService } from '@/services/authStorage'
import { AuthUser } from '@/types/auth'

// Test runner for AuthStorage
export async function runAuthStorageTests(): Promise<void> {
  console.log('🧪 Running AuthStorage Tests...\n')

  // Clear any existing data first
  await AuthStorageService.clearAuthData()

  // Test 1: First launch detection
  await testFirstLaunchDetection()
  
  // Test 2: User registration and storage
  await testUserRegistrationAndStorage()
  
  // Test 3: Display preferences
  await testDisplayPreferences()
  
  // Test 4: Anonymous mode toggle
  await testAnonymousModeToggle()
  
  // Test 5: Data persistence
  await testDataPersistence()
  
  // Test 6: Cleanup
  await testDataCleanup()
  
  console.log('✅ All AuthStorage tests completed!')
}

async function testFirstLaunchDetection(): Promise<void> {
  console.log('Test 1: First Launch Detection')
  
  try {
    // Should be first launch after clearing data
    const isFirstLaunch = await AuthStorageService.isFirstLaunch()
    console.assert(isFirstLaunch === true, `❌ Should be first launch, got ${isFirstLaunch}`)
    
    // Mark as completed
    await AuthStorageService.markFirstLaunchCompleted()
    
    // Should no longer be first launch
    const isFirstLaunchAfter = await AuthStorageService.isFirstLaunch()
    console.assert(isFirstLaunchAfter === false, `❌ Should not be first launch after marking, got ${isFirstLaunchAfter}`)
    
    console.log('✅ First launch detection works correctly')
  } catch (error) {
    console.error('❌ First launch detection test failed:', error)
  }
  
  console.log('')
}

async function testUserRegistrationAndStorage(): Promise<void> {
  console.log('Test 2: User Registration and Storage')
  
  try {
    // Initially should not be registered
    const initiallyRegistered = await AuthStorageService.isUserRegistered()
    console.assert(initiallyRegistered === false, `❌ Should not be registered initially, got ${initiallyRegistered}`)
    
    // Create new user
    const newUser = await AuthStorageService.initializeNewUser({
      userName: 'TestUser',
      email: 'test@example.com'
    })
    
    // Verify user data
    console.assert(newUser.userName === 'TestUser', `❌ Username should be 'TestUser', got '${newUser.userName}'`)
    console.assert(newUser.email === 'test@example.com', `❌ Email should be 'test@example.com', got '${newUser.email}'`)
    console.assert(newUser.anonymousId.length === 6, `❌ Anonymous ID should be 6 chars, got ${newUser.anonymousId.length}`)
    console.assert(newUser.useAnonymousMode === false, `❌ Should start with real name, got ${newUser.useAnonymousMode}`)
    
    // Should now be registered
    const nowRegistered = await AuthStorageService.isUserRegistered()
    console.assert(nowRegistered === true, `❌ Should be registered after initialization, got ${nowRegistered}`)
    
    // Load user data
    const loadedUser = await AuthStorageService.loadUser()
    console.assert(loadedUser !== null, '❌ Should load user data')
    console.assert(loadedUser?.userName === 'TestUser', `❌ Loaded username should be 'TestUser', got '${loadedUser?.userName}'`)
    
    console.log(`✅ User registration and storage works correctly`)
    console.log(`   User ID: ${newUser.id}`)
    console.log(`   Anonymous ID: ${newUser.anonymousId}`)
  } catch (error) {
    console.error('❌ User registration and storage test failed:', error)
  }
  
  console.log('')
}

async function testDisplayPreferences(): Promise<void> {
  console.log('Test 3: Display Preferences')
  
  try {
    // Load initial preferences
    const initialPrefs = await AuthStorageService.loadDisplayPreferences()
    console.assert(initialPrefs.useAnonymousMode === false, `❌ Should start with real name, got ${initialPrefs.useAnonymousMode}`)
    console.assert(initialPrefs.anonymousId.length === 6, `❌ Anonymous ID should be 6 chars, got ${initialPrefs.anonymousId.length}`)
    
    // Update preferences
    const newPrefs = {
      useAnonymousMode: true,
      anonymousId: 'ABC123',
      userName: 'TestUser'
    }
    
    const saved = await AuthStorageService.saveDisplayPreferences(newPrefs)
    console.assert(saved === true, `❌ Should save preferences successfully, got ${saved}`)
    
    // Load updated preferences
    const loadedPrefs = await AuthStorageService.loadDisplayPreferences()
    console.assert(loadedPrefs.useAnonymousMode === true, `❌ Should use anonymous mode, got ${loadedPrefs.useAnonymousMode}`)
    console.assert(loadedPrefs.anonymousId === 'ABC123', `❌ Anonymous ID should be 'ABC123', got '${loadedPrefs.anonymousId}'`)
    
    console.log('✅ Display preferences work correctly')
  } catch (error) {
    console.error('❌ Display preferences test failed:', error)
  }
  
  console.log('')
}

async function testAnonymousModeToggle(): Promise<void> {
  console.log('Test 4: Anonymous Mode Toggle')
  
  try {
    // Get current user
    const user = await AuthStorageService.loadUser()
    console.assert(user !== null, '❌ User should exist')
    
    if (!user) return
    
    // Toggle to anonymous mode
    const toggledToAnonymous = await AuthStorageService.toggleAnonymousMode(user.id, true)
    console.assert(toggledToAnonymous === true, `❌ Should toggle to anonymous successfully, got ${toggledToAnonymous}`)
    
    // Check display name
    const anonymousDisplayName = await AuthStorageService.getCurrentDisplayName()
    console.assert(anonymousDisplayName.startsWith('Аноним #'), `❌ Should show anonymous name, got '${anonymousDisplayName}'`)
    
    // Toggle back to real name
    const toggledToReal = await AuthStorageService.toggleAnonymousMode(user.id, false)
    console.assert(toggledToReal === true, `❌ Should toggle to real name successfully, got ${toggledToReal}`)
    
    // Check display name
    const realDisplayName = await AuthStorageService.getCurrentDisplayName()
    console.assert(realDisplayName === 'TestUser', `❌ Should show real name 'TestUser', got '${realDisplayName}'`)
    
    console.log('✅ Anonymous mode toggle works correctly')
    console.log(`   Anonymous: ${anonymousDisplayName}`)
    console.log(`   Real: ${realDisplayName}`)
  } catch (error) {
    console.error('❌ Anonymous mode toggle test failed:', error)
  }
  
  console.log('')
}

async function testDataPersistence(): Promise<void> {
  console.log('Test 5: Data Persistence')
  
  try {
    // Get storage info
    const storageInfo = await AuthStorageService.getStorageInfo()
    
    console.assert(storageInfo.isRegistered === true, `❌ Should be registered, got ${storageInfo.isRegistered}`)
    console.assert(storageInfo.hasUserData === true, `❌ Should have user data, got ${storageInfo.hasUserData}`)
    console.assert(storageInfo.displayPreferences !== null, '❌ Should have display preferences')
    console.assert(storageInfo.isFirstLaunch === false, `❌ Should not be first launch, got ${storageInfo.isFirstLaunch}`)
    
    console.log('✅ Data persistence works correctly')
    console.log('   Storage Info:', storageInfo)
  } catch (error) {
    console.error('❌ Data persistence test failed:', error)
  }
  
  console.log('')
}

async function testDataCleanup(): Promise<void> {
  console.log('Test 6: Data Cleanup')
  
  try {
    // Clear all data
    const cleared = await AuthStorageService.clearAuthData()
    console.assert(cleared === true, `❌ Should clear data successfully, got ${cleared}`)
    
    // Verify data is cleared
    const isRegistered = await AuthStorageService.isUserRegistered()
    const user = await AuthStorageService.loadUser()
    
    console.assert(isRegistered === false, `❌ Should not be registered after clearing, got ${isRegistered}`)
    console.assert(user === null, `❌ Should have no user data after clearing, got ${user}`)
    
    console.log('✅ Data cleanup works correctly')
  } catch (error) {
    console.error('❌ Data cleanup test failed:', error)
  }
  
  console.log('')
}

// Export individual test functions for selective testing
export {
  testFirstLaunchDetection,
  testUserRegistrationAndStorage,
  testDisplayPreferences,
  testAnonymousModeToggle,
  testDataPersistence,
  testDataCleanup
}