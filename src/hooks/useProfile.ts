import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utility/constants/queryKeys';
import { extractErrorMessage } from '../utility/apiError';
import { useAuth } from './useAuth';
import type { PhotoFile } from './useIssue';

const blobToDataUri = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read photo.'));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });

export function useWorkerPhotoQuery(workerId: string | undefined) {
    const { authorizedFetch } = useAuth();
    return useQuery({
        queryKey: queryKeys.workerPhoto(workerId ?? ''),
        queryFn: async (): Promise<string> => {
            const response = await authorizedFetch(`/worker/${workerId}/photo`);
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to load photo.'));
            }
            return blobToDataUri(await response.blob());
        },
        enabled: Boolean(workerId),
    });
}

export function useUploadWorkerPhotoMutation() {
    const { authorizedFetch, user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (photo: PhotoFile): Promise<Record<string, unknown>> => {
            const formData = new FormData();
            formData.append('photo', {
                uri: photo.uri,
                type: photo.type,
                name: photo.name,
            } as unknown as Blob);

            const response = await authorizedFetch('/worker/photo', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to upload photo.'));
            }
            return response.json();
        },
        onSuccess: (_data, photo) => {
            if (user?.id) {
                // Show the local file immediately rather than re-downloading what we just sent.
                queryClient.setQueryData(queryKeys.workerPhoto(user.id), photo.uri);
            }
        },
    });
}
