"use client";

import { getAllIdentifiers } from "@/domain/parse/parsePrograms";
import { getSettings } from "@/domain/parse/parseSettings";
import { TestSettingValue, Value } from "@/domain/schema";
import { SETTINGS } from "@/domain/settings/settings";
import { EMAIL_TYPES } from "@/domain/settings/emails";
import { Flex, Table, TableData, Textarea } from "@mantine/core";
import { useMemo, useState } from "react";
import { Values } from "@/domain/schema/variables";

export default function Page() {
    const [identifiers, setIdentifiers] = useState<string[]>(getAllIdentifiers(EMAIL_TYPES));
    const values = useMemo(() => {
        const values = new Values();
        values._addArray(identifiers, 'email');
        return values;
    }, [identifiers]);
    const settings = useMemo(() => {
        return getSettings(SETTINGS, values);
    }, [values]);
    console.log(settings.source('settings'));
    console.log(Object.keys(settings.source('settings').asDict()).map((key) => settings.source('settings').getAllValues(key)));

    const tableData: TableData = {
        head: ['Variable', ...Array.from({
            length: settings.maxParts()
        }, (_, i) => `Part ${i}`)],
        body: Object.keys(settings.source('settings').asDict()).map((key) => {
            return [
                key,
                ...(settings.source('settings').getAllValues(key)?.map((a: any[]) => a.join('\n')) ?? [])
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