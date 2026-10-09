export const queryKeys = {
    me: ['auth', 'me'] as const,
    tasks: ['worker', 'tasks'] as const,
    workerPhoto: (workerId: string) => ['worker', 'photo', workerId] as const,
};
