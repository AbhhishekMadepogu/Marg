import { Dimensions, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../../utility/constants/themeColors';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.5;
const WIDTH = SCREEN_WIDTH * 0.95;

// marg-logo.png is 775x255 (~3.04:1) — keep that ratio at any scaled width
const LOGO_WIDTH = moderateScale(180);
const LOGO_HEIGHT = LOGO_WIDTH * (255 / 775);

export const ICON_CIRCLE_SIZE = moderateScale(72);
export const ICON_SIZE = moderateScale(40);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
    },
    background: {
        height: HERO_HEIGHT,
    },
    backgroundCompact: {
        height: moderateScale(90),
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: moderateScale(54),
    },
    headerContentCompact: {
        paddingTop: moderateScale(16),
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(14),
        backgroundColor: colors.primary,
        marginRight: moderateScale(10),
    },
    logoText: {
        fontSize: moderateScale(34),
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: moderateScale(2),
    },
    logoImage: {
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
    },
    tagline: {
        marginTop: moderateScale(6),
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: colors.navy,
    },
    card: {
        flex: 1,
        marginTop: moderateScale(-32),
        backgroundColor: colors.white,
        borderTopLeftRadius: moderateScale(28),
        borderTopRightRadius: moderateScale(28),
        paddingHorizontal: moderateScale(24),
        paddingTop: moderateScale(40),
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: moderateScale(-4) },
        shadowOpacity: 0.08,
        shadowRadius: moderateScale(12),
        elevation: moderateScale(8),
        width: WIDTH,
        alignSelf: 'center'
    },
    backButton: {
        position: 'absolute',
        top: moderateScale(16),
        left: moderateScale(16),
        zIndex: 1,
        padding: moderateScale(6),
    },
    iconCircle: {
        position: 'absolute',
        top: moderateScale(-32),
        width: ICON_CIRCLE_SIZE,
        height: ICON_CIRCLE_SIZE,
        borderRadius: ICON_CIRCLE_SIZE / 2,
        // backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowOpacity: 0.15,
        shadowRadius: moderateScale(8),
        elevation: moderateScale(6),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: '800',
        color: colors.navy,
    },
    subtitle: {
        marginTop: moderateScale(8),
        fontSize: moderateScale(14),
        color: colors.subtitle,
        textAlign: 'center',
    },
    otpPhoneText: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: colors.navy,
        textAlign: 'center',
    },
    inputRow: {
        marginTop: moderateScale(28),
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: moderateScale(1),
        borderColor: colors.border,
        borderRadius: moderateScale(14),
        paddingHorizontal: moderateScale(16),
        height: moderateScale(56),
    },
    phoneGlyph: {
        fontSize: moderateScale(18),
        marginRight: moderateScale(10),
    },
    countryCode: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: colors.navy,
    },
    chevron: {
        marginLeft: moderateScale(4),
        marginRight: moderateScale(12),
        fontSize: moderateScale(14),
        color: colors.subtitle,
    },
    divider: {
        width: moderateScale(1),
        height: moderateScale(24),
        backgroundColor: colors.border,
        marginRight: moderateScale(12),
    },
    input: {
        flex: 1,
        fontSize: moderateScale(15),
        color: colors.navy,
        padding: 0,
    },
    infoBanner: {
        marginTop: moderateScale(16),
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.infoBg,
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
    },
    infoIconCircle: {
        width: moderateScale(22),
        height: moderateScale(22),
        borderRadius: moderateScale(11),
        borderWidth: moderateScale(1.5),
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(12),
        marginTop: moderateScale(1),
    },
    infoIconGlyph: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: colors.primary,
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        lineHeight: moderateScale(19),
        color: colors.infoText,
    },
    sendButton: {
        marginTop: moderateScale(24),
        width: '100%',
        height: moderateScale(56),
        borderRadius: moderateScale(14),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.primaryDisabled,
    },
    sendButtonText: {
        color: colors.white,
        fontSize: moderateScale(17),
        fontWeight: '700',
    },
    otpRow: {
        marginTop: moderateScale(28),
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    otpBox: {
        width: moderateScale(44),
        height: moderateScale(52),
        borderWidth: moderateScale(1.5),
        borderColor: colors.border,
        borderRadius: moderateScale(12),
        textAlign: 'center',
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: colors.navy,
        padding: 0,
    },
    otpBoxFocused: {
        borderColor: colors.primary,
    },
    resendRow: {
        marginTop: moderateScale(20),
        alignItems: 'center',
    },
    resendText: {
        fontSize: moderateScale(14),
        color: colors.subtitle,
    },
    resendTimer: {
        fontWeight: '700',
        color: colors.primary,
    },
    resendCta: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: colors.primary,
    },
    errorText: {
        marginTop: moderateScale(12),
        fontSize: moderateScale(13),
        color: colors.danger,
        textAlign: 'center',
    },
});
