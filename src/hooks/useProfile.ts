import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import type { PhotoFile } from './useIssue';

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

export function useProfile() {
    const { authorizedFetch } = useAuth();
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isFetchingPhoto, setIsFetchingPhoto] = useState(false);

    const getWorkerPhoto = useCallback(async (workerId: string): Promise<string> => {
        setIsFetchingPhoto(true);
        try {
            const response = await authorizedFetch(`/worker/${workerId}/photo`);
            if (!response.ok) {
                throw new Error(await extractErrorMessage(response, 'Failed to load photo.'));
            }
            const blob = await response.blob();
            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('Failed to read photo.'));
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } finally {
            setIsFetchingPhoto(false);
        }
    }, [authorizedFetch]);

    const uploadWorkerPhoto = useCallback(async (photo: PhotoFile): Promise<Record<string, unknown>> => {
        setIsUploadingPhoto(true);
        try {
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
            return await response.json();
        } finally {
            setIsUploadingPhoto(false);
        }
    }, [authorizedFetch]);

    return {
        isUploadingPhoto,
        isFetchingPhoto,
        uploadWorkerPhoto,
        getWorkerPhoto,
    };
}
