import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { API_BASE_URL } from '../utility/constants/apiConfig';

export type MobileCurrentUser = {
    id: string;
    phone: string;
    role: string;
    fullName: string | null;
    orgName: string | null;
    state: string | null;
    districts: string[];
    talukas: string[];
};

type LoginResult = {
    message: string;
    accessToken: string;
    refreshToken: string;
};

type AuthContextValue = {
    isBootstrapping: boolean;
    isRequestingOtp: boolean;
    isLoggingIn: boolean;
    isFetchingUser: boolean;
    isRefreshingSession: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: MobileCurrentUser | null;
    isAuthenticated: boolean;
    requestOtp: (phone: string) => Promise<string>;
    login: (phone: string, otp: string) => Promise<LoginResult>;
    getMe: (token?: string) => Promise<MobileCurrentUser>;
    refreshSession: () => Promise<string>;
    logout: () => Promise<void>;
    authorizedFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const ACCESS_TOKEN_KEY = 'marg_access_token';
const REFRESH_TOKEN_KEY = 'marg_refresh_token';

const AuthContext = createContext<AuthContextValue | null>(null);

const extractErrorMessage = async (response: Response, fallback: string) => {
    try {
        const body = await response.json();
        if (typeof body?.detail === 'string') {
            return body.detail;
        }
        if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
            return body.detail[0].msg;
        }
    } catch {
        // Response had no JSON body.
    }
    return fallback;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isFetchingUser, setIsFetchingUser] = useState(false);
    const [isRefreshingSession, setIsRefreshingSession] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<MobileCurrentUser | null>(null);
    const loggedOutRef = useRef(false);

    const requestOtp = useCallback(async (phone: string) => {
        setIsRequestingOtp(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/mobile/otp-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, login_type: "WORKER" }),
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to send OTP.'));
            }
            const data: { message: string } = await response.json();
            return data.message;
        } finally {
            setIsRequestingOtp(false);
        }
    }, []);

    const logout = useCallback(async () => {
        loggedOutRef.current = true;
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        try {
            await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        } catch {
            // In-memory session is already cleared; storage will be retried on next write.
        }
    }, []);

    const refreshSession = useCallback(async (): Promise<string> => {
        if (!refreshToken || loggedOutRef.current) {
            throw new Error('Not authenticated.');
        }
        setIsRefreshingSession(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    await logout();
                }
                throw new Error(await extractErrorMessage(response, 'Failed to refresh session.'));
            }
            const data: { message: string; access_token: string; refresh_token: string; token_type: string } =
                await response.json();
            if (loggedOutRef.current) {
                throw new Error('Session already ended.');
            }
            await AsyncStorage.setMany({
                [ACCESS_TOKEN_KEY]: data.access_token,
                [REFRESH_TOKEN_KEY]: data.refresh_token,
            });
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            return data.access_token;
        } finally {
            setIsRefreshingSession(false);
        }
    }, [refreshToken, logout]);

    const authorizedFetch = useCallback(
        async (path: string, init: RequestInit = {}): Promise<Response> => {
            if (!accessToken) {
                throw new Error('Not authenticated.');
            }
            const response = await fetch(`${API_BASE_URL}${path}`, {
                ...init,
                headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
            });
            if (response.status === 401) {
                await logout();
                throw new Error('Session expired. Please log in again.');
            }
            return response;
        },
        [accessToken, logout],
    );

    const getMe = useCallback(async (token?: string): Promise<MobileCurrentUser> => {
        setIsFetchingUser(true);
        try {
            const response = token
                ? await fetch(`${API_BASE_URL}/auth/mobile/me`, {
                      headers: { Authorization: `Bearer ${token}` },
                  })
                : await authorizedFetch('/auth/mobile/me');
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to load your profile.'));
            }
            const data: {
                id: string;
                phone: string;
                role: string;
                full_name: string | null;
                org_name: string | null;
                state: { id: string; name: string } | null;
                districts: { id: string; name: string }[];
                talukas: { id: string; name: string }[];
            } = await response.json();
            const currentUser: MobileCurrentUser = {
                id: data.id,
                phone: data.phone,
                role: data.role,
                fullName: data.full_name,
                orgName: data.org_name ?? null,
                state: data.state?.name ?? null,
                districts: (data.districts ?? []).map(district => district.name),
                talukas: (data.talukas ?? []).map(taluka => taluka.name),
            };
            setUser(currentUser);
            return currentUser;
        } finally {
            setIsFetchingUser(false);
        }
    }, [authorizedFetch]);

    const login = useCallback(async (phone: string, otp: string): Promise<LoginResult> => {
        setIsLoggingIn(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/mobile/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, login_type: "WORKER" }),
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Invalid or expired OTP.'));
            }
            const data: { message: string; access_token: string; refresh_token: string } =
                await response.json();
            loggedOutRef.current = false;
            await AsyncStorage.setMany({
                [ACCESS_TOKEN_KEY]: data.access_token,
                [REFRESH_TOKEN_KEY]: data.refresh_token,
            });
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            await getMe(data.access_token);
            return {
                message: data.message,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
            };
        } finally {
            setIsLoggingIn(false);
        }
    }, [getMe]);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
            const storedAccessToken = stored[ACCESS_TOKEN_KEY];
            const storedRefreshToken = stored[REFRESH_TOKEN_KEY];

            if (!storedAccessToken) {
                setIsBootstrapping(false);
                return;
            }

            try {
                await getMe(storedAccessToken);
                loggedOutRef.current = false;
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
            } catch {
                await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
            } finally {
                setIsBootstrapping(false);
            }
        })();
        // Only run once on mount to restore a persisted session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState !== 'active' || isBootstrapping || !accessToken) {
                return;
            }
            // Revalidates the session on foreground; if the refresh token has also
            // expired, authorizedFetch's 401 handling logs the user out automatically.
            getMe().catch(() => {});
        });
        return () => subscription.remove();
    }, [accessToken, isBootstrapping, getMe]);

    const value = useMemo<AuthContextValue>(
        () => ({
            isBootstrapping,
            isRequestingOtp,
            isLoggingIn,
            isFetchingUser,
            isRefreshingSession,
            accessToken,
            refreshToken,
            user,
            isAuthenticated: Boolean(accessToken && user),
            requestOtp,
            login,
            getMe,
            refreshSession,
            logout,
            authorizedFetch,
        }),
        [
            isBootstrapping,
            isRequestingOtp,
            isLoggingIn,
            isFetchingUser,
            isRefreshingSession,
            accessToken,
            refreshToken,
            user,
            requestOtp,
            login,
            getMe,
            refreshSession,
            logout,
            authorizedFetch,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
