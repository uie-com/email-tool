import moment from "moment-timezone";
import { Email } from "../schema";
import { SettingDict, Settings } from "../schema/settingsCollection";
import { Session } from "../data/sessions";
import { Values } from "../schema/valueCollection";
import { EMAILS_PER_SESSION } from "../../config/email-schedule";


/**
 * Recursively creates a dictionary of emails from the global schedule and session values.
 * @param schedule - The email schedule dictionary.
 * @param sessionValues - The session values dictionary.
 * @param ignoredEmails - An array of email types to ignore.
 * @returns A dictionary of emails with their identifiers and settings.
 */
export function createEmailsFromSession(session: Session, schedule: Settings<string> = EMAILS_PER_SESSION, ignoredEmails: string[] = []): { [emailType: string]: Email } {
    let emails: { [emailType: string]: Email } = {};
    const sessionValues = new Values();
    sessionValues.addDict(session, 'schedule');

    Object.keys(schedule).forEach((key) => {
        let [keyName, keyValue] = key.split(':');
        if (keyName.startsWith('Is'))
            keyValue = keyName;

        if (key === 'emails') {
            const foundEmails = schedule[key];

            if (foundEmails as SettingDict<string> === undefined) return;
            Object.keys(foundEmails).forEach((emailType) => {
                const emailValues = new Values(sessionValues.initialValues);
                emailValues.addDict(foundEmails[emailType] as SettingDict<string>, 'email');

                if (!emailValues.hasValueFor('Send Date'))
                    return ignoredEmails.push(emailType);

                emailValues.addValue('Email Type', {
                    value: emailType,
                    source: 'email',
                });

                emails[emailType] = new Email(emailValues);
            });

        } else if (sessionValues.hasValueForOf(keyName, keyValue) && schedule[key] as Settings<string> !== undefined) {
            const childSchedule = createEmailsFromSession(session, schedule[key] as Settings<string>, ignoredEmails);
            emails = { ...emails, ...childSchedule };
        }
    });

    let filteredEmails: { [emailType: string]: Email } = {};
    Object.keys(emails).forEach((key) => {
        if (!ignoredEmails.includes(key)) {
            filteredEmails[key] = emails[key];
        }
    });

    return filteredEmails;
}