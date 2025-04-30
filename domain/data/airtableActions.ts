"use server";

import { compressText, decompressText } from "../parse/parse";
import { EditorState, Saves } from "../schema";
import { AT_EMAIL_BASE, AT_EMAIL_TABLE } from "../settings/save";
import { SESSION_BASE, SESSION_TABLE } from "../settings/schedule";
import { AirtableSessionRecord } from "./sessions";

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
        const response = await airtableFetch(base, table, 'GET', offset ? '?offset=' + offset : '', undefined, cache);
        const data = await response.json()
        if (data.records) {
            records = records.concat(data.records);
        }
        console.log(`Fetched ${data.records.length} records from Airtable`);
        offset = data.offset ?? undefined;
    }
    return records;
}

async function airtableFetch(base: string, table: string, method: string, params?: string, body?: string, cache: boolean = true) {
    return await fetch(`https://api.airtable.com/v0/${base}/${table}${params}`, {
        method,
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        cache: cache ? 'force-cache' : undefined,
        next: { revalidate: cache ? 60 * 60 : 0 },
        body
    });
}

export async function isEmailReviewed(emailId: string): Promise<boolean> {
    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'GET', `?filterByFormula={Email ID}="${emailId}"`, undefined, false);


    if (!response.ok || response.status !== 200)
        return false;

    try {
        const data = await response.json();
        console.log('Response:', data.records[0].fields['Reviewed'] as string === 'true');

        if ((data.records[0].fields['Reviewed'] as string) === 'true')
            return true;
    }
    catch (error) {
        console.log('Error checking if record exists:', error);
    }

    return false;
}


/**
 * This function fetches all records from the email save Airtable.
 * @returns A promise resolving to the Airtable records data in an array.
 */
export async function loadAirtableSaves(): Promise<Saves> {
    const records = await fetchRecords(AT_EMAIL_BASE, AT_EMAIL_TABLE, false);

    const emails: Saves = [];
    records.forEach((record: any) => {
        if (!record.fields['Email ID'] || !record.fields['Data']) {
            console.error('Invalid email record', record);
            return;
        }
        try {
            const emailId = record.fields['Email ID'];
            const data = decompressText(record.fields['Data']);
            const parsedData = JSON.parse(data);

            emails.push({
                ...parsedData,
                email: {
                    ...parsedData.email,
                    airtableId: record.id,
                    name: emailId
                }
            });

        } catch (e) {
            console.error('Error parsing email data', e);
        }
    });

    return emails;
}

/**
 * This function saves the current state of the email to Airtable.
 * @param state The current editor state.
 * @returns A promise resolving to the Airtable ID of the saved email.
 */
export async function saveStateToAirtable(stateStr: string) {
    let state = JSON.parse(stateStr) as EditorState;
    if (!state?.email) throw new Error('No email state found');
    if (!state.email.airtableId) return await createNewSave(state);

    const airtableRecord = {
        id: state.email?.airtableId,
        fields: {
            "Email ID": state.email?.name ?? '',
            "Data": compressText(JSON.stringify(state))
        }
    }

    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'PATCH', '', JSON.stringify({ records: [airtableRecord] }), false);

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

/**
 * This function creates a new email save in Airtable.
 * @param state The current editor state.
 * @returns A promise resolving to the Airtable ID of the created email record.
 */
async function createNewSave(state: EditorState): Promise<string | undefined> {
    if (!state?.email) throw new Error('No email state found');
    if (!state.email.name) throw new Error('Email with no name sent');

    const existingId = await checkIfEmailExists(state.email.name);
    if (existingId) {
        state.email.airtableId = existingId;
        return await saveStateToAirtable(JSON.stringify(state));
    }

    const airtableRecord = {
        fields: {
            "Email ID": state.email?.name ?? '',
            "Data": compressText(JSON.stringify(state))
        }
    }

    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'POST', '', JSON.stringify({ records: [airtableRecord] }), false);

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

/**
 * This function checks if an email with the given name already exists in Airtable.
 * @param emailName The name of the email to check.
 * @returns A promise resolving to the Airtable ID of the existing email, or undefined if it doesn't exist.
 */
async function checkIfEmailExists(emailName?: string): Promise<string | undefined> {
    if (!emailName) return undefined;

    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'GET', `?filterByFormula={Email ID}="${emailName}"`, undefined, false);

    if (!response.ok || response.status !== 200)
        return undefined;

    try {
        const data = await response.json();
        if (data.records.length > 0) {
            return data.records[0].id;
        }
    }
    catch (error) {
        console.log('Error checking if record exists:', error);
    }

    return undefined;
}


/**
 * This function deletes an email state record from Airtable.
 * @param id The Airtable ID of the email record to delete.
 * @returns A promise resolving to true if the deletion was successful, false otherwise.
 */
export async function deleteEmailStateRecord(id: string) {
    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'DELETE', `?records[]=${id}`, undefined, false);

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