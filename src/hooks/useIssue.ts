import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utility/constants/queryKeys';
import { extractErrorMessage } from '../utility/apiError';
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
    assigned_at: string | null;
    rejection_reason: RejectionReason[];
    eta_date: string | null;
    accepted_at: string | null;
    resolved_at: string | null;
};

export function useTasksQuery() {
    const { authorizedFetch, accessToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.tasks,
        queryFn: async (): Promise<IssueTask[]> => {
            const response = await authorizedFetch('/worker/tasks');
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to load tasks.'));
            }
            return response.json();
        },
        enabled: Boolean(accessToken),
    });
}

// Shared by every task action: swap the updated task into the cached list right
// away, then refetch in the background so the list matches the server.
function useTaskMutation<TVariables>(
    request: (variables: TVariables) => Promise<Response>,
    fallbackError: string,
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (variables: TVariables): Promise<IssueTask> => {
            const response = await request(variables);
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, fallbackError));
            }
            return response.json();
        },
        onSuccess: updated => {
            queryClient.setQueryData<IssueTask[]>(queryKeys.tasks, prev =>
                prev?.map(task => (task.id === updated.id ? updated : task)),
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        },
    });
}

export function useAcceptTaskMutation() {
    const { authorizedFetch } = useAuth();
    return useTaskMutation(
        ({ issueId, etaDate }: { issueId: string; etaDate: string }) =>
            authorizedFetch(`/worker/tasks/${issueId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eta_date: etaDate }),
            }),
        'Failed to accept task.',
    );
}

export function useStartTaskMutation() {
    const { authorizedFetch } = useAuth();
    return useTaskMutation(
        (issueId: string) => authorizedFetch(`/worker/tasks/${issueId}/start`, { method: 'POST' }),
        'Failed to start task.',
    );
}

export function useResolveTaskMutation() {
    const { authorizedFetch } = useAuth();
    return useTaskMutation(
        ({ issueId, photo }: { issueId: string; photo: PhotoFile }) => {
            const formData = new FormData();
            formData.append('photo', {
                uri: photo.uri,
                type: photo.type,
                name: photo.name,
            } as unknown as Blob);
            return authorizedFetch(`/worker/tasks/${issueId}/resolve`, {
                method: 'POST',
                body: formData,
            });
        },
        'Failed to complete task.',
    );
}

export function useRejectTaskMutation() {
    const { authorizedFetch } = useAuth();
    return useTaskMutation(
        ({ issueId, reason }: { issueId: string; reason: string }) =>
            authorizedFetch(`/worker/tasks/${issueId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            }),
        'Failed to reject task.',
    );
}
