import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../utility/constants/themeColors';

export default StyleSheet.create({
    block: {
        backgroundColor: colors.skeleton,
        borderRadius: moderateScale(6),
        overflow: 'hidden',
    },
    highlight: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.skeletonHighlight,
    },
});
