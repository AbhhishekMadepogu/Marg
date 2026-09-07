import React, { type ReactNode } from 'react';
import { Animated, Image, ImageBackground, Text, type ImageSourcePropType, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import margLogo from '../../assets/icons/margLogo';
import { appString } from '../../utility/constants/appString';
import styles from './styles';

const defaultBackgroundImage = require('../../assets/images/hero.png');
export const HERO_MAX_HEIGHT = styles.heroImage.height as number;
export const HERO_MIN_CONTENT_HEIGHT = moderateScale(64);

type HeroProps = {
    source?: ImageSourcePropType;
    showTagline?: boolean;
    children?: ReactNode;
    /** When provided, the hero collapses toward a minimum height as this scroll offset increases. */
    scrollY?: Animated.Value;
};

export default function Hero({ source = defaultBackgroundImage, showTagline = false, children, scrollY }: HeroProps) {
    const insets = useSafeAreaInsets();
    const heroMinHeight = insets.top + HERO_MIN_CONTENT_HEIGHT;
    const heroHeight = scrollY
        ? scrollY.interpolate({
              inputRange: [0, HERO_MAX_HEIGHT - heroMinHeight],
              outputRange: [HERO_MAX_HEIGHT, heroMinHeight],
              extrapolate: 'clamp',
          })
        : HERO_MAX_HEIGHT;

    return (
        <Animated.View style={[styles.heroContainer, { height: heroHeight }]}>
            <ImageBackground source={source} style={styles.heroImageFill} resizeMode="cover">
                <SafeAreaView edges={['top']} style={styles.heroContent}>
                    <View style={styles.headerRow}>
                        <View>
                            <Image source={margLogo} style={styles.logoImage} resizeMode="contain" />
                            {showTagline ? <Text style={styles.tagline}>{appString.common.tagline}</Text> : null}
                        </View>
                        {children}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </Animated.View>
    );
}
