import React, { useState } from 'react';
import {
    Image,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import margLogo from '../../../assets/icons/margLogo';
import { appString } from '../../../utility/constants/appString';
import { themeColors } from '../../../utility/constants/themeColors';
import styles from './styles';

const backgroundImage = require('../../../assets/images/mobile-background.png');

type TaskStatus = 'pending' | 'accepted' | 'rejected';

type Task = {
    id: string;
    title: string;
    ward: string;
    assignedDate: string;
    emoji: string;
    thumbBg: string;
    status: TaskStatus;
};

// Mock data until the tasks API is wired up.
const INITIAL_TASKS: Task[] = [
    {
        id: '1',
        title: 'Pothole on Main Street',
        ward: 'Ward 12, City Center',
        assignedDate: '20 May 2025',
        emoji: '🕳️',
        thumbBg: themeColors.infoBg,
        status: 'pending',
    },
    {
        id: '2',
        title: 'Street Light Not Working',
        ward: 'Ward 8, Green Park',
        assignedDate: '19 May 2025',
        emoji: '💡',
        thumbBg: themeColors.warningBg,
        status: 'pending',
    },
    {
        id: '3',
        title: 'Garbage Collection Pending',
        ward: 'Ward 15, Sunrise Area',
        assignedDate: '18 May 2025',
        emoji: '🗑️',
        thumbBg: themeColors.successBg,
        status: 'pending',
    },
    {
        id: '4',
        title: 'Footpath Tiles Damaged',
        ward: 'Ward 3, Lake View',
        assignedDate: '18 May 2025',
        emoji: '🧱',
        thumbBg: themeColors.infoBg,
        status: 'pending',
    },
    {
        id: '5',
        title: 'Road Sign Board Missing',
        ward: 'Ward 6, Hill Road',
        assignedDate: '17 May 2025',
        emoji: '🪧',
        thumbBg: themeColors.dangerBg,
        status: 'pending',
    },
];

export default function TasksScreen() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);

    const assignedCount = tasks.filter(task => task.status === 'pending').length;
    const acceptedCount = tasks.filter(task => task.status === 'accepted').length;

    const stats = [
        {
            key: 'assigned',
            label: appString.tasksScreen.statAssigned,
            value: assignedCount,
            icon: 'clipboard-list',
            iconSet: 'fa5' as const,
            color: themeColors.primary,
        },
        {
            key: 'inProgress',
            label: appString.tasksScreen.statInProgress,
            value: 2,
            icon: 'clock',
            iconSet: 'fa5' as const,
            color: themeColors.warning,
        },
        {
            key: 'completed',
            label: appString.tasksScreen.statCompleted,
            value: acceptedCount,
            icon: 'check-circle',
            iconSet: 'fa5' as const,
            color: themeColors.success,
        },
        {
            key: 'overdue',
            label: appString.tasksScreen.statOverdue,
            value: 1,
            icon: 'timer-sand-complete',
            iconSet: 'mci' as const,
            color: themeColors.danger,
        },
    ];

    const setTaskStatus = (id: string, status: TaskStatus) => {
        // TODO: call accept/reject-task API
        setTasks(prev => prev.map(task => (task.id === id ? { ...task, status } : task)));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={backgroundImage}
                    style={styles.heroImage}
                    resizeMode="cover">
                    <SafeAreaView edges={['top']} style={styles.heroContent}>
                        <View style={styles.headerRow}>
                            <Image source={margLogo} style={styles.logoImage} resizeMode="contain" />
                            <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                                <Icon name="bell" size={18} color={themeColors.navy} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ImageBackground>

                <View style={styles.content}>
                    <Text style={styles.greeting}>{appString.tasksScreen.greeting}</Text>
                    <Text style={styles.subtitle}>{appString.tasksScreen.subtitle}</Text>

                    <View style={styles.statsRow}>
                        {stats.map(stat => (
                            <View key={stat.key} style={styles.statCard}>
                                <View style={[styles.statIconCircle, { shadowColor: stat.color }]}>
                                    {stat.iconSet === 'fa5' ? (
                                        <FA5Icon name={stat.icon} size={15} color={stat.color} solid />
                                    ) : (
                                        <MCIcon name={stat.icon} size={17} color={stat.color} />
                                    )}
                                </View>
                                <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>
                            {appString.tasksScreen.assignedTasksTitle} ({tasks.length})
                        </Text>
                        <View style={styles.sortRow}>
                            <Text style={styles.sortLabel}>{appString.tasksScreen.sortByLabel}</Text>
                            <View style={styles.sortValueRow}>
                                <Text style={styles.sortValueText}>{appString.tasksScreen.sortOption}</Text>
                                <Icon name="chevron-down" size={12} color={themeColors.subtitle} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.taskList}>
                        {tasks.map(task => (
                            <View key={task.id} style={styles.taskCard}>
                                <View style={styles.taskCardTopRow}>
                                    <View style={[styles.taskThumb, { backgroundColor: task.thumbBg }]}>
                                        <Text style={styles.taskThumbEmoji}>{task.emoji}</Text>
                                    </View>
                                    <View style={styles.taskInfo}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        <View style={styles.taskMetaRow}>
                                            <Icon name="map-pin" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                            <Text style={styles.taskMetaText}>{task.ward}</Text>
                                        </View>
                                        <View style={styles.taskMetaRow}>
                                            <Icon name="calendar" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                            <Text style={styles.taskMetaText}>
                                                {appString.tasksScreen.assignedOnPrefix}
                                                {task.assignedDate}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Icon name="chevron-right" size={18} color={themeColors.subtitle} style={styles.chevron} />

                                {task.status === 'pending' ? (
                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            style={styles.acceptButton}
                                            activeOpacity={0.8}
                                            onPress={() => setTaskStatus(task.id, 'accepted')}>
                                            <Icon name="check" size={14} color={themeColors.success} />
                                            <Text style={styles.acceptButtonText}>
                                                {appString.tasksScreen.acceptButton}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.rejectButton}
                                            activeOpacity={0.8}
                                            onPress={() => setTaskStatus(task.id, 'rejected')}>
                                            <Icon name="x" size={14} color={themeColors.danger} />
                                            <Text style={styles.rejectButtonText}>
                                                {appString.tasksScreen.rejectButton}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.statusBadge}>
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                {
                                                    color:
                                                        task.status === 'accepted'
                                                            ? themeColors.success
                                                            : themeColors.danger,
                                                },
                                            ]}>
                                            {task.status === 'accepted'
                                                ? appString.tasksScreen.acceptedStatus
                                                : appString.tasksScreen.rejectedStatus}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
