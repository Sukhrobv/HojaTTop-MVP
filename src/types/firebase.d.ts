// Firebase module declarations for TypeScript
import type { FirebaseApp } from '@firebase/app-types'
import type { Persistence } from '@firebase/auth-types'

declare module 'firebase/app' {
  export function initializeApp(config: object): FirebaseApp
  export function getApps(): FirebaseApp[]
}

declare module 'firebase/auth' {
  import type { ReactNativeAsyncStorage } from '@react-native-async-storage/async-storage'
  
  export interface Auth {
    currentUser: any
  }
  
  export function initializeAuth(app: any, options?: {
    persistence?: Persistence
  }): Auth
  
  export function getAuth(app?: any): Auth
  
  export function getReactNativePersistence(storage: any): Persistence
  
  export function onAuthStateChanged(auth: Auth, callback: (user: any) => void): () => void
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<any>
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<any>
  export function signOut(auth: Auth): Promise<void>
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any
  export function collection(db: any, path: string): any
  export function doc(db: any, path: string, ...pathSegments: string[]): any
  export function addDoc(collectionRef: any, data: object): Promise<any>
  export function getDoc(docRef: any): Promise<any>
  export function getDocs(query: any): Promise<any>
  export function setDoc(docRef: any, data: object, options?: any): Promise<void>
  export function updateDoc(docRef: any, data: object): Promise<void>
  export function deleteDoc(docRef: any): Promise<void>
  export function query(collectionRef: any, ...queryConstraints: any[]): any
  export function where(field: string, op: string, value: any): any
  export function orderBy(field: string, direction?: 'asc' | 'desc'): any
  export function limit(n: number): any
  export function onSnapshot(query: any, callback: (snapshot: any) => void): () => void
  export const serverTimestamp: () => any
  export type Timestamp = {
    toDate(): Date
    seconds: number
    nanoseconds: number
  }
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any
  export function ref(storage: any, path?: string): any
  export function uploadBytes(ref: any, data: any): Promise<any>
  export function uploadBytesResumable(ref: any, data: any): any
  export function getDownloadURL(ref: any): Promise<string>
  export function deleteObject(ref: any): Promise<void>
}
