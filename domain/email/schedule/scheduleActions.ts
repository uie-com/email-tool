"use server";

import console from "console";
import fs from "fs/promises";
import moment from "moment-timezone";
import path from "path";
import { Email } from "../../schema";
import { createEmailsFromSession } from "./create-email-schedule";
import { DAYS_IN_PAST, EMAILS_IN_PAGE, getSessionSchedule, Session } from "./sessions";


export async function getEmailSchedule(offset: number, queries: string[], refresh: boolean = false) {

    console.log('[SCHEDULE] Fetching emails with offset:', offset, 'queries:', queries, 'refresh:', refresh);

    let sortedEmails = await getAllEmails(refresh);


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

async function getAllEmails(refresh: boolean = false, abbreviated: boolean = true) {
    console.log('[SCHEDULE] getAllEmails called with refresh:', refresh, 'abbreviated:', abbreviated);

    let existingEmails = refresh ? null : await readCache('emails') as { email?: Email, session?: Session, emailType?: string }[] | null;
    if (existingEmails) existingEmails = existingEmails.map(email => ({ ...email, email: email.email ? new Email(email.email.values, email.email) : undefined }));
    console.log('[SCHEDULE] existingEmails:', existingEmails ? existingEmails.length + ' emails' : 'none');
    if (existingEmails && !abbreviated) return existingEmails;

    const existingSessions = refresh ? null : await readCache('sessions') as Session[] | null;
    console.log('[SCHEDULE] existingSessions:', existingSessions ? existingSessions.length + ' sessions' : 'none');
    let sessions = (!abbreviated && existingSessions) ? existingSessions : await getSessionSchedule(refresh, abbreviated);

    const emails = sessions?.map((session) => {
        const emails = createEmailsFromSession(session);
        const filteredKeys = Object.keys(emails).filter((key) => {
            const email = emails[key];
            const sendDate = email.values?.resolveValue('Send Date', true);
            const cutoffDate = moment().subtract(DAYS_IN_PAST, 'days').toDate();

            if (!sendDate) return false;
            if (moment(sendDate).isBefore(cutoffDate)) return false;

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

    if (abbreviated && (refresh || !existingSessions || !existingEmails))
        getSessionSchedule(false, false).then(async (s) => {
            await writeCache('sessions', s);
            console.log('[SCHEDULE] Preloaded full session data in the background', s?.length, 'sessions');


            const emails = await getAllEmails(true, false)
            await writeCache('emails', emails);
            console.log('[SCHEDULE] Preloaded full email data in the background', emails.length);
        }); // Preload full emails in the background

    return sortedEmails;
}

export async function getEmailFromSchedule(emailID?: string, refresh: boolean = false) {
    if (!emailID) return null;

    const emails = await getAllEmails(refresh, false);
    const matchingEmail = emails.find((email) => {
        const emailId = email.email?.values?.resolveValue('Email ID', true);
        return emailId === emailID;
    });

    return JSON.stringify(matchingEmail?.email);
}


/**
 * Read sessions from the local file cache (if it exists).
 */
async function readCache(cache: string): Promise<any | null> {
    try {
        const data = await fs.readFile(path.join(process.cwd(), "." + cache + ".json"), "utf-8");
        return JSON.parse(data);
    } catch {
        return null; // No cache file or failed read
    }
}

/**
 * Write sessions to the local file cache.
 */
async function writeCache(cache: string, data: any): Promise<void> {
    try {
        await fs.writeFile(path.join(process.cwd(), "." + cache + ".json"), JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
        console.error("[SCHEDULE] Failed to write session cache:", err);
    }
}
