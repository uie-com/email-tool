"use client";

import { EMAIL_TYPES } from "@/config/email-types";
import { getAllIdentifiers } from "@/domain/email/identifiers/parsePrograms";
import { initializeSettings } from "@/domain/values/parseSettings";
import { Values } from "@/domain/values/valueCollection";
import { Flex, Table, TableData, Textarea } from "@mantine/core";
import { useMemo, useState } from "react";

export default function Page() {
    const [identifiers, setIdentifiers] = useState<string[]>([]);
    const values = useMemo(() => {
        const values = new Values();
        values._addArray(identifiers.length === 0 ? getAllIdentifiers(EMAIL_TYPES) : identifiers, 'email');
        return values;
    }, [identifiers]);

    const settings = useMemo(() => {
        return initializeSettings(values);
    }, [values]);

    console.log(settings.source('settings'));
    console.log(Object.keys(settings.source('settings').asDict()).map((key) => settings.source('settings').getAllValuesForTesting(key)));

    const tableData: TableData = {
        head: ['Variable', ...Array.from({
            length: settings.maxParts()
        }, (_, i) => `Part ${i}`)],
        body: Object.keys(settings.source('settings').asDict()).map((key) => {
            return [
                key,
                ...(settings.source('settings').getAllValuesForTesting(key)?.map((a: any[]) => a.join('\n')) ?? [])
            ]
        }),
    }



    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <Textarea onChange={(event) => {
                const value = event.currentTarget.value;
                const lines = value.split('\n').filter(line => line.trim() !== '');
                setIdentifiers(lines);
            }} name="search" placeholder="Separate with new lines" label="Email Ids" autosize />
            <h1>All variables & values:</h1>
            <Table data={tableData} />
        </Flex>
    );
}