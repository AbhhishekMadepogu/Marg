import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Feather';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import modalStyles from './modalStyles';

type AcceptTaskModalProps = {
    visible: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (etaDate: Date) => void;
};

const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AcceptTaskModal({
    visible,
    isSubmitting,
    onClose,
    onConfirm,
}: AcceptTaskModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const handleClose = () => {
        setSelectedDate(null);
        setShowPicker(false);
        onClose();
    };

    const handleChangeDate = (_event: unknown, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleConfirm = () => {
        if (!selectedDate) {
            return;
        }
        onConfirm(selectedDate);
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

                    <View style={[modalStyles.iconCircle, { backgroundColor: themeColors.infoBg }]}>
                        <FA5Icon name="calendar-alt" size={20} color={themeColors.primary} solid />
                    </View>

                    <Text style={modalStyles.title}>{appString.tasksScreen.acceptModalTitle}</Text>
                    <Text style={modalStyles.subtitle}>
                        {appString.tasksScreen.acceptModalSubtitle}
                    </Text>

                    <Text style={modalStyles.label}>
                        {appString.tasksScreen.etaDateLabel}
                        <Text style={modalStyles.requiredAsterisk}> *</Text>
                    </Text>

                    <TouchableOpacity
                        style={modalStyles.dateInputRow}
                        activeOpacity={0.7}
                        onPress={() => setShowPicker(true)}>
                        <Text
                            style={
                                selectedDate
                                    ? modalStyles.dateInputText
                                    : modalStyles.dateInputPlaceholder
                            }>
                            {selectedDate ? formatDate(selectedDate) : appString.tasksScreen.etaDatePlaceholder}
                        </Text>
                        <FA5Icon name="calendar" size={14} color={themeColors.subtitle} />
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={selectedDate ?? new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            minimumDate={new Date()}
                            onChange={handleChangeDate}
                        />
                    )}

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
                                (!selectedDate || isSubmitting) && modalStyles.confirmButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            disabled={!selectedDate || isSubmitting}
                            onPress={handleConfirm}>
                            <Text style={modalStyles.confirmButtonText}>
                                {isSubmitting
                                    ? appString.tasksScreen.acceptingButton
                                    : appString.tasksScreen.acceptButton}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
