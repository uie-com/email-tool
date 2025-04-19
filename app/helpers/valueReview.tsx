"use client";

import { Anchor, Button, Flex, Loader, ScrollArea, Table, TableData } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/domain/schema";
import moment from "moment-timezone";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variable } from "@/domain/schema/variableCollection";
import { VariableInput } from "./components/form";
import { PRE_APPROVED_VALUES } from "@/domain/settings/settings";
import { EMAIL_EDIT_VALUES, EmailEditCard } from "./components/email";
import { EditorState } from "@/domain/schema";


export function ValueReview() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const values = editorState.email?.values;
    const [hasResolvedRemote, setHasResolvedRemote] = useState(false);

    if (!values) {
        return <></>;
    }
    const tableData: TableData = {
        head: ['Variable', 'Value'],
        body: values.names.map((name, i) => {
            let displayValue, value = values.resolveValue(name, true, true);
            if (name === 'id') return [];
            if (values.isHidden(name) || PRE_APPROVED_VALUES.includes(name) || EMAIL_EDIT_VALUES.includes(name))
                return [];


            const setValue = (value: any) => {
                values.setValue(name, { value: value, source: 'user' });
                setEditorState({ ...editorState, email: { ...editorState.email, values: new Values(values.initialValues) } });
            }

            if (values.isFetching(name))
                displayValue = (<Loader color="black" type="dots" opacity={0.1} />);
            else
                displayValue = (<VariableInput variableName={name} value={value} index={i} setValue={setValue} variant="unstyled" />)

            return [
                name,
                displayValue
            ]
        }),
    }

    useEffect(() => {
        const resolvePromises = async () => {
            await values.populateRemote();
            setEditorState((prev) => ({ ...prev, email: { ...prev.email, values: values } }));
            setHasResolvedRemote(true);
        }
        resolvePromises();
    }, []);

    const handleBack = () => {
        setEditorState({ ...editorState, step: 0 });
        console.log('Returning to state: ', { ...editorState, step: 0 });
    }

    const handleSubmit = async () => {
        console.log('Submitting values: ', values);
        await values.populateRemote();
        setEditorState({ ...editorState, step: 2, email: { ...editorState.email, values: values } });
        console.log('Approved values. Editor state: ', { ...editorState, step: 2 });
    }

    return (
        <Flex align="center" justify="center" direction='column' className=" w-full h-full" gap={20}>
            <ScrollArea type="always" className="p-20" >
                <Flex align="center" justify="center" direction='column' className="" gap={20} style={{ position: 'relative' }}>
                    <EmailEditCard />
                    <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] border-1" gap={20}>
                        <Table data={tableData} />
                        <Flex className="w-full" align="center" justify="space-between" gap={10}>
                            <Button variant="light" color="gray.7" c='gray.8' onClick={handleBack}>Back</Button>
                            <Button variant="filled" onClick={handleSubmit} disabled={!hasResolvedRemote}>Approve</Button>
                        </Flex>
                    </Flex>
                </Flex>
            </ScrollArea>
        </Flex>
    );
}