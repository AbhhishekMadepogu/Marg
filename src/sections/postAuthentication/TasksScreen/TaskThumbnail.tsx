import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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

    return (
        <View style={[styles.taskThumb, { backgroundColor }]}>
            {!hasError && accessToken ? (
                <Image
                    source={{ uri, headers: { Authorization: `Bearer ${accessToken}` } }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <Text style={styles.taskThumbEmoji}>{emoji}</Text>
            )}
        </View>
    );
}
