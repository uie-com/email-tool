import moment from "moment-timezone";
import { Email } from "../schema";
import { SettingDict, Settings } from "../schema/settingsCollection";
import { Session } from "../data/airtableSessions";
import { Values } from "../schema/valueCollection";
import { EMAIL_SCHEDULE } from "../settings/schedule";


/**
 * Recursively creates a dictionary of emails from the global schedule and session values.
 * @param schedule - The email schedule dictionary.
 * @param sessionValues - The session values dictionary.
 * @returns A dictionary of emails with their identifiers and settings.
 */
export function createEmailsFromSession(session: Session, schedule: Settings<string> = EMAIL_SCHEDULE): { [emailType: string]: Email } {
    let emails: { [emailType: string]: Email } = {};
    const sessionValues = new Values();
    sessionValues.addDict(session, 'email');

    Object.keys(schedule).forEach((key) => {
        if (key === 'emails') {
            const foundEmails = schedule[key];
            if (foundEmails as SettingDict<string> === undefined) return;
            Object.keys(foundEmails).forEach((emailType) => {
                const emailValues = new Values(sessionValues.initialValues);
                emailValues.addDict(foundEmails[emailType] as SettingDict<string>, 'email');

                emailValues.addValue('Email Type', {
                    value: emailType,
                    source: 'email',
                });

                emails[emailType] = new Email(emailValues);
            });

        } else if (sessionValues.hasValueOf(key) && schedule[key] as Settings<string> !== undefined) {
            const childSchedule = createEmailsFromSession(session, schedule[key] as Settings<string>);
            emails = { ...emails, ...childSchedule };
        }
    });

    return emails;
}