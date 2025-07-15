"use server"

import { compressText, decompressText } from "@/domain/values/compression";
import { normalizeName } from "@/domain/variables/normalize";
import { AT_EMAIL_BASE, AT_EMAIL_TABLE } from "../../../config/save-settings";
import { EditorState, Saves } from "../../schema";
import { Values } from "../../values/valueCollection";
import { airtableFetch, fetchRecords } from "./airtableActions";

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

            const minimalKeys = ['Email ID', 'Email Name', 'Program', 'Send Date', 'Send Type', 'Automation ID', 'Cohort', 'Email Type', 'Session Date', 'Collab Notes Link', 'Uses Collab Notes', 'Collab PDF Link', 'Is Variation', 'Variation Variable', 'Variation Values'];
            const shortValues = minimalKeys.map((key: string) => {
                return { initialValues: [{ value: (new Values(parsedData.email?.values.initialValues)?.resolveValue(key, true) ?? ''), source: 'email' }], name: key, key: normalizeName(key) };
            });


            emails.push({
                ...parsedData,
                email: {
                    ...parsedData.email,
                    airtableId: record.id,
                    name: emailId,
                    values: { initialValues: shortValues } as Values,
                    HTML: '',
                    templateHTML: '',
                    isShortened: true,
                }
            });

        } catch (e) {
            console.error('Error parsing email data', e);
        }
    });

    return emails;
}

/**
 * This function fetches a specific email save from Airtable using its ID.
 * @param id The ID of the email to fetch.
 * @returns A promise resolving to the email data.
 */
export async function loadAirtableSave(id: string): Promise<EditorState | undefined> {
    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'GET', `?filterByFormula={Email ID}="${id}"`, undefined, false);

    if (!response.ok || response.status !== 200)
        return undefined;

    const data = await response.json();
    if (data.records.length === 0) {
        console.error('No email found with the given ID');
        return undefined;
    }

    const record = data.records[0];
    if (!record.fields['Email ID'] || !record.fields['Data']) {
        console.error('Invalid email record', record);
        return undefined;
    }

    const emailId = record.fields['Email ID'];
    const dataStr = decompressText(record.fields['Data']);
    const parsedData = JSON.parse(dataStr);

    return {
        ...parsedData,
        email: {
            ...parsedData.email,
            airtableId: record.id,
            name: emailId
        }
    };
}

/**
 * This function saves the current state of the email to Airtable.
 * @param state The current editor state.
 * @returns A promise resolving to the Airtable ID of the saved email.
 */
export async function saveStateToAirtable(stateStr: string) {
    let state = JSON.parse(stateStr) as EditorState;
    if (!state?.email) throw new Error('No email state found');
    if (state?.email?.isShortened) throw new Error('Cannot save shortened email state.');
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
    if (state?.email?.isShortened) throw new Error('Cannot save shortened email state.');

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
 * This function checks if an email has been reviewed in Airtable.
 * @param emailId The ID of the email to check.
 * @returns A promise resolving to true if the email has been reviewed, false otherwise.
 */
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

export async function listReviewedEmails(): Promise<string[]> {
    // Limit to the most recent 100 reviewed emails
    const formula = '?filterByFormula={Reviewed}="true"&fields[]=Email ID&sort[0][field]=Last Modified&sort[0][direction]=desc&maxRecords=100';
    const response = await airtableFetch(AT_EMAIL_BASE, AT_EMAIL_TABLE, 'GET', formula, undefined, false);


    if (!response.ok || response.status !== 200) {
        console.log('Error checking if record exists:', await response.text());
        return [];
    }

    try {
        const data = await response.json();
        console.log('[REVIEW-POLL] Found ' + data.records.length + ' reviewed emails.');

        return data.records.map((record: any) => record.fields['Email ID']);
    }
    catch (error) {
        console.log('Error checking if record exists:', error);
    }
    return [];
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