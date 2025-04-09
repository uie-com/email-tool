"use client";

import { createProgramForm } from "@/domain/parse/parsePrograms";
import { SETTINGS } from "@/domain/settings/settings";
import { EMAIL_TYPES } from "@/domain/settings/emails";
import { Flex, Textarea } from "@mantine/core";
import { useState } from "react";
import { initializeSettings } from "@/domain/parse/parseSettings";

export default function ProgramSchema() {
    const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
    const form = createProgramForm(EMAIL_TYPES, attributes);

    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <h1>Test the dynamic email starter-form.</h1>
            <small>Uses 'PROGRAM_SCHEMA' object and 'createProgramForm' interpreter</small>
            <small>NAME:VALUE ex: Program:TUXS</small>
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
            <h2>Values:</h2>
            {JSON.stringify(attributes)}
            <h2>Form:</h2>
            {JSON.stringify(form, null, ' ')}
            <h2>Settings:</h2>
            {JSON.stringify(initializeSettings(SETTINGS, attributes), null, ' ')}
        </Flex>
    );
}