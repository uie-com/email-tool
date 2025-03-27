import { createProgramForm } from "@/domain/parse/parsePrograms";
import { PROGRAM_SCHEMA } from "@/domain/settings/programs";
import { Flex, Textarea } from "@mantine/core";
import { useState } from "react";

export function ProgramSchemaTester() {
    const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
    const form = createProgramForm(PROGRAM_SCHEMA, attributes);

    return (
        <Flex align="center" justify="center" direction='column' className="h-full w-full" gap={20} style={{ position: 'relative' }}>
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
        </Flex>
    );
}