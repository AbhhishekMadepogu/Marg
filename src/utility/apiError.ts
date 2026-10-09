export const extractErrorMessage = async (response: Response, fallback: string) => {
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
