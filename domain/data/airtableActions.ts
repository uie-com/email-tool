"use server";

import { revalidateTag } from "next/cache";
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

export async function airtableFetch(base: string, table: string, method: string, params?: string, body?: string, cache: boolean = true) {
    if (!cache)
        revalidateTag('airtable');

    return await fetch(`https://api.airtable.com/v0/${base}/${table}${params}`, {
        method,
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        cache: 'force-cache',
        next: { revalidate: 60 * 60 * 60, tags: ['airtable'] },
        body
    });
}



