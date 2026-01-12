# Implementation Plan - Authorization System (VI-A)

## Goal Description

Implement a flexible authorization system that supports:

1.  **Anonymous Mode (Default):** Users are assigned a unique ID upon first launch, allowing them to use the app and leave reviews immediately.
2.  **User Registration:** Users can optionally register (Nickname + Password/Email) to save their history and remove limitations.
3.  **Profile Management:** Basic profile screen to view status, switch modes, and see review history.

## User Review Required

> [!IMPORTANT] > **Anonymous ID Persistence:** We will use `AsyncStorage` to persist the Anonymous ID. If the user clears app data, this ID will be lost.
> **Firebase Auth:** We will use Firebase Anonymous Auth for the "Anonymous" state to leverage Firebase security rules easily, and then link credentials if they register.

## Proposed Changes

### Core Services

#### [NEW] [AuthService.ts](file:///c:/Users/HojaTTop/src/services/AuthService.ts)

- `signInAnonymously()`: wrapper for Firebase `signInAnonymously`.
- `linkCredential()`: to upgrade anonymous account to permanent.
- `getCurrentUser()`: returns current user state.
- `logout()`: signs out (if registered) or resets.

#### [MODIFY] [App.tsx](file:///c:/Users/HojaTTop/App.tsx)

- Initialize Auth listener on startup.
- Ensure navigation handles auth state (though most screens are public).

### Screens

#### [NEW] [AuthScreen.tsx](file:///c:/Users/HojaTTop/src/screens/AuthScreen.tsx)

- Login / Registration form.
- "Continue as Anonymous" option (if not already).

#### [NEW] [ProfileScreen.tsx](file:///c:/Users/HojaTTop/src/screens/ProfileScreen.tsx)

- Displays: "Anonymous User #123" or "Nickname".
- Stats: Number of reviews.
- Actions: "Register/Login" (if anonymous), "Logout".

#### [MODIFY] [AddReviewScreen.tsx](file:///c:/Users/HojaTTop/src/screens/AddReviewScreen.tsx)

- Auto-fill "Author" field with current user's nickname or ID.
- If anonymous, show a hint: "Register to choose a nickname".

### Types

#### [MODIFY] [types/index.ts](file:///c:/Users/HojaTTop/src/types/index.ts)

- Add `User` interface (id, isAnonymous, nickname, etc.).

## Verification Plan

### Automated Tests

- None planned for this MVP phase.

### Manual Verification

1.  **Fresh Install:** Launch app -> Verify "Anonymous" state in Profile.
2.  **Leave Review:** Verify review is submitted with Anonymous ID.
3.  **Register:** Go to Profile -> Register -> Verify account is linked.
4.  **Leave Review (Registered):** Verify review has Nickname.
5.  **Logout:** Verify return to Anonymous state (or new anonymous session).
