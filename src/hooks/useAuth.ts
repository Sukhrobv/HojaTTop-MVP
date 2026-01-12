// Authentication hook for HojaTTop
// Manages auth state and provides auth-related functions
// ВРЕМЕННО: работает только с локальным хранилищем, без Firebase Auth

import { useState, useEffect, useCallback } from 'react'
import { AuthState, AuthUser, RegisterData, RegistrationResult, AnonymousToggleResult, LoginResult } from '@/types/auth'
import { AuthStorageService } from '@/services/authStorage'
import { AnonymousIdUtils } from '@/services/anonymousAuth'
import { generateShortId } from '@/utils/id'

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isRegistered: false,
  user: null,
  loading: true,
  error: null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)

  // Initialize auth state from storage
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // ВРЕМЕННО: пропускаем Firebase Auth, используем только локальное хранилище
      const [isRegistered, user] = await Promise.all([
        AuthStorageService.isUserRegistered(),
        AuthStorageService.loadUser()
      ])

      setAuthState({
        isAuthenticated: user !== null,
        isRegistered,
        user,
        loading: false,
        error: null
      })

      console.log('Auth initialized (local only):', { isRegistered, hasUser: user !== null })
    } catch (error) {
      console.error('Error initializing auth:', error)
      setAuthState({
        ...initialAuthState,
        loading: false,
        error: 'Ошибка инициализации авторизации'
      })
    }
  }, [])

  // Register new user
  const register = useCallback(async (data: RegisterData): Promise<RegistrationResult> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Validate input
      if (!data.userName.trim()) {
        return { success: false, error: 'Имя пользователя обязательно' }
      }

      if (data.userName.trim().length < 2) {
        return { success: false, error: 'Имя пользователя должно содержать минимум 2 символа' }
      }

      if (!data.password || data.password.length < 6) {
        return { success: false, error: 'Пароль должен содержать минимум 6 символов' }
      }

      // Check if already registered
      const isAlreadyRegistered = await AuthStorageService.isUserRegistered()
      if (isAlreadyRegistered) {
        return { success: false, error: 'Пользователь уже зарегистрирован' }
      }

      // ВРЕМЕННО: генерируем локальный ID вместо Firebase
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const shortId = generateShortId()
      const dummyEmail = `${data.userName.trim().replace(/\s+/g, '_').toLowerCase()}_${Date.now()}@hojattop.local`

      // Create user in local storage
      const newUser = await AuthStorageService.initializeNewUser({
        id: localId,
        userName: data.userName.trim(),
        email: dummyEmail,
        shortId
      })

      setAuthState({
        isAuthenticated: true,
        isRegistered: true,
        user: newUser,
        loading: false,
        error: null
      })

      return { success: true, user: newUser }
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = 'Ошибка при регистрации'
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      return { success: false, error: errorMessage }
    }
  }, [])

  // Login user (Placeholder for now)
  const login = useCallback(async (data: RegisterData): Promise<LoginResult> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      if (!data.userName.trim() || !data.password) {
        return { success: false, error: 'Введите имя пользователя и пароль' }
      }

      // ВРЕМЕННО: вход не поддерживается
      return { success: false, error: 'Вход временно не поддерживается. Пожалуйста, создайте новый профиль.' }

    } catch (error: any) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Ошибка при входе'
      }))
      return { success: false, error: 'Ошибка при входе' }
    }
  }, [])

  // Toggle anonymous mode
  const toggleAnonymousMode = useCallback(async (): Promise<AnonymousToggleResult> => {
    try {
      if (!authState.user) {
        return { success: false, newDisplayName: '', error: 'Пользователь не авторизован' }
      }

      const newAnonymousMode = !authState.user.useAnonymousMode
      const success = await AuthStorageService.toggleAnonymousMode(
        authState.user.id, 
        newAnonymousMode
      )

      if (!success) {
        return { success: false, newDisplayName: '', error: 'Не удалось изменить настройки' }
      }

      // Update local state
      const updatedUser = {
        ...authState.user,
        useAnonymousMode: newAnonymousMode
      }

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }))

      const newDisplayName = newAnonymousMode 
        ? AnonymousIdUtils.generateDisplayName(updatedUser.anonymousId)
        : updatedUser.userName

      return { success: true, newDisplayName }
    } catch (error) {
      console.error('Error toggling anonymous mode:', error)
      return { success: false, newDisplayName: '', error: 'Ошибка при изменении режима' }
    }
  }, [authState.user])

  // Get current display name
  const getCurrentDisplayName = useCallback((): string => {
    if (!authState.user) {
      return 'Гость'
    }

    if (authState.user.useAnonymousMode) {
      return AnonymousIdUtils.generateDisplayName(authState.user.anonymousId)
    } else {
      return authState.user.userName
    }
  }, [authState.user])

  // Check if user can leave reviews
  const canLeaveReviews = useCallback((): boolean => {
    return authState.isAuthenticated && authState.isRegistered
  }, [authState.isAuthenticated, authState.isRegistered])

  // Logout user
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      const success = await AuthStorageService.clearAuthData()
      
      if (success) {
        setAuthState(initialAuthState)
      }
      
      return success
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }, [])

  // Refresh auth state
  const refreshAuth = useCallback(() => {
    initializeAuth()
  }, [initializeAuth])

  // Check if this is first app launch
  const checkFirstLaunch = useCallback(async (): Promise<boolean> => {
    try {
      return await AuthStorageService.isFirstLaunch()
    } catch (error) {
      console.error('Error checking first launch:', error)
      return true
    }
  }, [])

  // Get debug info
  const getDebugInfo = useCallback(async () => {
    try {
      const storageInfo = await AuthStorageService.getStorageInfo()
      return {
        authState,
        storageInfo,
        currentDisplayName: getCurrentDisplayName()
      }
    } catch (error) {
      console.error('Error getting debug info:', error)
      return null
    }
  }, [authState, getCurrentDisplayName])

  // Initialize on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    // State
    ...authState,
    
    // Actions
    register,
    login,
    logout,
    toggleAnonymousMode,
    refreshAuth,
    
    // Getters
    getCurrentDisplayName,
    canLeaveReviews,
    checkFirstLaunch,
    
    // Utils
    getDebugInfo
  }
}
