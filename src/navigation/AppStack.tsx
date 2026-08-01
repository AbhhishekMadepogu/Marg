import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigationScreenOptions } from '../hooks/useNavigationScreenOptions';
import { navigationString } from '../utility/constants/navigationString';
import PreAuthenticationStack from './PreAuthenticationStack';
import PostAuthenticationTabs from './PostAuthenticationTabs';





export default function AppStack() {
    const screenDefaultOptions = useNavigationScreenOptions();
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={screenDefaultOptions} initialRouteName={navigationString.PostAuthenticationStack}>
                <Stack.Screen
                    name={navigationString.PreAuthenticationStack}
                    component={PreAuthenticationStack}
                />
                {/* <Stack.Screen
                    name={navigationString.PostAuthenticationStack}
                    component={PostAuthenticationTabs}
                /> */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
