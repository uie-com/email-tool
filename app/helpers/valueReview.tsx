"use client";

import { Anchor, Box, Button, Flex, Image, Loader, ScrollArea, Table, TableData, Text } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext, MessageContext } from "@/domain/schema/context";
import moment from "moment-timezone";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variable, Variables } from "@/domain/schema/variableCollection";
import { VariableInput } from "./components/form";
import { PRE_APPROVED_VALUES } from "@/domain/settings/settings";
import { EMAIL_EDIT_VALUES, EmailEditCard } from "./components/email";
import { EditorState, Email } from "@/domain/schema";
import { SavedEmailsContext } from "@/domain/data/saveData";
import { RemoteSource } from "./components/remote";
import { openPopup } from "@/domain/parse/parse";
import { AIRTABLE_LINK } from "@/domain/parse/parseLinks";
import { getEmailFromSchedule } from "@/domain/data/scheduleActions";


export function ValueReview() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const values = editorState.email?.values;
    const [hasResolvedRemote, setHasResolvedRemote] = useState(false);
    const template = editorState.email?.templateHTML;

    const [emailStates, deleteEmail] = useContext(SavedEmailsContext);

    const [refresh, setRefresh] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showHidden, setShowHidden] = useState(false);


    const showMessage = useContext(MessageContext);



    const variables = useMemo(() => {
        const variables = new Variables('{Template}' + (editorState.email?.templateHTML ?? ''));
        return variables;
    }, [editorState.email?.templateHTML]);

    if (!values) {
        return <></>;
    }
    const tableData: TableData = {
        head: ['Variable', 'Value'],
        body: variables.getDisplayVariables(values).map((variable, i) => {
            const name = variable.name;
            let displayValue, value = values.resolveValue(name, true, true);
            if (name === 'id') return [];
            if (!showHidden && (values.isHidden(name) || PRE_APPROVED_VALUES.includes(name) || EMAIL_EDIT_VALUES.includes(name)))
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
        if (refresh)
            resolvePromises();

        setRefresh(false);
    }, [refresh]);


    const templateId = useMemo(() => editorState.email?.templateId, [editorState.email]);
    const campaignId = useMemo(() => editorState.email?.campaignId, [editorState.email]);

    const handleDelete = async (force: boolean = false) => {
        console.log('Deleting email: ', editorState.email?.name, ' from state: ', editorState);

        if ((templateId || campaignId) && !force)
            return showMessage('Deleting While Uploaded', {
                templateId: templateId,
                campaignId: campaignId,
                deleteEmail: () => handleDelete(true),
            });

        deleteEmail(editorState.email?.airtableId ?? editorState.email?.name);
        setEditorState({ step: 0 });
    }

    const handleReset = async (force: boolean = false) => {
        if ((templateId || campaignId) && !force)
            return showMessage('Deleting While Uploaded', {
                templateId: templateId,
                campaignId: campaignId,
                deleteEmail: () => handleReset(true),
            });

        if (isLoading) return;
        setIsLoading(true);

        const emailId = editorState.email?.name;
        const newEmailStr = await getEmailFromSchedule(emailId);
        let newEmail = JSON.parse(newEmailStr ?? '{}');
        if (newEmail) {
            newEmail = new Email(newEmail.values, newEmail);
            newEmail.values.setValue('Last Populated', { value: new Date(), source: 'remote' });

            console.log('Refreshing email: ', newEmail, ' from state: ', editorState);
            setEditorState({ ...editorState, email: { ...editorState.email, ...newEmail } });
            setIsLoading(false);
            setRefresh(true);
        }
    }

    // const handleBack = () => {
    //     setEditorState({ ...editorState, step: 0 });
    //     console.log('Returning to state: ', { ...editorState, step: 0 });
    // }

    const handleSubmit = async () => {
        console.log('Submitting values: ', values);
        await values.populateRemote();
        setEditorState({ ...editorState, step: 2, email: { ...editorState.email, values: values } });
        console.log('Approved values. Editor state: ', { ...editorState, step: 2 });
    }

    return (
        <Flex align="center" justify="center" direction='column' className=" w-full h-full" gap={20}>
            <ScrollArea type="never" className="w-full" >
                <Flex align="center" justify="center" direction='column' className="py-20 px-5" gap={20} style={{ position: 'relative' }}>

                    <EmailEditCard />
                    <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] border-1 relative" mt={28} gap={20}>
                        <Box className=" absolute " top={-35} left={-5} ml={4} >
                            <RemoteSource
                                name="Airtable"
                                icon={<Flex className="" justify='center' align='center' w={16} h={16} mr={-2} ml={-4}><Image src='./interface/airtable.png' h={12} w={12} /></Flex>}
                                edit={() => openPopup(AIRTABLE_LINK)}
                                refresh={() => handleReset()}
                                date={values?.resolveValue('Last Populated', true)}
                                className="!border-gray-200 !bg-gray-0 border-1 "
                                refreshMessage="Reset"
                                isLoading={isLoading}
                            />
                        </Box>
                        <Box className="absolute" top={-20} right={5} >
                            <Text c='gray.5' fz='10' onClick={() => setShowHidden((prev) => !prev)} className=" cursor-pointer">{showHidden ? 'Hide Internal Values' : 'Show Hidden Values'}</Text>
                        </Box>
                        {

                            isLoading ?
                                <Flex className="w-full" align="center" justify="center" gap={10} mih={360}>
                                    <Loader color="blue" type="bars" />
                                </Flex>
                                :
                                <>
                                    <Table data={tableData} />
                                    <Flex className="w-full" align="center" justify="space-between" gap={10}>
                                        <Button variant="outline" color="red.7" c='red.7' onClick={() => handleDelete()}>Delete</Button>
                                        <Button variant="light" color="gray" onClick={() => handleReset()}>Reset</Button>
                                        <Button variant="filled" className=" ml-auto" onClick={handleSubmit} disabled={!hasResolvedRemote || !template}>{template ? 'Approve Values' : 'Needs Working Template'}</Button>
                                    </Flex>
                                </>
                        }
                    </Flex>
                </Flex>
            </ScrollArea >
        </Flex >
    );
}