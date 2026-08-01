import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationString } from '../utility/constants/navigationString';

import LoginScreen from '../sections/preAuthentication/LoginScreen';



export default function PreAuthenticationStack() {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={navigationString.loginScreen}
                component={LoginScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
