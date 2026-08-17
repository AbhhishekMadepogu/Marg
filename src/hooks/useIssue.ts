import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export type PhotoFile = {
    uri: string;
    type: string;
    name: string;
};

export type RejectionReason = {
    type: string;
    reason: string;
};

export type IssueTask = {
    id: string;
    category_id: string;
    category_name: string;
    worker_id: string;
    worker_name: string;
    status: string;
    location_wkt: string;
    lat: number;
    lng: number;
    address: string | null;
    reporter_id: string;
    reporter_name: string | null;
    reporter_phone: string;
    org_id: string;
    priority: string;
    report_count: number;
    created_at: string;
    updated_at: string;
    rejection_reason: RejectionReason[];
    eta_date: string | null;
    accepted_at: string | null;
    resolved_at: string | null;
};

const extractErrorMessage = async (response: Response, fallback: string) => {
    try {
        const body = await response.json();
        if (typeof body?.detail === 'string') {
            return body.detail;
        }
        if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
            return body.detail[0].msg;
        }
    } catch {
        // Response had no JSON body.
    }
    return fallback;
};

export function useIssue() {
    const { authorizedFetch } = useAuth();
    const [isFetchingTasks, setIsFetchingTasks] = useState(false);
    const [isAcceptingTask, setIsAcceptingTask] = useState(false);
    const [isStartingTask, setIsStartingTask] = useState(false);
    const [isResolvingTask, setIsResolvingTask] = useState(false);
    const [isRejectingTask, setIsRejectingTask] = useState(false);

    const getTasks = useCallback(async (): Promise<IssueTask[]> => {
        setIsFetchingTasks(true);
        try {
            const response = await authorizedFetch('/worker/tasks');
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to load tasks.'));
            }
            return await response.json();
        } finally {
            setIsFetchingTasks(false);
        }
    }, [authorizedFetch]);

    const acceptTask = useCallback(async (issueId: string, etaDate: string): Promise<IssueTask> => {
        setIsAcceptingTask(true);
        try {
            const response = await authorizedFetch(`/worker/tasks/${issueId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eta_date: etaDate }),
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to accept task.'));
            }
            return await response.json();
        } finally {
            setIsAcceptingTask(false);
        }
    }, [authorizedFetch]);

    const startTask = useCallback(async (issueId: string): Promise<IssueTask> => {
        setIsStartingTask(true);
        try {
            const response = await authorizedFetch(`/worker/tasks/${issueId}/start`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to start task.'));
            }
            return await response.json();
        } finally {
            setIsStartingTask(false);
        }
    }, [authorizedFetch]);

    const resolveTask = useCallback(async (issueId: string, photo: PhotoFile): Promise<IssueTask> => {
        setIsResolvingTask(true);
        try {
            const formData = new FormData();
            formData.append('photo', {
                uri: photo.uri,
                type: photo.type,
                name: photo.name,
            } as unknown as Blob);

            const response = await authorizedFetch(`/worker/tasks/${issueId}/resolve`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to complete task.'));
            }
            return await response.json();
        } finally {
            setIsResolvingTask(false);
        }
    }, [authorizedFetch]);

    const rejectTask = useCallback(async (issueId: string, reason: string): Promise<IssueTask> => {
        setIsRejectingTask(true);
        try {
            const response = await authorizedFetch(`/worker/tasks/${issueId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to reject task.'));
            }
            return await response.json();
        } finally {
            setIsRejectingTask(false);
        }
    }, [authorizedFetch]);

    return {
        isFetchingTasks,
        isAcceptingTask,
        isStartingTask,
        isResolvingTask,
        isRejectingTask,
        getTasks,
        acceptTask,
        startTask,
        resolveTask,
        rejectTask,
    };
}
