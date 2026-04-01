# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Always Do First

- Before writing any frontend code, review the **UI & Frontend Guidelines** section in this file and apply all rules without exception, every session, no exceptions.
- Prioritize visual polish, consistency, and accessibility in every component.
- Never skip loading states, empty states, or error handling in UI code.
- Always check `src/utils/constants.js` for existing color tokens and shared values before creating new ones.

## Commands

### Development

```bash
npm start          # Start Expo dev server (iOS/Android/Web)
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator
npm run web        # Run web version
```

### Code Quality

```bash
npm run lint       # ESLint
npm run format     # Prettier auto-format
npm test           # Jest (run all tests)
```

### Firebase Functions

```bash
cd functions
npm run serve      # Start Firebase emulator locally
npm run deploy     # Deploy functions to Firebase
npm run logs       # View deployed function logs
```

## Architecture

FairNest is a **React Native + Expo** app targeting Durham, NC residents facing housing discrimination. It is JavaScript-only (no TypeScript).

### Tech Stack

- **Mobile/Web:** React Native 0.72 + Expo ~49, React Navigation (stack)
- **Backend:** Firebase (Firestore, Auth, Cloud Storage, Cloud Functions)
- **AI:** OpenAI GPT-4.1-mini, called exclusively through a Firebase Cloud Function
- **Environment variables:** `react-native-dotenv` — import from `@env` (e.g., `import { FIREBASE_API_KEY } from '@env'`)

### Key Data Flows

**Auth:** `LoginScreen` / `SignUpScreen` → Firebase Auth (email/password or Google OAuth) → `AuthContext` (`src/context/AuthContext.js`) provides `user` to all screens.

**AI Chat:** `ChatInterface.js` → POST to Firebase Cloud Function (`functions/index.js` → OpenAI API). Messages are saved to two Firestore collections simultaneously:

- `users/{uid}/chatHistory` — per-user history shown in ProfileScreen
- `chatLogs` — admin-visible global log shown in AdminDashboardScreen

**Reports:** `ReportScreen.js` → evidence files uploaded to Firebase Storage → report document written to Firestore `reports` collection. Reports surface in `ProfileScreen` (filtered by userId) and `AdminDashboardScreen` (all reports).

### Key Files

- `src/firebaseConfig.js` — Firebase app initialization; all services (auth, firestore, storage) imported from here
- `src/context/AuthContext.js` — global auth state; wrap protected screens with this context
- `src/services/api.js` — HTTP calls to Firebase Cloud Functions
- `src/utils/constants.js` — shared colors, FAQ content, housing resources data
- `functions/index.js` — sole Cloud Function: validates request, calls OpenAI, returns `{ reply }`

### Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials and `API_BASE_URL`. The OpenAI API key is stored as a Firebase secret (not in `.env`).

### Firestore Collections

| Collection                | Purpose                                          |
| ------------------------- | ------------------------------------------------ |
| `users/{uid}/chatHistory` | Per-user AI chat messages                        |
| `chatLogs`                | Admin-visible all-user chat log                  |
| `reports`                 | Housing discrimination reports (field: `userId`) |

### Known Issue

`functions/index.js` line 57 references an undefined variable `userMessage` — the correct variable in scope is `message`. Fix this before relying on the deployed function.

## UI & Frontend Guidelines

### Design System

- **Primary color:** Pull from `src/utils/constants.js` color tokens — never hardcode hex values inline
- **Typography:** Use consistent font sizes (title: 24px, subtitle: 18px, body: 14px, caption: 12px)
- **Spacing:** Use multiples of 4 (4, 8, 12, 16, 24, 32) — no arbitrary spacing values
- **Border radius:** 8px for cards, 24px for buttons/pills, 50% for avatars

### Component Patterns

- All screen components live in `src/screens/`, reusable UI in `src/components/`
- Use `StyleSheet.create()` at the bottom of every file — no inline style objects
- Wrap touchable elements in `TouchableOpacity` (not `Pressable` or `TouchableHighlight`)
- Use `ScrollView` with `contentContainerStyle` for scrollable screens
- Loading states: always show `ActivityIndicator` centered on screen while async calls resolve
- Empty states: always render a friendly message with an icon — never a blank screen

### Navigation

- Stack navigator only (React Navigation) — no tabs or drawer currently
- Pass minimal data via route params; fetch full data from Firestore inside the screen
- Always define `navigation.setOptions({ title: '...' })` at the top of each screen

### Firebase / Data

- All Firestore reads/writes go through dedicated functions — no raw SDK calls inside JSX
- Always handle loading + error states for every Firestore query
- Storage uploads must show upload progress to the user

### Accessibility

- Every `TouchableOpacity` needs an `accessibilityLabel` prop
- Images need `accessibilityRole="image"` and descriptive labels
- Maintain minimum 4.5:1 color contrast ratio for text

### Code Style

- JavaScript only — no TypeScript
- Functional components + hooks only — no class components
- Destructure props at the top of every component
- Keep components under 200 lines — extract sub-components if longer
- Comment any non-obvious logic; no comments on self-explanatory code

### Visual Polish

- Use `elevation` (Android) and `shadowColor/shadowOffset/shadowOpacity/shadowRadius` (iOS) for card shadows
- Animate state changes with `Animated.timing` — no jarring instant switches
- Use `Platform.OS` to apply platform-specific styles where needed
- Buttons must have a pressed/active state (reduce opacity to 0.7)
- Cards should have subtle shadows: elevation 2-4, not heavy drop shadows

## Reference Images

- If a reference image is provided: match layout, spacing, typography, and colors exactly
- If no reference image: design from scratch with high visual craft using the guidelines below
- After building a component, compare against any provided mockup and fix mismatches

## Anti-Generic Guardrails

- **Colors:** Never use default/generic colors — always pull from `src/utils/constants.js` or define a intentional palette
- **Typography:** Never use the same font weight for headings and body — pair bold headings with regular body text
- **Shadows:** Use layered shadows (elevation + shadowColor tinted to match brand) — never flat unstyled elevation
- **Animations:** Only animate `transform` and `opacity` — never animate layout properties directly
- **Interactive states:** Every touchable element needs pressed state (opacity 0.7) and disabled state (opacity 0.4)
- **Spacing:** Use the spacing token system (multiples of 4) — no random one-off values
- **Depth:** UI surfaces should follow a layering system: background → cards → modals/overlays

## Brand Assets

- Always check `src/utils/constants.js` and `src/assets/` before designing — use existing logos, colors, and icons
- Never use placeholder values where real assets are available

## Hard Rules

- Do not add UI sections or features not explicitly requested
- Do not "improve" a provided design reference — match it exactly first
- Do not use generic placeholder styling — every component should feel intentional
- Do not skip pressed/disabled states on interactive elements
