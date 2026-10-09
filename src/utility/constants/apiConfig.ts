import Config from 'react-native-config';

// Sourced from the .env file matching the running build variant (.env.dev /
// .env.qa / .env.prod — see the android:dev/qa/prod scripts in package.json).
// The fallback only applies to a Metro-only JS reload without a native
// rebuild, where the native module hasn't re-read the .env file yet.
export const API_BASE_URL = Config.API_BASE_URL ?? 'http://10.2.133.47:8088/api/v1';
