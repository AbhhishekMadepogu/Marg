import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30 * 1000,
        },
    },
});

// React Native has no window focus events; treat the app returning to the
// foreground as "focus" so stale queries (e.g. the current user) revalidate.
AppState.addEventListener('change', (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
});
