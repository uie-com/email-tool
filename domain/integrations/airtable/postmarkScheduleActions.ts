"use server";

import { AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE } from "@/config/save-settings";
import puppeteer from "puppeteer";
import { saveFileAction } from "../ftp/fileActions";
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

export async function getPostmarkScheduledEmail(uuid?: string): Promise<any> {

    if (!uuid) {
        console.error('Missing UUID to get email from schedule');
        return undefined;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'GET', `?filterByFormula=({UUID}='${uuid}')`);

    if (!response.ok) {
        console.error('Failed to fetch email from schedule', await response.text());
        return undefined;
    }

    const data = await response.json();
    return data.records && data.records.length > 0 ? data.records[0] : undefined;
}


export async function removeEmailFromPostmarkSchedule(id?: string): Promise<boolean> {

    if (!id) {
        console.error('Missing ID to remove email from schedule');
        return false;
    }

    const response = await airtableFetch(AT_SCHEDULE_BASE, AT_SCHEDULE_TABLE, 'DELETE', '/' + id);

    if (!response.ok) {
        console.error('Failed to remove email from schedule');
        return false;
    }

    return true;
}

export async function getScreenshotOfPostmarkScheduledEmail(id?: string): Promise<any> {

    await fetch('https://postmark.centercentre.com');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set screen size.
    await page.setViewport({ width: 850, height: 950, deviceScaleFactor: 2 });

    // Navigate the page to a URL.
    // https://airtable.com/app1KqzidZW6oePcC/shr0wUGrfFuf7mWn7/tblb7LRhKpSB1YGYH/viwHqcQZ0NdT2Oi8K/recxe4HCk2ytxn2Rh
    await page.goto('https://airtable.com/app1KqzidZW6oePcC/shr0wUGrfFuf7mWn7/tblb7LRhKpSB1YGYH/viwHqcQZ0NdT2Oi8K/' + id + '', {
        waitUntil: 'networkidle2',
    });

    const screenshot = await page.screenshot({
        path: 'screenshot.png',
        clip: {
            x: 50,
            y: 105,
            width: 750,
            height: 650,
        },
    });

    await browser.close();

    // Convert Node.js Buffer to ArrayBuffer for File constructor
    const arrayBuffer = screenshot instanceof Buffer ? screenshot.buffer.slice(screenshot.byteOffset, screenshot.byteOffset + screenshot.byteLength) : screenshot;
    const scFile = new File([arrayBuffer], 'scheduled-email-screenshot.png', { type: 'image/png' });

    const url = await saveFileAction(scFile);

    console.log(`Screenshot saved to: ${url}`);

    return url;
}