import React from 'react';
import Svg, {
    Circle,
    Defs,
    FeDropShadow,
    Filter,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from 'react-native-svg';

type LockIconProps = {
    size?: number;
};

export default function LockIcon({ size = 220 }: LockIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
            <Defs>
                <LinearGradient id="shieldGradient" x1="32" y1="28" x2="88" y2="90" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor="#0B7CFF" />
                    <Stop offset="1" stopColor="#003CBA" />
                </LinearGradient>
                <Filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <FeDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#005BFF" floodOpacity="0.18" />
                </Filter>
            </Defs>

            <Circle cx="60" cy="60" r="52" fill="#F3F8FF" />
            <Circle cx="60" cy="60" r="51" stroke="#D7E4F5" strokeWidth="2" />
            <Circle cx="60" cy="60" r="45" stroke="#EAF4FF" strokeWidth="1.5" />

            <Path filter="url(#softShadow)"
                d="M60 27L82 36V54C82 72.5 70.2 84.2 60 90C49.8 84.2 38 72.5 38 54V36L60 27Z"
                fill="url(#shieldGradient)" />

            <Path d="M50.5 56V49.8C50.5 44.4 54.6 40.2 60 40.2C65.4 40.2 69.5 44.4 69.5 49.8V56"
                stroke="white" strokeWidth="4" strokeLinecap="round" />

            <Rect x="48" y="54" width="24" height="21" rx="4" fill="white" />
            <Circle cx="60" cy="63" r="3" fill="#005BFF" />
            <Path d="M60 65.5V70" stroke="#005BFF" strokeWidth="3" strokeLinecap="round" />
        </Svg>
    );
}

