import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    PermissionsAndroid,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Hero from '../../../components/Hero';
import Skeleton from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import type { PhotoFile } from '../../../hooks/useIssue';
import { useUploadWorkerPhotoMutation, useWorkerPhotoQuery } from '../../../hooks/useProfile';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import styles from './styles';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const photoQuery = useWorkerPhotoQuery(user?.id);
    const uploadPhotoMutation = useUploadWorkerPhotoMutation();
    const photoUri = photoQuery.data ?? null;

    const requestCameraPermission = async () => {
        if (Platform.OS !== 'android') {
            return true;
        }
        const alreadyGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (alreadyGranted) {
            return true;
        }
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: appString.profileScreen.cameraPermissionTitle,
            message: appString.profileScreen.cameraPermissionMessage,
            buttonPositive: appString.profileScreen.cameraPermissionAllow,
            buttonNegative: appString.profileScreen.cancelButton,
        });
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
                appString.profileScreen.cameraPermissionTitle,
                appString.profileScreen.cameraPermissionBlockedMessage,
                [
                    { text: appString.profileScreen.cancelButton, style: 'cancel' },
                    { text: appString.profileScreen.openSettingsLabel, onPress: () => Linking.openSettings() },
                ],
            );
            return false;
        }
        return result === PermissionsAndroid.RESULTS.GRANTED;
    };

    const uploadPhoto = async (photo: PhotoFile) => {
        try {
            await uploadPhotoMutation.mutateAsync(photo);
        } catch (err) {
            Alert.alert(
                appString.profileScreen.photoUploadFailedTitle,
                err instanceof Error ? err.message : 'Failed to upload photo.',
            );
        }
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            return;
        }
        const result = await launchCamera({ mediaType: 'photo', saveToPhotos: false, quality: 0.7 });
        if (result.didCancel || result.errorCode) {
            if (result.errorCode) {
                Alert.alert('Camera error', result.errorMessage ?? 'Could not open the camera.');
            }
            return;
        }
        const asset = result.assets?.[0];
        if (asset?.uri) {
            const mimeType = asset.type ?? 'image/jpeg';
            uploadPhoto({
                uri: asset.uri,
                type: mimeType,
                name: asset.fileName ?? `profile-photo.${mimeType.split('/')[1] ?? 'jpg'}`,
            });
        }
    };

    const handleChooseFromGallery = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
        if (result.didCancel || result.errorCode) {
            if (result.errorCode) {
                Alert.alert('Gallery error', result.errorMessage ?? 'Could not open the gallery.');
            }
            return;
        }
        const asset = result.assets?.[0];
        if (asset?.uri) {
            const mimeType = asset.type ?? 'image/jpeg';
            uploadPhoto({
                uri: asset.uri,
                type: mimeType,
                name: asset.fileName ?? `profile-photo.${mimeType.split('/')[1] ?? 'jpg'}`,
            });
        }
    };

    const handleChangePhoto = () => {
        Alert.alert(appString.profileScreen.changePhotoTitle, undefined, [
            { text: appString.profileScreen.takePhotoOption, onPress: handleTakePhoto },
            { text: appString.profileScreen.chooseFromGalleryOption, onPress: handleChooseFromGallery },
            { text: appString.profileScreen.cancelButton, style: 'cancel' },
        ]);
    };

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
            <Hero>
                <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                    <Icon name="bell" size={18} color={themeColors.navy} />
                </TouchableOpacity>
            </Hero>

            <View style={styles.content}>
                <View style={styles.profileCard}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        activeOpacity={0.8}
                        onPress={handleChangePhoto}>
                        <View style={styles.avatarCircle}>
                            {photoQuery.isLoading ? (
                                <Skeleton width="100%" height="100%" borderRadius={0} />
                            ) : photoUri ? (
                                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                            ) : (
                                <Icon name="user" size={28} color={themeColors.primary} />
                            )}
                        </View>
                        {uploadPhotoMutation.isPending ? (
                            <View style={styles.avatarLoadingOverlay}>
                                <ActivityIndicator color={themeColors.white} size="small" />
                            </View>
                        ) : (
                            <View style={styles.cameraBadge}>
                                <Icon name="camera" size={11} color={themeColors.white} />
                            </View>
                        )}
                    </TouchableOpacity>
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
        </View>
    );
}
