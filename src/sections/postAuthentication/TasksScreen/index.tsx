import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Feather';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Hero, { HERO_MAX_HEIGHT, HERO_MIN_CONTENT_HEIGHT } from '../../../components/Hero';
import { useAuth } from '../../../hooks/useAuth';
import {
    useAcceptTaskMutation,
    useRejectTaskMutation,
    useResolveTaskMutation,
    useTasksQuery,
    type IssueTask,
    type PhotoFile,
} from '../../../hooks/useIssue';
import { appString } from '../../../utility/constants/appString';
import { API_BASE_URL } from '../../../utility/constants/apiConfig';
import { themeColors } from '../../../utility/constants/themeColors';
import { formatDateIST, formatDateTimeIST, toISTDateOnly } from '../../../utility/dateTime';
import AcceptTaskModal from './AcceptTaskModal';
import CompleteTaskModal from './CompleteTaskModal';
import PhotoPreviewModal from './PhotoPreviewModal';
import RejectTaskModal from './RejectTaskModal';
import TaskCardSkeleton from './TaskCardSkeleton';
import TaskThumbnail from './TaskThumbnail';
import styles from './styles';

const getMediaUrl = (issueId: string, type: 'before' | 'after') =>
    `${API_BASE_URL}/media/${issueId}/${type}`;

const SKELETON_CARD_COUNT = 4;

// Fallback estimate used only until the real, measured height lands after first layout.
const DEFAULT_STICKY_HEADER_HEIGHT = moderateScale(230);

type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'resolved';
type TaskFilter = 'assigned' | 'inProgress' | 'completed' | 'overdue';

type Task = {
    id: string;
    title: string;
    ward: string;
    assignedDate: string;
    etaDate: string | null;
    etaDateRaw: string | null;
    completedAt: string | null;
    beforePhotoUri: string;
    photoUri: string | null;
    lat: number;
    lng: number;
    emoji: string;
    thumbBg: string;
    status: TaskStatus;
};

const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
        Alert.alert('Could not open Maps', 'Please check that you have a maps app installed.');
    });
};

const CATEGORY_VISUALS: { keyword: string; emoji: string; thumbBg: string }[] = [
    { keyword: 'pothole', emoji: '🕳️', thumbBg: themeColors.infoBg },
    { keyword: 'light', emoji: '💡', thumbBg: themeColors.warningBg },
    { keyword: 'garbage', emoji: '🗑️', thumbBg: themeColors.successBg },
    { keyword: 'footpath', emoji: '🧱', thumbBg: themeColors.infoBg },
    { keyword: 'sign', emoji: '🪧', thumbBg: themeColors.dangerBg },
];
const DEFAULT_VISUAL = { emoji: '📋', thumbBg: themeColors.infoBg };

const getCategoryVisual = (categoryName: string) => {
    const normalized = categoryName.toLowerCase();
    const match = CATEGORY_VISUALS.find(visual => normalized.includes(visual.keyword));
    return match ?? DEFAULT_VISUAL;
};

const getTaskStatus = (issue: IssueTask): TaskStatus => {
    const normalizedStatus = (issue.status || '').toLowerCase();
    if (normalizedStatus.includes('reject')) {
        return 'rejected';
    }
    if (normalizedStatus.includes('resolv') || issue.resolved_at) {
        return 'resolved';
    }
    if (normalizedStatus.includes('accept') || issue.accepted_at) {
        return 'accepted';
    }
    return 'pending';
};

const toCalendarDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const MAX_GREETING_NAME_LENGTH = 20;

const truncateName = (name: string) =>
    name.length > MAX_GREETING_NAME_LENGTH ? `${name.slice(0, MAX_GREETING_NAME_LENGTH)}...` : name;

const isTaskOverdue = (task: Task) => {
    if (task.status !== 'accepted' || !task.etaDateRaw) {
        return false;
    }
    const eta = new Date(task.etaDateRaw);
    if (Number.isNaN(eta.getTime())) {
        return false;
    }
    return toISTDateOnly(eta) < toISTDateOnly(new Date());
};

