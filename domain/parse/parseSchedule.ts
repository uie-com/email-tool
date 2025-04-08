import moment from "moment-timezone";
import { Email } from "../schema";
import { getGlobalIdentifiers } from "../settings/globalIdentifiers";


/**
 * Recursively creates a dictionary of emails from the global schedule and session values.
 * @param schedule - The email schedule dictionary.
 * @param sessionValues - The session values dictionary.
 * @returns A dictionary of emails with their identifiers and settings.
 */
export function createEmailsFromSession(schedule: EmailScheduleDict, sessionValues: { [key: string]: string | Date }): { [emailType: string]: Email } {
    let emailDict: { [emailType: string]: Email } = {};
    const sessionIdentifiers = Object.keys(sessionValues).map((key) => `${sessionValues[key]}`);
    const globalIdentifiers = getGlobalIdentifiers(moment(sessionValues["Session Date"]));
    const identifiers = [...sessionIdentifiers, ...globalIdentifiers];


    Object.keys(schedule).forEach((key) => {
        if (key === 'emails') {
            const foundEmails = schedule[key];
            if (foundEmails as { [emailType: string]: { [key: string]: string } } === undefined) return;
            Object.keys(foundEmails).forEach((emailType) => {
                const foundEmail = foundEmails[emailType];

                emailDict[emailType] = {
                    identifiers: [...identifiers, emailType],
                    settings: { ...createValueDictFromDict(sessionValues), ...createValueDictFromDict(foundEmail), "Email Type": { value: emailType } },
                }
            });

        } else if (identifiers.includes(key) && schedule[key] as EmailScheduleDict !== undefined) {
            const childSchedule = createEmailsFromSession(schedule[key] as EmailScheduleDict, sessionValues);
            emailDict = { ...emailDict, ...childSchedule };
        }
    });

    return emailDict;
}