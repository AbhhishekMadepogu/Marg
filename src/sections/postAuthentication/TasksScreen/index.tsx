import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Hero from '../../../components/Hero';
import { useIssue, type IssueTask, type PhotoFile } from '../../../hooks/useIssue';
import { appString } from '../../../utility/constants/appString';
import { API_BASE_URL } from '../../../utility/constants/apiConfig';
import { themeColors } from '../../../utility/constants/themeColors';
import AcceptTaskModal from './AcceptTaskModal';
import CompleteTaskModal from './CompleteTaskModal';
import PhotoPreviewModal from './PhotoPreviewModal';
import RejectTaskModal from './RejectTaskModal';
import TaskThumbnail from './TaskThumbnail';
import styles from './styles';

const getMediaUrl = (issueId: string, type: 'before' | 'after') =>
    `${API_BASE_URL}/media/${issueId}/${type}`;

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

const formatAssignedDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${timePart}`;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isTaskOverdue = (task: Task) => {
    if (task.status !== 'accepted' || !task.etaDateRaw) {
        return false;
    }
    const eta = new Date(task.etaDateRaw);
    if (Number.isNaN(eta.getTime())) {
        return false;
    }
    return startOfDay(eta).getTime() < startOfDay(new Date()).getTime();
};

const daysOverdue = (etaDateRaw: string) => {
    const eta = startOfDay(new Date(etaDateRaw));
    const today = startOfDay(new Date());
    return Math.max(1, Math.round((today.getTime() - eta.getTime()) / (24 * 60 * 60 * 1000)));
};

const mapIssueToTask = (issue: IssueTask): Task => {
    const visual = getCategoryVisual(issue.category_name || '');
    const status = getTaskStatus(issue);
    return {
        id: issue.id,
        title: issue.category_name || 'Issue',
        ward: issue.address ?? `${issue.lat}, ${issue.lng}`,
        assignedDate: formatAssignedDate(issue.created_at),
        etaDate: issue.eta_date ? formatAssignedDate(issue.eta_date) : null,
        etaDateRaw: issue.eta_date,
        completedAt: issue.resolved_at ? formatDateTime(issue.resolved_at) : null,
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
    const {
        getTasks,
        acceptTask,
        resolveTask,
        rejectTask,
        isFetchingTasks,
        isAcceptingTask,
        isResolvingTask,
        isRejectingTask,
    } = useIssue();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [acceptTaskId, setAcceptTaskId] = useState<string | null>(null);
    const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
    const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);
    const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<TaskFilter>('assigned');

    const loadTasks = useCallback(
        async (isRefresh = false) => {
            setError(null);
            if (isRefresh) {
                setIsRefreshing(true);
            }
            try {
                const issues = await getTasks();
                setTasks(issues.map(mapIssueToTask));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load tasks.');
            } finally {
                if (isRefresh) {
                    setIsRefreshing(false);
                }
            }
        },
        [getTasks],
    );

    useEffect(() => {
        loadTasks();
        // Only run once on mount; loadTasks is stable via useCallback deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        { subtitle: string; sectionTitle: string; sortOption: string; tasks: Task[] }
    > = {
        assigned: {
            subtitle: appString.tasksScreen.subtitleAssigned,
            sectionTitle: appString.tasksScreen.assignedTasksTitle,
            sortOption: appString.tasksScreen.sortOption,
            tasks: assignedTasks,
        },
        inProgress: {
            subtitle: appString.tasksScreen.subtitleInProgress,
            sectionTitle: appString.tasksScreen.inProgressTasksTitle,
            sortOption: appString.tasksScreen.sortOption,
            tasks: inProgressTasks,
        },
        completed: {
            subtitle: appString.tasksScreen.subtitleCompleted,
            sectionTitle: appString.tasksScreen.completedTasksTitle,
            sortOption: appString.tasksScreen.sortOptionCompletedDate,
            tasks: completedTasks,
        },
        overdue: {
            subtitle: appString.tasksScreen.subtitleOverdue,
            sectionTitle: appString.tasksScreen.overdueTasksTitle,
            sortOption: appString.tasksScreen.sortOptionDueDate,
            tasks: overdueTasks,
        },
    };
    const activeFilterCopy = FILTER_COPY[activeFilter];
    const previewTask = tasks.find(task => task.id === previewTaskId) ?? null;

    const setTaskStatus = (id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(task => (task.id === id ? { ...task, status } : task)));
    };

    const handleAcceptConfirm = async (etaDate: Date) => {
        if (!acceptTaskId) {
            return;
        }
        try {
            await acceptTask(acceptTaskId, toCalendarDateString(etaDate));
            setTasks(prev =>
                prev.map(task =>
                    task.id === acceptTaskId
                        ? {
                              ...task,
                              status: 'accepted',
                              etaDate: formatAssignedDate(etaDate.toISOString()),
                              etaDateRaw: etaDate.toISOString(),
                          }
                        : task,
                ),
            );
            setAcceptTaskId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept task.');
        }
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!rejectTaskId) {
            return;
        }
        try {
            await rejectTask(rejectTaskId, reason);
            setTaskStatus(rejectTaskId, 'rejected');
            setRejectTaskId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject task.');
        }
    };

    const handleCompleteConfirm = async (photo: PhotoFile, _comment: string) => {
        if (!completeTaskId) {
            return;
        }
        try {
            const resolved = await resolveTask(completeTaskId, photo);
            setTasks(prev =>
                prev.map(task =>
                    task.id === completeTaskId
                        ? {
                              ...task,
                              status: 'resolved',
                              photoUri: getMediaUrl(completeTaskId, 'after'),
                              completedAt: resolved.resolved_at
                                  ? formatDateTime(resolved.resolved_at)
                                  : formatDateTime(new Date().toISOString()),
                          }
                        : task,
                ),
            );
            setCompleteTaskId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete task.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadTasks(true)}
                        colors={[themeColors.primary]}
                        tintColor={themeColors.primary}
                    />
                }>
                <Hero>
                    <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                        <Icon name="bell" size={18} color={themeColors.navy} />
                    </TouchableOpacity>
                </Hero>

                <View style={styles.content}>
                    <Text style={styles.greeting}>{appString.tasksScreen.greeting}</Text>
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
                                    <View style={[styles.statIconCircle, { shadowColor: stat.color }]}>
                                        {stat.iconSet === 'fa5' ? (
                                            <FA5Icon name={stat.icon} size={15} color={stat.color} solid />
                                        ) : (
                                            <MCIcon name={stat.icon} size={17} color={stat.color} />
                                        )}
                                    </View>
                                    <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
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
                        <View style={styles.sortRow}>
                            <Text style={styles.sortLabel}>{appString.tasksScreen.sortByLabel}</Text>
                            <View style={styles.sortValueRow}>
                                <Text style={styles.sortValueText}>{activeFilterCopy.sortOption}</Text>
                                <Icon name="chevron-down" size={12} color={themeColors.subtitle} />
                            </View>
                        </View>
                    </View>

                    {isFetchingTasks && tasks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator color={themeColors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                activeOpacity={0.8}
                                onPress={() => loadTasks()}>
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
            </ScrollView>

            <AcceptTaskModal
                visible={acceptTaskId !== null}
                isSubmitting={isAcceptingTask}
                onClose={() => setAcceptTaskId(null)}
                onConfirm={handleAcceptConfirm}
            />
            <RejectTaskModal
                visible={rejectTaskId !== null}
                isSubmitting={isRejectingTask}
                onClose={() => setRejectTaskId(null)}
                onConfirm={handleRejectConfirm}
            />
            <CompleteTaskModal
                visible={completeTaskId !== null}
                isSubmitting={isResolvingTask}
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
