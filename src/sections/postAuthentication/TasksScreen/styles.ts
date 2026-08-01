import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../../utility/constants/themeColors';

const LOGO_WIDTH = moderateScale(110);
const LOGO_HEIGHT = LOGO_WIDTH * (255 / 775);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: moderateScale(24),
    },
    heroImage: {
        height: moderateScale(210),
        width: '100%',
    },
    heroContent: {
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(8),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoImage: {
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
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
    tagline: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(12),
        color: colors.subtitle,
    },
    content: {
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(20),
    },
    greeting: {
        fontSize: moderateScale(20),
        fontWeight: '800',
        color: colors.navy,
    },
    subtitle: {
        marginTop: moderateScale(4),
        fontSize: moderateScale(13),
        color: colors.subtitle,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: moderateScale(20),
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: moderateScale(4),
        paddingVertical: moderateScale(12),
        borderRadius: moderateScale(14),
        borderWidth: moderateScale(1),
        borderColor: colors.border,
    },
    statIconCircle: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(17),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: moderateScale(6),
        backgroundColor: colors.white,
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.4,
        shadowRadius: moderateScale(4),
        elevation: moderateScale(4),
    },
    statNumber: {
        fontSize: moderateScale(17),
        fontWeight: '800',
        color: colors.navy,
    },
    statLabel: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(10.5),
        color: colors.subtitle,
        textAlign: 'center',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: moderateScale(24),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: colors.navy,
    },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortLabel: {
        fontSize: moderateScale(11.5),
        color: colors.subtitle,
        marginRight: moderateScale(6),
    },
    sortValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: moderateScale(1),
        borderColor: colors.border,
        borderRadius: moderateScale(8),
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(5),
    },
    sortValueText: {
        fontSize: moderateScale(11.5),
        fontWeight: '700',
        color: colors.navy,
        marginRight: moderateScale(4),
    },
    taskList: {
        marginTop: moderateScale(14),
    },
    taskCard: {
        backgroundColor: colors.white,
        borderWidth: moderateScale(1),
        borderColor: colors.border,
        borderRadius: moderateScale(14),
        padding: moderateScale(12),
        marginBottom: moderateScale(12),
    },
    taskCardTopRow: {
        flexDirection: 'row',
    },
    taskThumb: {
        width: moderateScale(52),
        height: moderateScale(52),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(12),
    },
    taskThumbEmoji: {
        fontSize: moderateScale(22),
    },
    taskInfo: {
        flex: 1,
        paddingRight: moderateScale(16),
    },
    taskTitle: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: colors.navy,
    },
    taskMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(4),
    },
    taskMetaIcon: {
        marginRight: moderateScale(4),
    },
    taskMetaText: {
        fontSize: moderateScale(11.5),
        color: colors.subtitle,
    },
    chevron: {
        position: 'absolute',
        top: moderateScale(12),
        right: moderateScale(12),
    },
    actionsRow: {
        flexDirection: 'row',
        marginTop: moderateScale(12),
    },
    acceptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: moderateScale(1.5),
        borderColor: colors.success,
        borderRadius: moderateScale(10),
        paddingVertical: moderateScale(8),
        marginRight: moderateScale(8),
    },
    acceptButtonText: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: colors.success,
        marginLeft: moderateScale(4),
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: moderateScale(1.5),
        borderColor: colors.danger,
        borderRadius: moderateScale(10),
        paddingVertical: moderateScale(8),
    },
    rejectButtonText: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: colors.danger,
        marginLeft: moderateScale(4),
    },
    statusBadge: {
        marginTop: moderateScale(12),
        alignItems: 'center',
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(10),
        backgroundColor: colors.infoBg,
    },
    statusBadgeText: {
        fontSize: moderateScale(13),
        fontWeight: '700',
    },
});
