import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import TasksScreen from '../sections/postAuthentication/TasksScreen';
import ProfileScreen from '../sections/postAuthentication/ProfileScreen';
import { appString } from '../utility/constants/appString';
import { navigationString } from '../utility/constants/navigationString';
import { themeColors } from '../utility/constants/themeColors';

const Tab = createBottomTabNavigator();

export default function PostAuthenticationTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: themeColors.primary,
                tabBarInactiveTintColor: themeColors.subtitle,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}>
            <Tab.Screen
                name={navigationString.tasksScreen}
                component={TasksScreen}
                options={{
                    tabBarLabel: appString.tasksScreen.tabLabel,
                    tabBarIcon: ({ color, size }) => <Icon name="list" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name={navigationString.profileScreen}
                component={ProfileScreen}
                options={{
                    tabBarLabel: appString.profileScreen.tabLabel,
                    tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
