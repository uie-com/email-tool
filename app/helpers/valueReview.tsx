"use client";

import { Button, Flex, Table, TableData } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../page";
import { SettingValue } from "@/domain/settings/settings";
import { ValueDict } from "@/domain/schema";
import { fillTextVariables } from "@/domain/parse/parseVariables";
import moment from "moment-timezone";


export function ValueReview() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [settings, setSettings] = useState(editorState.email?.settings);

    if (!settings) {
        return <></>;
    }

    const hasPromises = Object.keys(settings).some((key) => {
        return settings[key].value instanceof Promise;
    });

    const tableData: TableData = {
        head: ['Variable', 'Value'],
        body: Object.keys(settings).map((key) => {
            let displayValue;
            if (!settings[key].value) return [key, undefined];
            if (key === 'id') return [];

            if (settings[key].value instanceof Promise)
                displayValue = 'Loading...';
            else if (typeof settings[key].value === 'string')
                displayValue = fillTextVariables(settings[key].value + '', settings, [key]);
            else if (settings[key].value instanceof Date)
                displayValue = moment(settings[key].value).format('dddd, MMMM Do YYYY [at] h:mm A z');
            else if (typeof settings[key].value === 'object')
                displayValue = JSON.stringify(settings[key].value);
            else
                displayValue = settings[key].value;

            return [
                key,
                displayValue
            ]
        }),
    }

    useEffect(() => {
        const resolvePromises = async (settings: ValueDict) => {
            if (hasPromises) {
                const newSettings = { ...settings };
                await Promise.all(Object.keys(newSettings).map(async (key) => {
                    if (newSettings[key].value instanceof Promise) {
                        newSettings[key].value = await newSettings[key].value;
                    }
                }));
                setSettings(newSettings);
            }
        }
        resolvePromises(settings);
    }, [settings]);

    const handleBack = () => {
        setEditorState({ ...editorState, step: 0 });
        console.log('Returning to state: ', { ...editorState, step: 0 });
    }

    const handleSubmit = async () => {
        setEditorState({ ...editorState, step: 2, email: { ...editorState.email, settings: settings } });
        console.log('Approved values. Editor state: ', { ...editorState, step: 2, email: { ...editorState.email, settings: settings } });
    }


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[36rem] border-1" gap={20}>
                <Table data={tableData} />
                <Flex className="w-full" align="center" justify="space-between" gap={10}>
                    <Button variant="light" color="gray" onClick={handleBack}>Back</Button>
                    <Button variant="filled" onClick={handleSubmit} disabled={hasPromises}>Approve</Button>
                </Flex>
            </Flex>
        </Flex>);
}