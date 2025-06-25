// Authentication types for HojaTTop
// Extends existing types with authentication and anonymity features

import type { Review } from '@/types'

// User authentication state
export interface AuthState {
  isAuthenticated: boolean
  isRegistered: boolean
  user: AuthUser | null
  loading: boolean
  error: string | null
}

// Authenticated user information
export interface AuthUser {
  id: string
  userName: string
  email?: string
  anonymousId: string // Generated 6-character ID for anonymous mode
  useAnonymousMode: boolean // Toggle for anonymous display
  registeredAt: number // Timestamp
  reviewCount: number
  isEmailVerified?: boolean
}

// Registration data
export interface RegisterData {
  userName: string
  email?: string // Optional email for recovery
  anonymousId?: string // Pre-generated or will be created
}

// User display preferences
export interface UserDisplayPreferences {
  useAnonymousMode: boolean
  anonymousId: string
  userName: string
}

// Review author information (updated to support anonymity)
export interface ReviewAuthor {
  id: string
  displayName: string // Either userName or "Аноним #ABC123"
  isAnonymous: boolean
  anonymousId?: string // Present if isAnonymous is true
}

// Extended Review interface with proper author handling
export interface AuthenticatedReview extends Omit<Review, 'userName'> {
  author: ReviewAuthor
  canEdit: boolean // True if current user is the author
  canDelete: boolean // True if current user is the author
}

// Authentication actions
export type AuthAction = 
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOGGLE_ANONYMOUS_MODE'; payload: boolean }
  | { type: 'UPDATE_USER_DATA'; payload: Partial<AuthUser> }

// Registration result
export interface RegistrationResult {
  success: boolean
  user?: AuthUser
  error?: string
}

// Login result
export interface LoginResult {
  success: boolean
  user?: AuthUser
  error?: string
}

// Anonymous mode toggle result
export interface AnonymousToggleResult {
  success: boolean
  newDisplayName: string
  error?: string
}

// User statistics
export interface UserStats {
  totalReviews: number
  averageRating: number
  joinedDaysAgo: number
  lastReviewDate?: number
}

// Re-export existing types for convenience
export type { 
  Toilet, 
  Review, 
  ToiletFeatures, 
  Coordinates, 
  LocationWithDistance,
  Filters,
  DataSource,
  DataState,
  FeatureCounts
} from '@/types'