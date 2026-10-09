import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import modalStyles from './modalStyles';

const MAX_REASON_LENGTH = 500;

type RejectTaskModalProps = {
    visible: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
};

export default function RejectTaskModal({
    visible,
    isSubmitting,
    onClose,
    onConfirm,
}: RejectTaskModalProps) {
    const [reason, setReason] = useState('');

    // Covers every dismissal path, not just Cancel/X - including a
    // successful submit, which the parent closes by flipping `visible`
    // without going through handleClose.
    useEffect(() => {
        if (!visible) {
            setReason('');
        }
    }, [visible]);

    const handleClose = () => {
        setReason('');
        onClose();
    };

    const handleConfirm = () => {
        const trimmed = reason.trim();
        if (!trimmed) {
            return;
        }
        onConfirm(trimmed);
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

                    <View style={[modalStyles.iconCircle, { backgroundColor: themeColors.dangerBg }]}>
                        <MCIcon name="close-circle" size={26} color={themeColors.danger} />
                    </View>

                    <Text style={modalStyles.title}>{appString.tasksScreen.rejectModalTitle}</Text>
                    <Text style={modalStyles.subtitle}>
                        {appString.tasksScreen.rejectModalSubtitle}
                    </Text>

                    <Text style={modalStyles.label}>
                        {appString.tasksScreen.reasonLabel}
                        <Text style={modalStyles.requiredAsterisk}> *</Text>
                    </Text>

                    <TextInput
                        style={modalStyles.textArea}
                        placeholder={appString.tasksScreen.reasonPlaceholder}
                        placeholderTextColor={themeColors.placeholder}
                        multiline
                        maxLength={MAX_REASON_LENGTH}
                        value={reason}
                        onChangeText={setReason}
                    />
                    <Text style={modalStyles.charCount}>
                        {reason.length}/{MAX_REASON_LENGTH}
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
                                { backgroundColor: themeColors.danger },
                                (!reason.trim() || isSubmitting) && modalStyles.confirmButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            disabled={!reason.trim() || isSubmitting}
                            onPress={handleConfirm}>
                            <Text style={modalStyles.confirmButtonText}>
                                {isSubmitting
                                    ? appString.tasksScreen.rejectingButton
                                    : appString.tasksScreen.rejectConfirmButton}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
