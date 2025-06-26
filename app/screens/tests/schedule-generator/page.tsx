"use client";

import { createEmailsFromSession } from "@/domain/email/schedule/create-email-schedule";
import { Session } from "@/domain/email/schedule/sessions";
import { Flex, Textarea } from "@mantine/core";
import { useState } from "react";

export default function ProgramSchema() {
    const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
    const form = createEmailsFromSession(attributes as Session);

    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <h1>Test the session schedule to email schedule.</h1>
            <Textarea onChange={(event) => {
                const value = event.currentTarget.value;
                const lines = value.split('\n');
                const newAttributes = lines.reduce<{ [key: string]: string }>((acc, line) => {
                    if (!line || !line.includes(':')) return acc;
                    const [key, value] = line.split(':');
                    acc[key] = value;
                    return acc;
                }, {});
                setAttributes(newAttributes);
            }} placeholder="Enter attributes here" autosize />
            <div className="p-4 border-gray-200 rounded-lg min-w-96 border-1">
                <h2>Parsed Schedule:</h2>
                <pre>{JSON.stringify(form, null, 2)}</pre>
            </div>
        </Flex>
    );
}