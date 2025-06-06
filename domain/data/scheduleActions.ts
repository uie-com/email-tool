"use server";

import moment from "moment-timezone";
import { createEmailsFromSession } from "../parse/parseSchedule";
import { DAYS_IN_PAST, EMAILS_IN_PAGE, getSessionSchedule, Session } from "./sessions";
import { Email } from "../schema";

let emailCache: {
    email?: Email;
    session?: Session;
    emailType?: string;
}[] = [];

export async function getEmailSchedule(offset: number, queries: string[], refresh: boolean = false) {

    let sortedEmails = (emailCache.length > 0 && !refresh) ? emailCache : await getAllEmails(refresh);
    emailCache = sortedEmails;

    console.log('[SCHEDULE] ' + (emailCache.length > 0 && !refresh) ? 'Using ' + emailCache.length + ' cached emails' : 'Fetching emails from Airtable');

    const cutoffDate = moment().subtract(DAYS_IN_PAST, 'days').toDate();
    const cutoffIndex = sortedEmails.findIndex((email) => {
        const sendDate = email.email?.values?.resolveValue('Send Date', true);
        return sendDate ? moment(sendDate).isBefore(cutoffDate) : false;
    });
    const upcomingEmails = cutoffIndex !== -1 ? sortedEmails.slice(cutoffIndex) : sortedEmails;

    const filteredEmails = upcomingEmails.filter((email) => {
        if (queries.length === 0) return true;
        return queries.filter((query) => {
            return !(
                JSON.stringify(email).toLowerCase()?.includes(query.toLowerCase())
            );
        }).length === 0;
    });

    const paginatedEmails = filteredEmails.slice(offset, offset + EMAILS_IN_PAGE);
    const totalEmails = filteredEmails.length;

    return {
        emails: JSON.stringify(paginatedEmails),
        offset: offset,
        totalEmails: totalEmails,
    }
}

async function getAllEmails(refresh: boolean = false) {
    const sessions = await getSessionSchedule(refresh);
    const emails = sessions?.map((session) => {
        const emails = createEmailsFromSession(session);
        const filteredKeys = Object.keys(emails).filter((key) => {
            const email = emails[key];
            const sendDate = email.values?.resolveValue('Send Date', true);
            const daysAway = sendDate ? moment(sendDate).dayOfYear() - moment().dayOfYear() : null;
            if (daysAway !== null && daysAway < -1 * DAYS_IN_PAST) {
                return false;
            }
            return true;
        });
        return filteredKeys.map((key) => ({
            email: emails[key],
            emailType: key,
            session: session,
        } as { email?: Email, session?: Session, emailType?: string }))

    }).flat() ?? [];

    const sortedEmails = emails.sort((a, b) => {
        const aDate = a.email?.values?.resolveValue('Send Date', true);
        const bDate = b.email?.values?.resolveValue('Send Date', true);
        if (aDate && bDate) {
            return moment(aDate).diff(moment(bDate));
        }
        return 0;
    });

    return sortedEmails;
}

export async function getEmailFromSchedule(emailID?: string) {
    if (!emailID) return null;

    const emails = await getAllEmails(true);
    const matchingEmail = emails.find((email) => {
        const emailId = email.email?.values?.resolveValue('Email ID', true);
        return emailId === emailID;
    });

    return JSON.stringify(matchingEmail?.email);
}
