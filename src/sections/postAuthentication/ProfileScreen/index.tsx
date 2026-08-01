import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appString } from '../../../utility/constants/appString';
import styles from './styles';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>{appString.profileScreen.title}</Text>
        </SafeAreaView>
    );
}
