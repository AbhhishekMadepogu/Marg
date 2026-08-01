import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { themeColors as colors } from '../../../utility/constants/themeColors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: '800',
        color: colors.navy,
    },
});
