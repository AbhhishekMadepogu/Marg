import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Skeleton from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import styles from './styles';

type TaskThumbnailProps = {
    uri: string;
    emoji: string;
    backgroundColor: string;
};

export default function TaskThumbnail({ uri, emoji, backgroundColor }: TaskThumbnailProps) {
    const { accessToken } = useAuth();
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <View style={[styles.taskThumb, { backgroundColor }]}>
            {!hasError && accessToken ? (
                <>
                    <Image
                        source={{ uri, headers: { Authorization: `Bearer ${accessToken}` } }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    {/* The Image has to stay mounted to load, so the skeleton sits on top until it does. */}
                    {!isLoaded ? <Skeleton borderRadius={0} style={StyleSheet.absoluteFill} /> : null}
                </>
            ) : (
                <Text style={styles.taskThumbEmoji}>{emoji}</Text>
            )}
        </View>
    );
}
