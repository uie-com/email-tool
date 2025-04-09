"use client";

import { Button, Flex, Loader, Table, TableData } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../page";
import moment from "moment-timezone";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";


export function ValueReview() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [values, setValues] = useState<Values | null>(editorState.email?.values ?? null);
    const [hasResolvedRemote, setHasResolvedRemote] = useState(false);

    if (!values) {
        return <></>;
    }
    const tableData: TableData = {
        head: ['Variable', 'Value'],
        body: values.keys.map((key) => {
            let displayValue, value = values.resolveValue(key);
            if (!value) return [key, undefined];
            if (key === 'id') return [];

            if (values.remoteType(key))
                displayValue = (<Loader color="black" type="dots" opacity={0.1} />);
            else if (typeof value === 'string' && (isValidHttpUrl(value) || value.startsWith('./')))
                displayValue = (<a href={value}>{value}</a>);
            else if (typeof value === 'string')
                displayValue = value;
            else if (value instanceof Date)
                displayValue = moment(value).format('dddd, MMMM Do YYYY [at] h:mm A z');
            else if (typeof value === 'object')
                displayValue = JSON.stringify(value);
            else
                displayValue = value;

            return [
                key,
                displayValue
            ]
        }),
    }

    useEffect(() => {
        const resolvePromises = async () => {
            await values.populateRemote();
            setValues(values);
            setHasResolvedRemote(true);
        }
        resolvePromises();
    }, []);

    const handleBack = () => {
        setEditorState({ ...editorState, step: 0 });
        console.log('Returning to state: ', { ...editorState, step: 0 });
    }

    const handleSubmit = async () => {
        setEditorState({ ...editorState, step: 2 });
        console.log('Approved values. Editor state: ', { ...editorState, step: 2 });
    }


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[36rem] border-1" gap={20}>
                <Table data={tableData} />
                <Flex className="w-full" align="center" justify="space-between" gap={10}>
                    <Button variant="light" color="gray" onClick={handleBack}>Back</Button>
                    <Button variant="filled" onClick={handleSubmit} disabled={!hasResolvedRemote}>Approve</Button>
                </Flex>
            </Flex>
        </Flex>);
}