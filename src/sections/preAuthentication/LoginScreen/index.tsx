import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageBackground,
    Keyboard,
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
import Icon from 'react-native-vector-icons/Feather';
import LockIcon from '../../../assets/icons/lock';
import margLogo from '../../../assets/icons/margLogo';
import { useAuth } from '../../../hooks/useAuth';
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
    const [apiError, setApiError] = useState<string | null>(null);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const otpInputRefs = useRef<Array<TextInput | null>>([]);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const { requestOtp, login, isRequestingOtp, isLoggingIn } = useAuth();

    const isMobileNumberValid = mobileNumber.length === MOBILE_NUMBER_LENGTH;
    const isOtpComplete = otp.every(digit => digit !== '');
    const fullPhoneNumber = `${mobileNumber}`;

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
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [otpSent]);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleSendOtp = async () => {
        if (!isMobileNumberValid) {
            return;
        }
        setApiError(null);
        try {
            await requestOtp(fullPhoneNumber);
            setOtp(Array(OTP_LENGTH).fill(''));
            setOtpSent(true);
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Failed to send OTP.');
        }
    };

    const handleBackToMobileNumber = () => {
        setOtpSent(false);
        setOtp(Array(OTP_LENGTH).fill(''));
        setApiError(null);
    };

    const handleResendOtp = async () => {
        if (secondsLeft > 0) {
            return;
        }
        setApiError(null);
        try {
            await requestOtp(fullPhoneNumber);
            setOtp(Array(OTP_LENGTH).fill(''));
            setResendKey(prev => prev + 1);
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Failed to resend OTP.');
        }
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

    const handleVerifyOtp = async () => {
        if (!isOtpComplete) {
            return;
        }
        setApiError(null);
        try {
            await login(fullPhoneNumber, otp.join(''));
            // AppStack switches to PostAuthenticationTabs automatically once isAuthenticated flips true.
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Invalid or expired OTP.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                bounces={false}>
                <ImageBackground
                    source={backgroundImage}
                    style={[styles.background, isKeyboardVisible && styles.backgroundCompact]}
                    resizeMode="cover">
                    <View
                        style={[
                            styles.headerContent,
                            isKeyboardVisible && styles.headerContentCompact,
                        ]}>
                        <Image
                            source={margLogo}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />

                    </View>
                </ImageBackground>

                <View style={styles.card}>
                    {otpSent ? (
                        <TouchableOpacity
                            style={styles.backButton}
                            activeOpacity={0.7}
                            onPress={handleBackToMobileNumber}>
                            <Icon name="arrow-left" size={moderateScale(22)} color={themeColors.primary} />
                        </TouchableOpacity>
                    ) : null}

                    <View style={styles.iconCircle}>
                        <LockIcon size={moderateScale(72)} />
                    </View>

                    {otpSent ? (
                        <>
                            <Text style={styles.title}>{appString.loginScreen.verifyOtpTitle}</Text>
                            <Text style={styles.subtitle}>{appString.loginScreen.verifyOtpSubtitle}</Text>
                            <Text style={styles.otpPhoneText}>
                                {appString.loginScreen.countryCode} {mobileNumber}
                            </Text>

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
                                        onFocus={() => {
                                            setFocusedOtpIndex(index);
                                            scrollViewRef.current?.scrollToEnd({ animated: true });
                                        }}
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

                            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!isOtpComplete || isLoggingIn) && styles.sendButtonDisabled,
                                ]}
                                activeOpacity={0.85}
                                disabled={!isOtpComplete || isLoggingIn}
                                onPress={handleVerifyOtp}>
                                <Text style={styles.sendButtonText}>
                                    {isLoggingIn ? 'Verifying…' : appString.loginScreen.loginButton}
                                </Text>
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
                                    onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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

                            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!isMobileNumberValid || isRequestingOtp) && styles.sendButtonDisabled,
                                ]}
                                activeOpacity={0.85}
                                disabled={!isMobileNumberValid || isRequestingOtp}
                                onPress={handleSendOtp}>
                                <Text style={styles.sendButtonText}>
                                    {isRequestingOtp ? 'Sending…' : appString.loginScreen.sendOtpButton}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
