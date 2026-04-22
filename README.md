# 🚴 WyxanTaskApp — Cyclist Route Tracker

A complete React Native application designed specifically to fulfill the **Cyclist Tracking - Technical Test** requirements. It robustly tracks a cyclist's location and strictly enforces a sequential progression through a series of defined geofenced checkpoints. Built with TypeScript, Zustand, and react-native-maps.

### ✨ Key Features Implemented (Meeting Requirements)
- **Strict Sequential Routing**: Generates and enforces a continuous path (`SP → CP1 → CP2 → CP1 → ... → EP`).
- **Consecutive Hits Rule**: Prevents hitting the same checkpoint twice in a row by sorting the cycle sequence correctly.
- **Start/End Geofence Verification**: The run cannot start unless the user is physically inside the "Start Point" polygon.
- **Auto-Complete Checkpoints**: Automatically registers CP hits via the dynamic turf.js geofencing engine without manual intervention.
- **Dynamic UX/UI Pathing**: Live green pathing on the map, numbered markers, and a horizontal "Sequence Progress" bar let the user instantly understand their multi-hit circular route.
- **DevTeleporter**: Specifically built to demonstrate edge cases (out of bounds, out of order, and simulate traversal).

---

## 🔗 Links

- **APK Download**: [Download Final APK](https://drive.google.com/file/d/1pSy8bLxkQ3nN_ERfkd5Evq-rn4Dr6KbI/view?usp=sharing)
- **Demo Video**: [Watch App Demo](https://drive.google.com/file/d/1AE0JM515uK6JCzw86adnoFv4YaLz2KVO/view?usp=sharing)
- **GitHub Repository**: [saqibnaeem-appdev/WyxanTaskApp](https://github.com/saqibnaeem-appdev/WyxanTaskApp.git)

---

## 📋 Table of Contents

- [Setup Instructions](#setup-instructions)
- [Architecture & Approach](#architecture--approach)
- [Edge Cases & Limitations](#edge-cases--limitations)
- [Retrospective / Future Improvements](#retrospective--future-improvements)

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** >= 22.11.0
- **React Native CLI** environment set up ([Guide](https://reactnative.dev/docs/set-up-your-environment))
- **Xcode** (for iOS) / **Android Studio** (for Android)
- **CocoaPods** (for iOS dependencies)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/saqibnaeem-appdev/WyxanTaskApp.git
cd WyxanTaskApp

# 2. Install dependencies
npm install

# 3. iOS only — install CocoaPods
cd ios && bundle exec pod install && cd ..
```



### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Running Tests

```bash
npx jest --coverage
```

---

## 🏗️ Architecture & Approach

### Project Structure

```
src/
├── assets/          # Fonts, images, static resources
├── components/
│   ├── map/         # RouteMap — MapView with polygons, polylines, markers
│   └── ui/          # Reusable UI primitives (AppText, AppButton, AppCard, etc.)
├── hooks/           # useLocationTracker — GPS stream + geofencing engine
├── mocks/           # Route data (mirrors the example JSON)
├── screens/         # HomeScreen, TrackingScreen, SplashScreen
├── store/           # Zustand state management (useRunStore)
├── theme/           # Design tokens (colors, fonts, responsive scaling)
└── utils/           # Polygon intersection logic (Turf.js), permissions
```

### State Management — Zustand

I chose **Zustand** for its minimal boilerplate and direct store access (important for unit testing). The store manages:

- `runState`: `'IDLE' | 'ACTIVE' | 'COMPLETED'` — the run lifecycle
- `sequence`: A pre-computed linear array of `SequenceNode[]` representing the full route order
- `activeSequenceIndex`: Pointer to the currently active target in the sequence
- `currentLocation`:  Latest GPS coordinate
- `isSimulationMode`: Toggles between real GPS and DevTeleporter mock positioning

### Sequence Generation Algorithm

The core challenge is handling circular routes with multiple hits. My approach:

1. **Pre-compute the full linear sequence** at store initialization via `generateSequence()`
2. Sort CPs by their `order` property
3. Iterate `maxHits` cycles, adding each CP that still needs visits
4. This naturally produces: `SP → CP1 → CP2 → CP1 → CP2 → EP`
5. The non-consecutive hit rule is inherently satisfied because we cycle through ALL CPs before repeating any

### Geofencing — Turf.js

Rather than relying on native geofencing APIs (which are inconsistent across platforms), I use:

- **`@turf/boolean-point-in-polygon`** for point-in-polygon checks
- **`@turf/helpers`** for GeoJSON coordinate construction

This gives deterministic, cross-platform polygon intersection logic and is easily unit-testable.

### Location Tracking

- **`react-native-geolocation-service`** provides the GPS stream via `watchPosition()`
- High accuracy mode with 1-meter distance filter and 1-second interval
- The `useGeofencingEngine` hook runs on every location update:
  - If the user enters the active CP's polygon → auto-complete + vibration feedback
  - SP and EP require manual button confirmation (per requirements)

### Map Visualization

- **Polygons**: Green fill for active target, gray for future, translucent for completed
- **Numbered Sequence Markers**: Each node has a number and pulsing ring when active
- **Polyline (background)**: Dashed line showing the full route path via polygon centroids
- **Polyline (completed)**: Solid green line tracking the user's path through completed checkpoints
- **Polyline (leading)**: Solid green line connecting the user's current position to the active target
- **Sequence Progress Bar**: A horizontal scrollable widget tracking progression (`SP → CP1 → ... → EP`)
- **Custom marker**: Cyclist emoji marker with a glowing border

### DevTeleporter (Testing Tool)

A developer tool accessible via the bug icon on the tracking screen. It allows:
- Toggling between real GPS and simulated positions
- Teleporting to any checkpoint's centroid (showing visual completion checkmarks)
- Jumping to an "outside bounds" location for testing error flows

---

## ⚠️ Edge Cases & Limitations

### Known Edge Cases

| Edge Case | Current Behavior | Risk Level |
|-----------|-----------------|------------|
| **GPS noise / jitter** | If user's position rapidly oscillates across a polygon boundary, multiple hits could register for the same checkpoint in quick succession | Medium |
| **Rapid polygon traversal** | Very fast movement through a small polygon might miss location updates entirely (between 1-second intervals) | Medium |
| **Polygon boundary precision** | Turf.js treats boundary points as outside the polygon (standard GeoJSON behavior) — user must be strictly *inside* | Low |
| **Background location** | App only tracks location while in foreground (`whenInUse` permission). Backgrounded app stops tracking. | Low (acceptable for task scope) |
| **Network disconnection** | Map tiles may not load without internet. GPS tracking continues to work offline. | Low |
| **Multiple overlapping polygons** | If SP and EP share the same polygon (as in the test data), the geofencing engine only checks the active target — no conflict | None |

### Platform Differences

- **iOS**: Uses Apple Maps (built-in, no API key)
- **Android**: Uses Google Maps (requires API key in AndroidManifest.xml)
- Map appearances differ between platforms but functionality is identical.

---

## 🔮 Retrospective / Future Improvements

If I had an extra week, here's what I would implement:

### Performance & Reliability
- **Debounced geofencing**: Add a minimum dwell time (e.g., 2 seconds inside a polygon) before registering a hit, to prevent GPS jitter false positives
- **Background location tracking**: Upgrade to `ACCESS_BACKGROUND_LOCATION` (Android) and `always` authorization (iOS) so the run persists when the app is backgrounded
- **Persistent run state**: Use Zustand's `persist` middleware with AsyncStorage to survive app kills mid-run
- **Optimistic location buffering**: Queue location updates and process them in batches to prevent re-renders on every GPS tick

### UX Enhancements
- **Animated route progression**: Smooth polyline animation as checkpoints are completed (Lottie or Reanimated)
- **Distance & ETA display**: Show meters remaining to the next checkpoint using Haversine formula
- **Route overview camera**: Auto-fit the map camera to show the full route or zoom to the active segment
- **Completion statistics**: Time elapsed, distance covered, average speed after run completion
- **Dark/Light map themes**: Sync the map style with system appearance

### Architecture
- **API-driven routes**: Fetch route configurations from a backend instead of hardcoded mock data
- **Offline-first**: Cache route data and map tiles for areas with poor connectivity
- **Modular geofencing service**: Extract the geofencing engine into a standalone service class (decoupled from React hooks) for better testability
- **E2E testing**: Add Detox tests to automate the full run flow on real devices
- **CI/CD pipeline**: GitHub Actions for lint, test, and APK build on every push

### Production Readiness
- **Error boundaries**: Wrap screens in React error boundaries with crash reporting (Sentry/Crashlytics)
- **Analytics**: Track run completions, abandonment rates, and common failure points
- **Accessibility**: Screen reader support, dynamic text sizing, high contrast colors
- **Localization**: i18n support for multiple languages

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native 0.85.1 | Cross-platform mobile framework |
| TypeScript | Type safety |
| Zustand | Lightweight state management |
| react-native-maps | MapView, Polygons, Polylines, Markers |
| react-native-maps-directions | Road-snapped path generation and directions |
| react-native-geolocation-service | GPS location streaming |
| @turf/boolean-point-in-polygon | Geofencing — point-in-polygon checks |
| @turf/helpers | GeoJSON helpers |
| react-native-vector-icons | Icon library (Ionicons) |
| toastify-react-native | Toast notifications |
| react-native-safe-area-context | Safe area insets |
| react-navigation | Screen navigation |

---

## 📄 License

This project was created as a technical assessment submission.
