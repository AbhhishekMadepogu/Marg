import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Skeleton from '../../../components/Skeleton';
import styles from './styles';

export default function TaskCardSkeleton() {
    return (
        <View style={styles.taskCard}>
            <View style={styles.taskCardTopRow}>
                <Skeleton
                    width={moderateScale(64)}
                    height={moderateScale(64)}
                    borderRadius={moderateScale(10)}
                    style={styles.skeletonThumb}
                />
                <View style={styles.taskInfo}>
                    <Skeleton width="70%" height={moderateScale(14)} />
                    <Skeleton width="55%" height={moderateScale(10)} style={styles.skeletonLine} />
                    <Skeleton width="45%" height={moderateScale(10)} style={styles.skeletonLine} />
                </View>
            </View>
            <View style={styles.cardBottomRow}>
                <View style={[styles.cardBottomLeft, styles.actionsRow]}>
                    <Skeleton
                        width={moderateScale(64)}
                        height={moderateScale(24)}
                        borderRadius={moderateScale(7)}
                        style={styles.skeletonButton}
                    />
                    <Skeleton width={moderateScale(64)} height={moderateScale(24)} borderRadius={moderateScale(7)} />
                </View>
                <Skeleton width={moderateScale(28)} height={moderateScale(28)} borderRadius={moderateScale(14)} />
            </View>
        </View>
    );
}