const daysOverdue = (etaDateRaw: string) => {
    const etaMidnightUTC = new Date(`${toISTDateOnly(etaDateRaw)}T00:00:00Z`).getTime();
    const todayMidnightUTC = new Date(`${toISTDateOnly(new Date())}T00:00:00Z`).getTime();
    return Math.max(1, Math.round((todayMidnightUTC - etaMidnightUTC) / (24 * 60 * 60 * 1000)));
};

const mapIssueToTask = (issue: IssueTask): Task => {
    const visual = getCategoryVisual(issue.category_name || '');
    const status = getTaskStatus(issue);
    return {
        id: issue.id,
        title: issue.category_name || 'Issue',
        ward: issue.address ?? `${issue.lat}, ${issue.lng}`,
        assignedDate: formatDateIST(issue.assigned_at ?? issue.created_at),
        etaDate: issue.eta_date ? formatDateIST(issue.eta_date) : null,
        etaDateRaw: issue.eta_date,
        completedAt: issue.resolved_at ? formatDateTimeIST(issue.resolved_at) : null,
        beforePhotoUri: getMediaUrl(issue.id, 'before'),
        photoUri: status === 'resolved' ? getMediaUrl(issue.id, 'after') : null,
        lat: issue.lat,
        lng: issue.lng,
        emoji: visual.emoji,
        thumbBg: visual.thumbBg,
        status,
    };
};

