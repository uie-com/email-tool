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