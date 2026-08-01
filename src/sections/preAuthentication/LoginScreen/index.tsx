import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LockIcon from '../../../assets/icons/lock';
import margLogo from '../../../assets/icons/margLogo';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import styles, { ICON_SIZE } from './styles';
import { moderateScale } from 'react-native-size-matters';

const backgroundImage = require('../../../assets/images/mobile-background.png');
const MOBILE_NUMBER_LENGTH = 10;
const OTP_LENGTH = 6;
const RESEND_OTP_SECONDS = 30;

const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function LoginScreen() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(RESEND_OTP_SECONDS);
    const [resendKey, setResendKey] = useState(0);
    const otpInputRefs = useRef<Array<TextInput | null>>([]);

    const isMobileNumberValid = mobileNumber.length === MOBILE_NUMBER_LENGTH;
    const isOtpComplete = otp.every(digit => digit !== '');

    useEffect(() => {
        if (!otpSent) {
            return;
        }
        setSecondsLeft(RESEND_OTP_SECONDS);
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [otpSent, resendKey]);

    useEffect(() => {
        if (otpSent) {
            otpInputRefs.current[0]?.focus();
        }
    }, [otpSent]);

    const handleSendOtp = () => {
        if (!isMobileNumberValid) {
            return;
        }
        // TODO: call send-OTP API
        setOtp(Array(OTP_LENGTH).fill(''));
        setOtpSent(true);
    };

    const handleResendOtp = () => {
        if (secondsLeft > 0) {
            return;
        }
        // TODO: call resend-OTP API
        setOtp(Array(OTP_LENGTH).fill(''));
        setResendKey(prev => prev + 1);
    };

    const handleOtpChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        setOtp(prev => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        if (digit && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (
        event: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number,
    ) => {
        if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = () => {
        if (!isOtpComplete) {
            return;
        }
        // TODO: call verify-OTP API
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                bounces={false}>
                <ImageBackground
                    source={backgroundImage}
                    style={styles.background}
                    resizeMode="cover">
                    <View style={styles.headerContent}>
                        <Image
                            source={margLogo}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />

                    </View>
                </ImageBackground>

                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <LockIcon size={moderateScale(72)} />
                    </View>

                    {otpSent ? (
                        <>
                            <Text style={styles.title}>{appString.loginScreen.verifyOtpTitle}</Text>
                            <Text style={styles.subtitle}>{appString.loginScreen.verifyOtpSubtitle}</Text>

                            <View style={styles.otpRow}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={ref => { otpInputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpBox,
                                            focusedOtpIndex === index && styles.otpBoxFocused,
                                        ]}
                                        value={digit}
                                        onChangeText={text => handleOtpChange(text, index)}
                                        onKeyPress={event => handleOtpKeyPress(event, index)}
                                        onFocus={() => setFocusedOtpIndex(index)}
                                        onBlur={() => setFocusedOtpIndex(null)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        returnKeyType="done"
                                    />
                                ))}
                            </View>

                            <View style={styles.resendRow}>
                                {secondsLeft > 0 ? (
                                    <Text style={styles.resendText}>
                                        {appString.loginScreen.resendOtpPrefix}
                                        <Text style={styles.resendTimer}>{formatCountdown(secondsLeft)}</Text>
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={handleResendOtp}>
                                        <Text style={styles.resendCta}>{appString.loginScreen.resendOtpCta}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.sendButton, !isOtpComplete && styles.sendButtonDisabled]}
                                activeOpacity={0.85}
                                disabled={!isOtpComplete}
                                onPress={handleVerifyOtp}>
                                <Text style={styles.sendButtonText}>{appString.loginScreen.loginButton}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>{appString.loginScreen.title}</Text>
                            <Text style={styles.subtitle}>{appString.loginScreen.subtitle}</Text>

                            <View style={styles.inputRow}>
                                <Text style={styles.phoneGlyph}>{appString.loginScreen.phoneIcon}</Text>
                                <Text style={styles.countryCode}>{appString.loginScreen.countryCode}</Text>
                                <Text style={styles.chevron}>{appString.loginScreen.chevronIcon}</Text>
                                <View style={styles.divider} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={appString.loginScreen.mobileNumberPlaceholder}
                                    placeholderTextColor={themeColors.placeholder}
                                    keyboardType="number-pad"
                                    maxLength={MOBILE_NUMBER_LENGTH}
                                    value={mobileNumber}
                                    onChangeText={text => setMobileNumber(text.replace(/[^0-9]/g, ''))}
                                    returnKeyType="done"
                                    enablesReturnKeyAutomatically
                                    onSubmitEditing={handleSendOtp}
                                />
                            </View>

                            <View style={styles.infoBanner}>
                                <View style={styles.infoIconCircle}>
                                    <Text style={styles.infoIconGlyph}>{appString.loginScreen.infoIcon}</Text>
                                </View>
                                <Text style={styles.infoText}>{appString.loginScreen.otpInfo}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.sendButton, !isMobileNumberValid && styles.sendButtonDisabled]}
                                activeOpacity={0.85}
                                disabled={!isMobileNumberValid}
                                onPress={handleSendOtp}>
                                <Text style={styles.sendButtonText}>{appString.loginScreen.sendOtpButton}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
