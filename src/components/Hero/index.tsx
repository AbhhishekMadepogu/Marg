import React, { type ReactNode } from 'react';
import { Image, ImageBackground, Text, type ImageSourcePropType, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import margLogo from '../../assets/icons/margLogo';
import { appString } from '../../utility/constants/appString';
import styles from './styles';

const defaultBackgroundImage = require('../../assets/images/hero.png');

type HeroProps = {
    source?: ImageSourcePropType;
    showTagline?: boolean;
    children?: ReactNode;
};

export default function Hero({ source = defaultBackgroundImage, showTagline = false, children }: HeroProps) {
    return (
        <ImageBackground source={source} style={styles.heroImage} resizeMode="cover">
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
    );
}
