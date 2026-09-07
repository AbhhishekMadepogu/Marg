import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../utility/constants/themeColors';

const LOGO_WIDTH = moderateScale(110);
const LOGO_HEIGHT = LOGO_WIDTH * (255 / 775);

export default StyleSheet.create({
    heroImage: {
        height: moderateScale(210),
        width: '100%',
    },
    heroContainer: {
        width: '100%',
        overflow: 'hidden',
    },
    heroImageFill: {
        flex: 1,
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
    tagline: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(11),
        color: colors.subtitle,
    },
});
