"use client";

import { getAllIdentifiers } from "@/domain/parse/parsePrograms";
import { testSettings } from "@/domain/parse/parseSettings";
import { SettingValue, TestSettingValue } from "@/domain/schema";
import { PROGRAM_VALUES } from "@/domain/settings/emails";
import { PROGRAM_SCHEMA } from "@/domain/settings/programs";
import { Flex, Table, TableData, Textarea } from "@mantine/core";
import { useState } from "react";

export default function Page() {
    const [identifiers, setIdentifiers] = useState<string[]>(getAllIdentifiers(PROGRAM_SCHEMA));
    const settings = testSettings(PROGRAM_VALUES, identifiers.length > 0 ? identifiers : undefined);

    const tableData: TableData = {
        head: ['Variable', ...Array.from({
            length: (
                parseInt(Object.keys(settings).reduce<string>((acc, key) =>
                    Math.max(parseInt(acc), settings[key].length) + '', '0'
                ))
            )
        }, (_, i) => `Part ${i}`)],
        body: Object.keys(settings).map((key) => {
            return [
                key,
                ...(typeof settings[key] === 'string' ? [settings[key]] : settings[key].map((setting: TestSettingValue) => {
                    return typeof setting.value === 'string' ? setting.value : setting.value.join('\n')
                }))
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