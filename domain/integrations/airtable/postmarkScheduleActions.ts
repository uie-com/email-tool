"use server";

import { AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE } from "@/config/save-settings";
import { Email } from "@/domain/schema";
import { Values } from "@/domain/values/valueCollection";
import { airtableFetch } from "./airtableActions";


export async function addEmailToPostmarkSchedule(email: Email): Promise<boolean> {

    const values = new Values(email.values?.initialValues);

    const uuid = values.resolveValue('UUID');
    const emailId = values.resolveValue('Email ID');
    const subject = values.resolveValue('Subject');
    const automationId = values.resolveValue('Automation ID');
    const sendDate = new Date(values.resolveValue('Send Date')).toISOString();
    const templateId = email.templateId;

    if (!emailId || !subject || !automationId || !sendDate || !templateId || !uuid) {
        console.error('Missing required values to add email to schedule');
        return false;
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
                        "Schedule Date": sendDate,
                    }
                }
            ],
            "typecast": true
        }
    ));

    if (!response.ok) {
        console.error('Failed to add email to schedule');
        return false;
    }

    const data = await response.json();
    return data.records && data.records.length > 0 && data.records[0].id ? true : false;
}

export async function testPostmarkScheduleEmail(email: Email): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus(email, 'Needs Testing');
}

export async function markPostmarkScheduleEmailReady(email: Email): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus(email, 'Ready to Send');
}

export async function markPostmarkScheduleEmailReviewing(email: Email): Promise<boolean> {
    return await setPostmarkScheduleEmailStatus(email, 'Under QA Review');
}


export async function setPostmarkScheduleEmailStatus(email: Email, status: string): Promise<boolean> {
    const values = new Values(email.values?.initialValues);
    const uuid = values.resolveValue('UUID');

    if (!uuid) {
        console.error('Missing UUID to set email status in schedule');
        return false;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'GET', `filterByFormula=({UUID}="${uuid}")`);
    if (!response.ok) {
        console.error('Failed to fetch email from schedule');
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


export async function removeEmailFromPostmarkSchedule(email: Email): Promise<boolean> {
    const uuid = email.values?.resolveValue('UUID');

    if (!uuid) {
        console.error('Missing UUID to remove email from schedule');
        return false;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'DELETE', uuid);

    if (!response.ok) {
        console.error('Failed to remove email from schedule');
        return false;
    }

    return true;
}   