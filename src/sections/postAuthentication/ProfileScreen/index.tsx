import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Hero from '../../../components/Hero';
import { useAuth } from '../../../hooks/useAuth';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import styles from './styles';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            appString.profileScreen.logoutConfirmTitle,
            appString.profileScreen.logoutConfirmMessage,
            [
                { text: appString.profileScreen.logoutCancel, style: 'cancel' },
                {
                    text: appString.profileScreen.logoutButton,
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ],
        );
    };

    const districtValue = user?.districts.length
        ? user.districts.join(', ')
        : appString.profileScreen.emptyValue;
    const areaValue = user?.talukas.length
        ? user.talukas.join(', ')
        : appString.profileScreen.emptyValue;

    const details: { icon: string; label: string; value: string }[] = [
        {
            icon: 'office-building',
            label: appString.profileScreen.authorityLabel,
            value: user?.orgName ?? appString.profileScreen.emptyValue,
        },
        {
            icon: 'map',
            label: appString.profileScreen.stateLabel,
            value: user?.state ?? appString.profileScreen.emptyValue,
        },
        {
            icon: 'city-variant-outline',
            label: appString.profileScreen.districtLabel,
            value: districtValue,
        },
        {
            icon: 'map-marker-outline',
            label: appString.profileScreen.areaLabel,
            value: areaValue,
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <Hero >
                    <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                        <Icon name="bell" size={18} color={themeColors.navy} />
                    </TouchableOpacity>
                </Hero>

                <View style={styles.content}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarCircle}>
                            <Icon name="user" size={28} color={themeColors.primary} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>
                                {user?.fullName ?? appString.profileScreen.emptyValue}
                            </Text>
                            <View style={styles.contactRow}>
                                <Icon
                                    name="phone"
                                    size={12}
                                    color={themeColors.subtitle}
                                    style={styles.contactIcon}
                                />
                                <Text style={styles.contactText}>
                                    {user
                                        ? `${appString.profileScreen.countryCode} ${user.phone}`
                                        : appString.profileScreen.emptyValue}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>
                        {appString.profileScreen.detailsSectionTitle}
                    </Text>
                    <View style={styles.detailsCard}>
                        {details.map((detail, index) => (
                            <View
                                key={detail.label}
                                style={[
                                    styles.detailRow,
                                    index === details.length - 1 && styles.detailRowLast,
                                ]}>
                                <View style={styles.detailIconCircle}>
                                    <MCIcon name={detail.icon} size={16} color={themeColors.primary} />
                                </View>
                                <Text style={styles.detailLabel}>{detail.label}</Text>
                                <Text style={styles.detailValue}>{detail.value}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        activeOpacity={0.8}
                        onPress={handleLogout}>
                        <View style={styles.logoutLeft}>
                            <Icon name="log-out" size={16} color={themeColors.danger} />
                            <Text style={styles.logoutButtonText}>
                                {appString.profileScreen.logoutButton}
                            </Text>
                        </View>
                        <Icon name="chevron-right" size={16} color={themeColors.danger} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
