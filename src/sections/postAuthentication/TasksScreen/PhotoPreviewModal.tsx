import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../../hooks/useAuth';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import modalStyles from './modalStyles';

type PhotoPreviewModalProps = {
    visible: boolean;
    photoUri: string | null;
    taskTitle: string;
    completedAt: string | null;
    onClose: () => void;
};

export default function PhotoPreviewModal({
    visible,
    photoUri,
    taskTitle,
    completedAt,
    onClose,
}: PhotoPreviewModalProps) {
    const { accessToken } = useAuth();
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setHasError(false);
        setIsLoading(true);
    }, [photoUri]);

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.card}>
                    <View style={modalStyles.previewHeaderRow}>
                        <Text style={modalStyles.previewTitle}>
                            {appString.tasksScreen.photoPreviewTitle}
                        </Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
                            <Icon name="x" size={20} color={themeColors.subtitle} />
                        </TouchableOpacity>
                    </View>

                    {photoUri && accessToken && !hasError ? (
                        <View>
                            <Image
                                source={{ uri: photoUri, headers: { Authorization: `Bearer ${accessToken}` } }}
                                style={modalStyles.previewImage}
                                resizeMode="cover"
                                onLoadEnd={() => setIsLoading(false)}
                                onError={() => setHasError(true)}
                            />
                            {isLoading ? (
                                <ActivityIndicator
                                    style={modalStyles.previewImageLoader}
                                    color={themeColors.primary}
                                />
                            ) : null}
                        </View>
                    ) : (
                        <View style={[modalStyles.previewImage, modalStyles.previewImageFallback]}>
                            <Icon name="image" size={22} color={themeColors.subtitle} />
                            <Text style={modalStyles.previewImageFallbackText}>
                                {appString.tasksScreen.photoUnavailable}
                            </Text>
                        </View>
                    )}

                    <Text style={modalStyles.previewCardTitle}>{taskTitle}</Text>
                    {completedAt ? (
                        <View style={modalStyles.previewMetaRow}>
                            <Icon name="calendar" size={12} color={themeColors.subtitle} />
                            <Text style={modalStyles.previewMetaText}>
                                {appString.tasksScreen.completedOnPrefix}
                                {completedAt}
                            </Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={modalStyles.closeFullButton}
                        activeOpacity={0.8}
                        onPress={onClose}>
                        <Text style={modalStyles.closeFullButtonText}>
                            {appString.tasksScreen.closeButton}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
