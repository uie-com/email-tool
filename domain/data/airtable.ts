"use server";

import { compressText, decompressText } from "../parse/parse";
import { EditorState, EmailStates } from "../schema";
import { AT_EMAIL_BASE, AT_EMAIL_TABLE } from "../settings/save";
import { SESSION_BASE, SESSION_TABLE } from "../settings/schedule";
import { AirtableSessionRecord } from "./airtableSessions";

export async function fetchAirtableData(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
    });
}

export async function fetchRecords(base: string = SESSION_BASE, table: string = SESSION_TABLE, cache: boolean = true): Promise<AirtableSessionRecord[]> {
    let records: AirtableSessionRecord[] = [];
    let offset: string | undefined = '';

    while (offset !== undefined) {
        const response: Response = await fetch(`https://api.airtable.com/v0/${base}/${table}${offset ? '?offset=' + offset : ''}`, {
            headers: {
                Authorization: `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            },
            cache: 'force-cache',
            next: { revalidate: cache ? 60 * 60 : 10 }
        });
        const data = await response.json()
        if (data.records) {
            records = records.concat(data.records);
        }
        offset = data.offset ?? undefined;
    }
    return records;
}

export async function loadEmailStatesRemotely(): Promise<EmailStates> {

    const records = await fetchRecords(AT_EMAIL_BASE, AT_EMAIL_TABLE, false);

    const emails: EmailStates = {};
    records.forEach((record: any) => {
        if (!record.fields['Email ID'] || !record.fields['Data']) {
            console.error('Invalid email record', record);
            return;
        }
        const emailId = record.fields['Email ID'];
        const data = decompressText(record.fields['Data']);
        try {
            emails[record.id] = JSON.parse(data);
            emails[record.id].email = {
                ...emails[record.id].email,
                airtableId: record.id
            };
        } catch (e) {
            console.error('Error parsing email data', e);
        }
    });

    return emails;
}


export async function saveEmailStateRemotely(state: EditorState) {
    if (!state?.email) {
        throw new Error('No email state found');
    }
    if (!state.email.airtableId) {
        return await createEmailStateRecord(state);
    }

    const airtableEmail = {
        id: state.email?.airtableId,
        fields: {
            "Email ID": state.email?.id ?? '',
            "Data": compressText(JSON.stringify(state))
        }
    }

    const response = await fetch(`https://api.airtable.com/v0/${AT_EMAIL_BASE}/${AT_EMAIL_TABLE}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [airtableEmail] })
    });

    if (!response.ok) {
        console.error(`Couldn't update email: ${response.status} ${response.statusText} ${await response.text()}`);
        return state.email?.airtableId;
    }

    const data = await response.json();
    if (data.error || data.records.length === 0) {
        console.error(`Error updating email: ${data.error.message}`);
        return state.email?.airtableId;
    }

    return data.records[0].id;
}

async function createEmailStateRecord(state: EditorState) {
    const airtableEmail = {
        fields: {
            "Email ID": state.email?.id ?? '',
            "Data": compressText(JSON.stringify(state))
        }
    }

    const response = await fetch(`https://api.airtable.com/v0/${AT_EMAIL_BASE}/${AT_EMAIL_TABLE}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [airtableEmail] })
    });

    if (!response.ok) {
        console.error(`Couldn't create email: ${response.status} ${response.statusText} ${await response.text()}`);
        return undefined;
    }

    const data = await response.json();
    if (data.error || data.records.length === 0) {
        console.error(`Error creating email: ${data.error.message}`);
        return undefined;
    }

    return data.records[0].id;
}

export async function deleteEmailStateRecord(id: string) {
    const response = await fetch(`https://api.airtable.com/v0/${AT_EMAIL_BASE}/${AT_EMAIL_TABLE}?records[]=${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            'Content-Type': 'application/json'
        },
    });

    if (response.status === 404) {
        console.error(`Email record not found: ${id}`);
        return true;
    }

    if (!response.ok) {
        console.error(`Couldn't delete email: ${response.status} ${response.statusText} ${await response.text()}`);
        return false;
    }

    return true;
}