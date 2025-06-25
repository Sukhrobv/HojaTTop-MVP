// Authentication storage service for HojaTTop
// Handles saving/loading user auth data to/from AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthUser, UserDisplayPreferences } from '@/types/auth'
import { AnonymousIdUtils } from './anonymousAuth'

// Storage keys
const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  IS_REGISTERED: 'is_registered',
  ANONYMOUS_PREFERENCES: 'anonymous_preferences',
  FIRST_LAUNCH: 'first_launch_completed'
} as const

// Default preferences for new users
const DEFAULT_PREFERENCES: UserDisplayPreferences = {
  useAnonymousMode: false, // Start with real name by default
  anonymousId: '',
  userName: ''
}

export class AuthStorageService {
  
  // Check if this is the first app launch
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunchCompleted = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH)
      return firstLaunchCompleted === null
    } catch (error) {
      console.error('Error checking first launch:', error)
      return true // Assume first launch on error
    }
  }

  // Mark first launch as completed
  static async markFirstLaunchCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true')
    } catch (error) {
      console.error('Error marking first launch completed:', error)
    }
  }

  // Save authenticated user data
  static async saveUser(user: AuthUser): Promise<boolean> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_USER, JSON.stringify(user)],
        [STORAGE_KEYS.IS_REGISTERED, 'true']
      ])
      
      console.log('User data saved successfully:', user.userName)
      return true
    } catch (error) {
      console.error('Error saving user data:', error)
      return false
    }
  }

  // Load authenticated user data
  static async loadUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER)
      
      if (!userData) {
        return null
      }

      const user: AuthUser = JSON.parse(userData)
      
      // Validate and ensure anonymous ID exists
      user.anonymousId = AnonymousIdUtils.ensureValid(user.anonymousId)
      
      return user
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }

  // Check if user is registered
  static async isUserRegistered(): Promise<boolean> {
    try {
      const isRegistered = await AsyncStorage.getItem(STORAGE_KEYS.IS_REGISTERED)
      return isRegistered === 'true'
    } catch (error) {
      console.error('Error checking registration status:', error)
      return false
    }
  }

  // Save user display preferences (anonymous mode toggle)
  static async saveDisplayPreferences(preferences: UserDisplayPreferences): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ANONYMOUS_PREFERENCES, 
        JSON.stringify(preferences)
      )
      console.log('Display preferences saved:', preferences)
      return true
    } catch (error) {
      console.error('Error saving display preferences:', error)
      return false
    }
  }

  // Load user display preferences
  static async loadDisplayPreferences(): Promise<UserDisplayPreferences> {
    try {
      const preferencesData = await AsyncStorage.getItem(STORAGE_KEYS.ANONYMOUS_PREFERENCES)
      
      if (!preferencesData) {
        return { ...DEFAULT_PREFERENCES }
      }

      const preferences: UserDisplayPreferences = JSON.parse(preferencesData)
      
      // Ensure anonymous ID is valid
      preferences.anonymousId = AnonymousIdUtils.ensureValid(preferences.anonymousId)
      
      return preferences
    } catch (error) {
      console.error('Error loading display preferences:', error)
      return { ...DEFAULT_PREFERENCES }
    }
  }

  // Update user's anonymous mode setting
  static async toggleAnonymousMode(userId: string, useAnonymousMode: boolean): Promise<boolean> {
    try {
      const user = await this.loadUser()
      if (!user || user.id !== userId) {
        return false
      }

      // Update user data
      user.useAnonymousMode = useAnonymousMode
      const userSaved = await this.saveUser(user)

      // Update preferences
      const preferences: UserDisplayPreferences = {
        useAnonymousMode,
        anonymousId: user.anonymousId,
        userName: user.userName
      }
      const preferencesSaved = await this.saveDisplayPreferences(preferences)

      return userSaved && preferencesSaved
    } catch (error) {
      console.error('Error toggling anonymous mode:', error)
      return false
    }
  }

  // Get current display name based on user preferences
  static async getCurrentDisplayName(): Promise<string> {
    try {
      const user = await this.loadUser()
      
      if (!user) {
        return 'Гость' // For non-registered users
      }

      if (user.useAnonymousMode) {
        return AnonymousIdUtils.generateDisplayName(user.anonymousId)
      } else {
        return user.userName
      }
    } catch (error) {
      console.error('Error getting current display name:', error)
      return 'Пользователь'
    }
  }

  // Initialize storage for new user registration
  static async initializeNewUser(userData: {
    userName: string
    email?: string
  }): Promise<AuthUser> {
    const now = Date.now()
    const anonymousId = AnonymousIdUtils.generate()
    
    const newUser: AuthUser = {
      id: `user_${now}_${Math.random().toString(36).substr(2, 9)}`,
      userName: userData.userName,
      email: userData.email,
      anonymousId,
      useAnonymousMode: false, // Start with real name
      registeredAt: now,
      reviewCount: 0,
      isEmailVerified: false
    }

    await this.saveUser(newUser)
    await this.markFirstLaunchCompleted()
    
    return newUser
  }

  // Clear all auth data (logout)
  static async clearAuthData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_USER,
        STORAGE_KEYS.IS_REGISTERED,
        STORAGE_KEYS.ANONYMOUS_PREFERENCES
      ])
      console.log('Auth data cleared successfully')
      return true
    } catch (error) {
      console.error('Error clearing auth data:', error)
      return false
    }
  }

  // Get storage info for debugging
  static async getStorageInfo(): Promise<{
    isRegistered: boolean
    hasUserData: boolean
    displayPreferences: UserDisplayPreferences | null
    isFirstLaunch: boolean
  }> {
    try {
      const [isRegistered, userData, preferences, isFirstLaunch] = await Promise.all([
        this.isUserRegistered(),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER),
        this.loadDisplayPreferences(),
        this.isFirstLaunch()
      ])

      return {
        isRegistered,
        hasUserData: userData !== null,
        displayPreferences: preferences,
        isFirstLaunch
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return {
        isRegistered: false,
        hasUserData: false,
        displayPreferences: null,
        isFirstLaunch: true
      }
    }
  }
}