export default function TasksScreen() {
    const { user } = useAuth();
    const tasksQuery = useTasksQuery();
    const acceptTaskMutation = useAcceptTaskMutation();
    const rejectTaskMutation = useRejectTaskMutation();
    const resolveTaskMutation = useResolveTaskMutation();
    const tasks = useMemo(() => (tasksQuery.data ?? []).map(mapIssueToTask), [tasksQuery.data]);
    const [actionError, setActionError] = useState<string | null>(null);
    const error = actionError ?? tasksQuery.error?.message ?? null;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [acceptTaskId, setAcceptTaskId] = useState<string | null>(null);
    const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
    const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);
    const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<TaskFilter>('assigned');
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number | null>(null);

    const heroMinHeight = insets.top + HERO_MIN_CONTENT_HEIGHT;
    const heroCollapseDistance = HERO_MAX_HEIGHT - heroMinHeight;

    // The pinned header (greeting, stats, section row) always stays fully visible;
    // only its top position tracks the hero's collapse, at exactly the scroll rate,
    // so its bottom edge always lines up with the list's top edge underneath it -
    // no gap, no overlap.
    const heroHeight = scrollY.interpolate({
        inputRange: [0, heroCollapseDistance],
        outputRange: [HERO_MAX_HEIGHT, heroMinHeight],
        extrapolate: 'clamp',
    });
    const reservedTopSpace = HERO_MAX_HEIGHT + (stickyHeaderHeight ?? DEFAULT_STICKY_HEADER_HEIGHT);

    const { refetch: refetchTasks } = tasksQuery;
    const handleRefresh = useCallback(async () => {
        setActionError(null);
        setIsRefreshing(true);
        await refetchTasks();
        setIsRefreshing(false);
    }, [refetchTasks]);

    const assignedTasks = tasks.filter(task => task.status === 'pending' || task.status === 'rejected');
    const overdueTasks = tasks.filter(isTaskOverdue);
    const overdueIds = new Set(overdueTasks.map(task => task.id));
    const inProgressTasks = tasks.filter(task => task.status === 'accepted' && !overdueIds.has(task.id));
    const completedTasks = tasks.filter(task => task.status === 'resolved');

    const stats: { key: TaskFilter; label: string; value: number; icon: string; iconSet: 'fa5' | 'mci'; color: string }[] = [
        {
            key: 'assigned',
            label: appString.tasksScreen.statAssigned,
            value: assignedTasks.length,
            icon: 'clipboard-list',
            iconSet: 'fa5',
            color: themeColors.primary,
        },
        {
            key: 'inProgress',
            label: appString.tasksScreen.statInProgress,
            value: inProgressTasks.length,
            icon: 'clock',
            iconSet: 'fa5',
            color: themeColors.warning,
        },
        {
            key: 'completed',
            label: appString.tasksScreen.statCompleted,
            value: completedTasks.length,
            icon: 'check-circle',
            iconSet: 'fa5',
            color: themeColors.success,
        },
        {
            key: 'overdue',
            label: appString.tasksScreen.statOverdue,
            value: overdueTasks.length,
            icon: 'timer-sand-complete',
            iconSet: 'mci',
            color: themeColors.danger,
        },
    ];

    const FILTER_COPY: Record<
        TaskFilter,
        { subtitle: string; sectionTitle: string; tasks: Task[] }
    > = {
        assigned: {
            subtitle: appString.tasksScreen.subtitleAssigned,
            sectionTitle: appString.tasksScreen.assignedTasksTitle,
            tasks: assignedTasks,
        },
        inProgress: {
            subtitle: appString.tasksScreen.subtitleInProgress,
            sectionTitle: appString.tasksScreen.inProgressTasksTitle,
            tasks: inProgressTasks,
        },
        completed: {
            subtitle: appString.tasksScreen.subtitleCompleted,
            sectionTitle: appString.tasksScreen.completedTasksTitle,
            tasks: completedTasks,
        },
        overdue: {
            subtitle: appString.tasksScreen.subtitleOverdue,
            sectionTitle: appString.tasksScreen.overdueTasksTitle,
            tasks: overdueTasks,
        },
    };
    const activeFilterCopy = FILTER_COPY[activeFilter];
    const greetingName = truncateName(user?.fullName?.trim() || appString.tasksScreen.greetingFallbackName);
    const previewTask = tasks.find(task => task.id === previewTaskId) ?? null;

    // Successful mutations write the updated task into the tasks query cache,
    // so the list re-derives from it without any local bookkeeping here.
    const handleAcceptConfirm = async (etaDate: Date) => {
        if (!acceptTaskId) {
            return;
        }
        try {
            await acceptTaskMutation.mutateAsync({
                issueId: acceptTaskId,
                etaDate: toCalendarDateString(etaDate),
            });
            setAcceptTaskId(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to accept task.');
        }
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!rejectTaskId) {
            return;
        }
        try {
            await rejectTaskMutation.mutateAsync({ issueId: rejectTaskId, reason });
            setRejectTaskId(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to reject task.');
        }
    };

    const handleCompleteConfirm = async (photo: PhotoFile, _comment: string) => {
        if (!completeTaskId) {
            return;
        }
        try {
            await resolveTaskMutation.mutateAsync({ issueId: completeTaskId, photo });
            setCompleteTaskId(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to complete task.');
        }
    };

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: reservedTopSpace }]}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.primary]}
                        tintColor={themeColors.primary}
                    />
                }>
                <View style={styles.listContent}>
                    {tasksQuery.isLoading ? (
                        <View style={styles.taskList}>
                            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                                <TaskCardSkeleton key={index} />
                            ))}
                        </View>
                    ) : error ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                activeOpacity={0.8}
                                onPress={() => {
                                    setActionError(null);
                                    refetchTasks();
                                }}>
                                <Text style={styles.retryButtonText}>
                                    {appString.tasksScreen.retryButton}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : activeFilterCopy.tasks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {appString.tasksScreen.noTasksMessage}
                            </Text>
                        </View>
                    ) : (
                    <View style={styles.taskList}>
                        {activeFilterCopy.tasks.map(task => (
                            <View
                                key={task.id}
                                style={[
                                    styles.taskCard,
                                    task.status !== 'pending' && styles.taskCardCompact,
                                ]}>
                                <View style={styles.taskCardTopRow}>
                                    <TaskThumbnail
                                        uri={task.beforePhotoUri}
                                        emoji={task.emoji}
                                        backgroundColor={task.thumbBg}
                                    />
                                    <View style={styles.taskInfo}>
                                        <View style={styles.taskTitleRow}>
                                            <Text style={styles.taskTitle} numberOfLines={2}>
                                                {task.title}
                                            </Text>
                                            {activeFilter === 'completed' ? (
                                                <View style={styles.completedPill}>
                                                    <FA5Icon name="check-circle" size={10} color={themeColors.success} solid />
                                                    <Text style={styles.completedPillText}>
                                                        {appString.tasksScreen.resolvedStatus}
                                                    </Text>
                                                </View>
                                            ) : task.status === 'rejected' ? (
                                                <View style={styles.statusBadge}>
                                                    <Text style={[styles.statusBadgeText, { color: themeColors.danger }]}>
                                                        {appString.tasksScreen.rejectedStatus}
                                                    </Text>
                                                </View>
                                            ) : activeFilter === 'inProgress' ? (
                                                <View style={styles.inProgressPill}>
                                                    <FA5Icon name="clock" size={10} color={themeColors.warning} solid />
                                                    <Text style={styles.inProgressPillText}>
                                                        {appString.tasksScreen.statInProgress}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <View style={styles.taskMetaRow}>
                                            <Icon name="map-pin" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                            <Text style={styles.taskMetaText}>{task.ward}</Text>
                                        </View>

                                        {activeFilter === 'completed' ? (
                                            <>
                                                <View style={styles.taskMetaRow}>
                                                    <Icon name="calendar" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                                    <Text style={styles.taskMetaText}>
                                                        {appString.tasksScreen.completedOnPrefix}
                                                        {task.completedAt}
                                                    </Text>
                                                </View>
                                                {task.photoUri ? (
                                                    <TouchableOpacity
                                                        style={styles.viewPhotoRow}
                                                        activeOpacity={0.7}
                                                        onPress={() => setPreviewTaskId(task.id)}>
                                                        <Icon name="image" size={11} color={themeColors.primary} style={styles.taskMetaIcon} />
                                                        <Text style={styles.viewPhotoText}>
                                                            {appString.tasksScreen.viewPhotoLabel}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ) : null}
                                            </>
                                        ) : activeFilter === 'overdue' ? (
                                            <>
                                                <View style={styles.taskMetaRow}>
                                                    <Icon name="calendar" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                                    <Text style={styles.taskMetaText}>
                                                        {appString.tasksScreen.dueOnPrefix}
                                                        {task.etaDate}
                                                    </Text>
                                                </View>
                                                <View style={styles.taskMetaRow}>
                                                    <Icon name="clock" size={11} color={themeColors.danger} style={styles.taskMetaIcon} />
                                                    <Text style={[styles.taskMetaText, styles.overdueText]}>
                                                        {appString.tasksScreen.overdueByPrefix}
                                                        {task.etaDateRaw ? daysOverdue(task.etaDateRaw) : 0}
                                                        {(task.etaDateRaw ? daysOverdue(task.etaDateRaw) : 0) === 1
                                                            ? appString.tasksScreen.overdueBySuffixSingular
                                                            : appString.tasksScreen.overdueBySuffixPlural}
                                                    </Text>
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <View style={styles.taskMetaRow}>
                                                    <Icon name="calendar" size={11} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                                    <Text style={styles.taskMetaText}>
                                                        {appString.tasksScreen.assignedOnPrefix}
                                                        {task.assignedDate}
                                                    </Text>
                                                </View>
                                                {task.etaDate ? (
                                                    <View style={styles.taskMetaRow}>
                                                        <MCIcon name="flag-checkered" size={12} color={themeColors.subtitle} style={styles.taskMetaIcon} />
                                                        <Text style={styles.taskMetaText}>
                                                            {appString.tasksScreen.etaPrefix}
                                                            {task.etaDate}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </>
                                        )}
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.cardBottomRow,
                                        task.status !== 'pending' && styles.cardBottomRowCompact,
                                    ]}>
                                    <View style={styles.cardBottomLeft}>
                                        {task.status === 'pending' ? (
                                            <View style={styles.actionsRow}>
                                                <TouchableOpacity
                                                    style={styles.acceptButton}
                                                    activeOpacity={0.8}
                                                    onPress={() => setAcceptTaskId(task.id)}>
                                                    <Icon name="check" size={10} color={themeColors.success} />
                                                    <Text style={styles.acceptButtonText}>
                                                        {appString.tasksScreen.acceptButton}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.rejectButton}
                                                    activeOpacity={0.8}
                                                    onPress={() => setRejectTaskId(task.id)}>
                                                    <Icon name="x" size={10} color={themeColors.danger} />
                                                    <Text style={styles.rejectButtonText}>
                                                        {appString.tasksScreen.rejectButton}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : task.status === 'accepted' ? (
                                            <TouchableOpacity
                                                style={styles.completeButton}
                                                activeOpacity={0.8}
                                                onPress={() => setCompleteTaskId(task.id)}>
                                                <Icon name="check-circle" size={12} color={themeColors.white} />
                                                <Text style={styles.completeButtonText}>
                                                    {appString.tasksScreen.completeButton}
                                                </Text>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.navigateButton,
                                            task.status !== 'pending' && styles.navigateButtonCompact,
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() => openInMaps(task.lat, task.lng)}>
                                        <Icon
                                            name="navigation"
                                            size={task.status !== 'pending' ? 11 : 13}
                                            color={themeColors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                    )}
                </View>
            </Animated.ScrollView>

            <View style={styles.heroOverlay} pointerEvents="box-none">
                <Hero scrollY={scrollY}>
                    <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                        <Icon name="bell" size={18} color={themeColors.navy} />
                    </TouchableOpacity>
                </Hero>
            </View>

            <Animated.View
                style={[styles.pinnedHeader, { top: heroHeight }]}
                onLayout={event => {
                    if (stickyHeaderHeight === null) {
                        setStickyHeaderHeight(event.nativeEvent.layout.height);
                    }
                }}>
                <Text style={styles.greeting}>
                    {appString.tasksScreen.greetingPrefix}
                    {greetingName}
                    {appString.tasksScreen.greetingSuffix}
                </Text>
                <Text style={styles.subtitle}>{activeFilterCopy.subtitle}</Text>

                <View style={styles.statsRow}>
                    {stats.map(stat => {
                        const isActive = stat.key === activeFilter;
                        return (
                            <TouchableOpacity
                                key={stat.key}
                                style={[
                                    styles.statCard,
                                    isActive && {
                                        borderColor: stat.color,
                                        backgroundColor: `${stat.color}0D`,
                                    },
                                ]}
                                activeOpacity={0.8}
                                onPress={() => setActiveFilter(stat.key)}>
                                <View style={styles.statTopRow}>
                                    <View style={[styles.statIconCircle, { shadowColor: stat.color }]}>
                                        {stat.iconSet === 'fa5' ? (
                                            <FA5Icon name={stat.icon} size={15} color={stat.color} solid />
                                        ) : (
                                            <MCIcon name={stat.icon} size={17} color={stat.color} />
                                        )}
                                    </View>
                                    <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                                </View>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                {isActive ? (
                                    <View style={[styles.statCardActiveBar, { backgroundColor: stat.color }]} />
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>
                        {activeFilterCopy.sectionTitle} ({activeFilterCopy.tasks.length})
                    </Text>
                </View>
            </Animated.View>

            <AcceptTaskModal
                visible={acceptTaskId !== null}
                isSubmitting={acceptTaskMutation.isPending}
                onClose={() => setAcceptTaskId(null)}
                onConfirm={handleAcceptConfirm}
            />
            <RejectTaskModal
                visible={rejectTaskId !== null}
                isSubmitting={rejectTaskMutation.isPending}
                onClose={() => setRejectTaskId(null)}
                onConfirm={handleRejectConfirm}
            />
            <CompleteTaskModal
                visible={completeTaskId !== null}
                isSubmitting={resolveTaskMutation.isPending}
                onClose={() => setCompleteTaskId(null)}
                onConfirm={handleCompleteConfirm}
            />
            <PhotoPreviewModal
                visible={previewTaskId !== null}
                photoUri={previewTask?.photoUri ?? null}
                taskTitle={previewTask?.title ?? ''}
                completedAt={previewTask?.completedAt ?? null}
                onClose={() => setPreviewTaskId(null)}
            />
        </View>
    );
}
