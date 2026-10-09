import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    PermissionsAndroid,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Feather';
import type { PhotoFile } from '../../../hooks/useIssue';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import modalStyles from './modalStyles';

const MAX_COMMENT_LENGTH = 200;

type CompleteTaskModalProps = {
    visible: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (photo: PhotoFile, comment: string) => void;
};

export default function CompleteTaskModal({
    visible,
    isSubmitting,
    onClose,
    onConfirm,
}: CompleteTaskModalProps) {
    const [photo, setPhoto] = useState<PhotoFile | null>(null);
    const [comment, setComment] = useState('');

    // Covers every dismissal path, not just Cancel/X - including a
    // successful submit, which the parent closes by flipping `visible`
    // without going through handleClose.
    useEffect(() => {
        if (!visible) {
            setPhoto(null);
            setComment('');
        }
    }, [visible]);

    const handleClose = () => {
        setPhoto(null);
        setComment('');
        onClose();
    };

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
            title: appString.tasksScreen.cameraPermissionTitle,
            message: appString.tasksScreen.cameraPermissionMessage,
            buttonPositive: appString.tasksScreen.cameraPermissionAllow,
            buttonNegative: appString.tasksScreen.cancelButton,
        });
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
                appString.tasksScreen.cameraPermissionTitle,
                appString.tasksScreen.cameraPermissionBlockedMessage,
                [
                    { text: appString.tasksScreen.cancelButton, style: 'cancel' },
                    { text: appString.tasksScreen.openSettingsLabel, onPress: () => Linking.openSettings() },
                ],
            );
            return false;
        }
        return result === PermissionsAndroid.RESULTS.GRANTED;
    };

    const handleCapture = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            return;
        }
        const result = await launchCamera({
            mediaType: 'photo',
            saveToPhotos: false,
            quality: 0.7,
        });
        if (result.didCancel || result.errorCode) {
            if (result.errorCode) {
                Alert.alert('Camera error', result.errorMessage ?? 'Could not open the camera.');
            }
            return;
        }
        const asset = result.assets?.[0];
        if (asset?.uri) {
            const mimeType = asset.type ?? 'image/jpeg';
            setPhoto({
                uri: asset.uri,
                type: mimeType,
                name: asset.fileName ?? `completed-work.${mimeType.split('/')[1] ?? 'jpg'}`,
            });
        }
    };

    const handleConfirm = () => {
        if (!photo) {
            return;
        }
        onConfirm(photo, comment.trim());
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={modalStyles.overlay}>
                <View style={modalStyles.card}>
                    <TouchableOpacity
                        style={modalStyles.closeButton}
                        activeOpacity={0.7}
                        onPress={handleClose}>
                        <Icon name="x" size={20} color={themeColors.subtitle} />
                    </TouchableOpacity>

                    <Text style={modalStyles.title}>{appString.tasksScreen.completeModalTitle}</Text>
                    <Text style={modalStyles.subtitle}>
                        {appString.tasksScreen.completeModalSubtitle}
                    </Text>

                    <Text style={modalStyles.label}>
                        {appString.tasksScreen.completedImageLabel}
                        <Text style={modalStyles.requiredAsterisk}> *</Text>
                    </Text>

                    <TouchableOpacity
                        style={modalStyles.photoBox}
                        activeOpacity={0.8}
                        onPress={handleCapture}>
                        {photo ? (
                            <>
                                <Image source={{ uri: photo.uri }} style={modalStyles.photoPreview} resizeMode="cover" />
                                <View style={modalStyles.retakeBadge}>
                                    <Icon name="camera" size={12} color={themeColors.white} />
                                    <Text style={modalStyles.retakeBadgeText}>
                                        {appString.tasksScreen.retakePhotoLabel}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={modalStyles.photoIconCircle}>
                                    <FA5Icon name="camera" size={18} color={themeColors.primary} solid />
                                </View>
                                <Text style={modalStyles.photoBoxTitle}>
                                    {appString.tasksScreen.takePhotoLabel}
                                </Text>
                                <Text style={modalStyles.photoBoxSubtitle}>
                                    {appString.tasksScreen.photoHint}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={modalStyles.label}>{appString.tasksScreen.commentLabel}</Text>
                    <TextInput
                        style={modalStyles.textArea}
                        placeholder={appString.tasksScreen.commentPlaceholder}
                        placeholderTextColor={themeColors.placeholder}
                        multiline
                        maxLength={MAX_COMMENT_LENGTH}
                        value={comment}
                        onChangeText={setComment}
                    />
                    <Text style={modalStyles.charCount}>
                        {comment.length}/{MAX_COMMENT_LENGTH}
                    </Text>

                    <View style={modalStyles.buttonsRow}>
                        <TouchableOpacity
                            style={modalStyles.cancelButton}
                            activeOpacity={0.8}
                            onPress={handleClose}>
                            <Text style={modalStyles.cancelButtonText}>
                                {appString.tasksScreen.cancelButton}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                modalStyles.confirmButton,
                                { backgroundColor: themeColors.primary },
                                (!photo || isSubmitting) && modalStyles.confirmButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            disabled={!photo || isSubmitting}
                            onPress={handleConfirm}>
                            <Text style={modalStyles.confirmButtonText}>
                                {isSubmitting
                                    ? appString.tasksScreen.completingButton
                                    : appString.tasksScreen.completeConfirmButton}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
