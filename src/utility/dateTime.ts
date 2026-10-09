const IST_TIME_ZONE = 'Asia/Kolkata';

// A datetime string with a time component but no "Z"/offset (e.g. what
// Python's `datetime.utcnow()` serializes to) is parsed by JS as the
// device's *local* time, not UTC - silently shifting the instant by the
// device's UTC offset. Force it back to UTC before parsing.
const NAIVE_DATETIME = /T\d{2}:\d{2}(?!.*(?:Z|[+-]\d{2}:?\d{2})$)/;

const toDate = (value: string | Date): Date => {
    if (value instanceof Date) {
        return value;
    }
    const normalized = NAIVE_DATETIME.test(value) ? `${value}Z` : value;
    return new Date(normalized);
};

// The backend returns timestamps in UTC; the UI always displays them in IST
// regardless of the device's own timezone.
export const formatDateIST = (value: string | Date): string => {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleDateString('en-IN', {
        timeZone: IST_TIME_ZONE,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTimeIST = (value: string | Date): string => {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const datePart = formatDateIST(date);
    const timePart = date.toLocaleTimeString('en-IN', {
        timeZone: IST_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
};

// "YYYY-MM-DD" for the given instant's IST calendar day. Use this instead of
// Date getters (getFullYear/getMonth/getDate) when comparing calendar days -
// those read the device's own timezone, which drifts from IST on a
// non-IST device and can shift a same-day comparison by a day.
export const toISTDateOnly = (value: string | Date): string => {
    const date = toDate(value);
    return date.toLocaleDateString('en-CA', { timeZone: IST_TIME_ZONE });
};
