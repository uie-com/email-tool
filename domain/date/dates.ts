import dateParser from "any-date-parser";


export function getWorkingHourDiff(a: Date, b: Date): number {
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    let diff = 0;
    let current = new Date(a);

    while (current < b) {
        if (current.getHours() >= startHour && current.getHours() < endHour && current.getDay() !== 0 && current.getDay() !== 6) {
            diff++;
        }
        current.setHours(current.getHours() + 1);
    }

    return diff;
}

export function fuzzyParseDateToIsoString(date: string): string | null {
    const parsedDate = dateParser.attempt(date);
    if (parsedDate.invalid) {
        return null;
    }
    if (!parsedDate.year || !parsedDate.month || !parsedDate.day) {
        return null;
    }
    return parsedDate.year + '-' +
        String(parsedDate.month).padStart(2, '0') + '-' +
        String(parsedDate.day).padStart(2, '0') + 'T' +
        String(parsedDate.hour ?? 12).padStart(2, '0') + ':' +
        String(parsedDate.minute ?? 0).padStart(2, '0')
}