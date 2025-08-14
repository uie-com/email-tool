"use server";

import { AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE } from "@/config/save-settings";
import { airtableFetch } from "./airtableActions";


export async function addEmailToPostmarkSchedule(uuid: string, emailId: string, subject: string, automationId: string, sendDate: Date, templateId: string, tag: string): Promise<string | undefined> {

    if (!emailId || !subject || !automationId || !sendDate || !templateId || !uuid) {
        console.error('Missing required values to add email to schedule');
        return undefined;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'POST', undefined, JSON.stringify(
        {
            records: [
                {
                    fields: {
                        "UUID": uuid,
                        "Email ID": emailId,
                        "Subject": subject,
                        "Template ID": templateId,
                        "Automation ID": automationId,
                        "Schedule Date": sendDate.toISOString(),
                        "Email Tag": tag,
                        "Status": "Needs Testing",
                    }
                }
            ],
            "typecast": true
        }
    ));

    if (!response.ok) {
        console.error('Failed to add email to schedule', await response.text());
        return undefined;
    }

    const data = await response.json();
    return data.records && data.records.length > 0 ? data.records[0].id : undefined;
}

export async function testPostmarkScheduleEmail(uuid?: string): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus('Needs Testing', uuid);
}

export async function markPostmarkScheduleEmailReady(uuid?: string): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus('Ready to Send', uuid);
}

export async function markPostmarkScheduleEmailReviewing(uuid?: string): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus('Under QA Review', uuid);
}


export async function setPostmarkScheduleEmailStatus(status: string, uuid?: string): Promise<boolean> {

    if (!uuid) {
        console.error('Missing UUID to set email status in schedule');
        return false;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'GET', `?filterByFormula=({UUID}='${uuid}')`);

    if (!response.ok) {
        console.error('Failed to fetch email from schedule', await response.text());
        return false;
    }

    const data = await response.json();
    if (!data.records || data.records.length === 0) {
        console.error('No email found in schedule with UUID:', uuid);
        return false;
    }

    const recordId = data.records[0].id;

    const updateResponse = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'PATCH', undefined, JSON.stringify(
        {
            records: [
                {
                    id: recordId,
                    fields: {
                        "Status": status,
                    }
                }
            ],
            "typecast": true
        }
    ));

    if (!updateResponse.ok) {
        console.error('Failed to update email status in schedule');
        return false;
    }

    const updateData = await updateResponse.json();
    return updateData.records && updateData.records.length > 0 && updateData.records[0].id === recordId ? true : false;
}


export async function removeEmailFromPostmarkSchedule(id?: string): Promise<boolean> {

    if (!id) {
        console.error('Missing UUID to remove email from schedule');
        return false;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'DELETE', '/' + id);

    if (!response.ok) {
        console.error('Failed to remove email from schedule');
        return false;
    }

    return true;
}   