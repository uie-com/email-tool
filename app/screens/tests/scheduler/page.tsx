"use client";

import { EMAILS_PER_SESSION } from "@/config/email-schedule";
import { createEmailsFromSession } from "@/domain/email/schedule/create-email-schedule";
import { getSessionSchedule, Session } from "@/domain/email/schedule/sessions";
import { Flex } from "@mantine/core";
import { useState } from "react";

export default function ProgramSchema() {

    const [results, setResults] = useState<any>(null);
    if (!results) {
        console.log('Fetching session schedule...');
        getSessionSchedule().then((data) => {
            setResults(data);
        });
    }
    const emails = results ? results.map((result: Session) => createEmailsFromSession(result, EMAILS_PER_SESSION)).flat() : '';


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <h1>Test the interpretation of airtable sessions into emails</h1>

            <div className="p-4 border-gray-200 rounded-lg min-w-96 border-1">
                <h2>Emails:</h2>
                <pre>{JSON.stringify(emails, null, 2)}</pre>
            </div>
        </Flex>
    );
}