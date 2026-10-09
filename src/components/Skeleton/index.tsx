import React, { memo, useEffect, useRef } from 'react';
import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import styles from './styles';

type SkeletonProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
};

const PULSE_DURATION_MS = 700;

function Skeleton({ width, height, borderRadius, style }: SkeletonProps) {
    const highlightOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // JS-driven on purpose: with the New Architecture, a native-driven opacity can be
        // reset to its initial value whenever the parent re-renders (e.g. while a query's
        // loading state changes), which leaves the pulse frozen on its first frame.
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(highlightOpacity, { toValue: 1, duration: PULSE_DURATION_MS, useNativeDriver: false }),
                Animated.timing(highlightOpacity, { toValue: 0, duration: PULSE_DURATION_MS, useNativeDriver: false }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [highlightOpacity]);

    // The pulse fades a darker layer over a solid base instead of fading the whole
    // block, so it stays visible on any background (e.g. the tinted avatar circle).
    return (
        <View
            style={[
                styles.block,
                { width, height },
                borderRadius !== undefined && { borderRadius },
                style,
            ]}>
            <Animated.View style={[styles.highlight, { opacity: highlightOpacity }]} />
        </View>
    );
}

export default memo(Skeleton);
