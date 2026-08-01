# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Marg is a React Native 0.86 app. `App.tsx` renders `AppStack` (`src/navigation/AppStack.tsx`), not the bootstrapped template anymore. Real screens now live under `src/sections/preAuthentication` (`LoginScreen`) and `src/sections/postAuthentication` (`HomeScreen`), but `AppStack` currently only ever mounts `PreAuthenticationStack` — there is no auth-gating logic yet to switch to `PostAuthenticationStack`. `src/redux/` and `src/components/` are still empty scaffolding; no state-management library is in `package.json` yet, so don't assume Redux (or any store) is available — check `package.json` first.

## Commands

- `npm start` — start the Metro bundler.
- `npm run android` — build and run on Android (requires Metro running, or it will start one).
- `npm run ios` — build and run on iOS (requires `bundle exec pod install` after first clone or native dep changes; run `bundle install` once first).
- `npm run lint` — ESLint via the `@react-native` config (`.eslintrc.js`).
- `npm test` — run Jest tests (`@react-native/jest-preset`).
- `npm test -- -t "<test name>"` — run a single test by name.
- `npm test -- <path/to/file.test.tsx>` — run a single test file.

## Architecture notes

- Entry point is `index.js` → `App.tsx` → `src/navigation/AppStack.tsx`, which wraps everything in one `NavigationContainer` and a native-stack `Navigator` whose default `screenOptions` come from `src/hooks/useNavigationScreenOptions.ts` (currently just `{ headerShown: false }`). Each auth section (`PreAuthenticationStack`, `PostAuthenticationStack`) is its own nested native-stack navigator declared in `src/navigation/`, registered into `AppStack` as a single `Stack.Screen`.
- Route names are centralized in `src/utility/constants/navigationString.ts` — reference screens/stacks by these constants rather than hardcoded strings.
- User-facing copy is centralized in `src/utility/constants/appString.ts`, namespaced per screen (e.g. `appString.loginScreen.title`). Add new strings there rather than inlining text in components.
- Colors are centralized in `src/utility/constants/themeColors.ts` — use these tokens instead of hardcoded hex values in styles.
- Screens are colocated folders under `src/sections/<preAuthentication|postAuthentication>/<ScreenName>/` with `index.tsx` (component) + `styles.ts` (a `StyleSheet.create` default export). Follow this split for new screens rather than inlining styles.
- Sizing: `react-native-size-matters` (`moderateScale`, `scale`, `verticalScale`) is used throughout screen `styles.ts` files for responsive dimensions instead of raw pixel numbers — match this convention in new styles.
- Icons live in `src/assets/icons/` as React components built with `react-native-svg`. Use the capitalized RN component tags exported by `react-native-svg` (`Svg`, `Path`, `Circle`, `Rect`, `LinearGradient`, `Stop`, `Filter`, `FeDropShadow`, etc.) — lowercase HTML-style SVG tags (`<path>`, `<circle>`, `<stop>`, ...) are not registered RN view configs and crash at runtime with `Invariant Violation: View config getter callback for component '<tag>' must be a function`.
- TypeScript config extends `@react-native/typescript-config`; Babel uses `module:@react-native/babel-preset`; Metro config extends `@react-native/metro-config`'s default config via `mergeConfig`. Don't hand-roll config that these presets already provide.
- Formatting: Prettier is configured with `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'` (`.prettierrc.js`) — match this style in new code rather than default Prettier settings.
- Node >= 22.11.0 is required (`package.json` engines).
- iOS native project lives in `ios/Marg` (Swift `AppDelegate`); Android native project is standard RN Gradle layout under `android/app`.
