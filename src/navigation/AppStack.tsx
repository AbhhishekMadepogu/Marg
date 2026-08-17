import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useNavigationScreenOptions } from '../hooks/useNavigationScreenOptions';
import { navigationString } from '../utility/constants/navigationString';
import { themeColors } from '../utility/constants/themeColors';
import PreAuthenticationStack from './PreAuthenticationStack';
import PostAuthenticationTabs from './PostAuthenticationTabs';

export default function AppStack() {
    const screenDefaultOptions = useNavigationScreenOptions();
    const { isBootstrapping, isAuthenticated } = useAuth();
    const Stack = createNativeStackNavigator();

    if (isBootstrapping) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: themeColors.white }}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={screenDefaultOptions}>
                {isAuthenticated ? (
                    <Stack.Screen
                        name={navigationString.PostAuthenticationStack}
                        component={PostAuthenticationTabs}
                    />
                ) : (
                    <Stack.Screen
                        name={navigationString.PreAuthenticationStack}
                        component={PreAuthenticationStack}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
