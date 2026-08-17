import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../../utility/constants/themeColors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: moderateScale(24),
    },
    bellButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowOpacity: 0.15,
        shadowRadius: moderateScale(4),
        elevation: moderateScale(4),
    },
    content: {
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(20),
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: moderateScale(1),
        borderColor: colors.border,
        borderRadius: moderateScale(14),
        padding: moderateScale(14),
    },
    avatarCircle: {
        width: moderateScale(56),
        height: moderateScale(56),
        borderRadius: moderateScale(28),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.infoBg,
        marginRight: moderateScale(12),
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: colors.navy,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(6),
    },
    contactIcon: {
        marginRight: moderateScale(6),
    },
    contactText: {
        fontSize: moderateScale(12.5),
        color: colors.subtitle,
    },
    sectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: colors.navy,
        marginTop: moderateScale(24),
        marginBottom: moderateScale(12),
    },
    detailsCard: {
        backgroundColor: colors.white,
        borderWidth: moderateScale(1),
        borderColor: colors.border,
        borderRadius: moderateScale(14),
        paddingHorizontal: moderateScale(14),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(14),
        borderBottomWidth: moderateScale(1),
        borderBottomColor: colors.border,
    },
    detailRowLast: {
        borderBottomWidth: 0,
    },
    detailIconCircle: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.infoBg,
        marginRight: moderateScale(10),
    },
    detailLabel: {
        flex: 1,
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: colors.navy,
    },
    detailValue: {
        fontSize: moderateScale(12.5),
        color: colors.subtitle,
        textAlign: 'right',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: moderateScale(1),
        borderColor: colors.danger,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(14),
        marginTop: moderateScale(24),
    },
    logoutLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: colors.danger,
        marginLeft: moderateScale(8),
    },
});
