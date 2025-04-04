import moment, { Moment } from "moment-timezone";

/**
 * Generates contextual, time-based identifiers for emails based on the provided date.
 * @param date - The date to generate identifiers for.
 * @returns An array of global identifiers.
 */
export function getGlobalIdentifiers(date: Moment): string[] {
    const globalIdentifiers = [];

    if (date.isDST()) {
        globalIdentifiers.push('EDT');
    }

    const dayOfWeek = date.format('dddd');
    globalIdentifiers.push(dayOfWeek);

    const weekOfYear = date.format('w');
    const isOddWeek = parseInt(weekOfYear) % 2 === 1;
    globalIdentifiers.push(isOddWeek ? 'Odd Week' : 'Even Week');

    return [];
}