"use client";

import { EMAIL_EDIT_VALUES, EmailEditCard } from "@/app/components/email/metadata-card";
import { CreateCollaborativeNotes } from "@/app/components/remote/drive/collaborative-notes";
import { CreateReferenceDoc } from "@/app/components/remote/drive/reference-doc";
import { GetNotionPage } from "@/app/components/remote/notion/create-card";
import { HadIssue, RemoteSource } from "@/app/components/remote/step-template";
import { VariableInput } from "@/app/components/variables/variable-form";
import { PRE_APPROVED_VALUES } from "@/config/email-settings";
import { EditorContext, MessageContext } from "@/domain/context";
import { SavedEmailsContext } from "@/domain/email/save/saveData";
import { getEmailFromSchedule } from "@/domain/email/schedule/scheduleActions";
import { AIRTABLE_LINK } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Email } from "@/domain/schema";
import { Values } from "@/domain/values/valueCollection";
import { Variables } from "@/domain/variables/variableCollection";
import { Box, Button, Flex, Image, Loader, ScrollArea, Table, TableData, Text } from "@mantine/core";
import { useContext, useMemo, useState } from "react";
import { AuthStatus } from "../publish/publish";



export function ValueReview() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const values = editorState.email?.values;
    const [hasResolvedRemote, setHasResolvedRemote] = useState(false);
    const template = editorState.email?.templateHTML;

    const [emailStates, deleteEmail] = useContext(SavedEmailsContext);

    const [isLoading, setIsLoading] = useState(false);
    const [showHidden, setShowHidden] = useState(false);

    const [hadIssue, setHadIssue] = useState(false);


    const showMessage = useContext(MessageContext);

    const isVariation = useMemo(() => {
        return editorState.email?.values?.getCurrentValue('Is Variation') === 'Is Variation';
    }, [editorState.email?.values]);


    const variables = useMemo(() => {
        const variables = new Variables('{Template}' + (editorState.email?.templateHTML ?? ''));
        return variables;
    }, [editorState.email?.templateHTML]);

    if (!values)
        return <></>;

    if (!hasResolvedRemote) {
        values.populateRemote();
        setHasResolvedRemote(true);
    }

    const tableData: TableData = {
        head: ['Variable', 'Value'],
        body: variables.getDisplayVariables(values).map((variable, i) => {
            const name = variable.name.replaceAll('*', '');
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
                displayValue = (<VariableInput variableName={name} value={value} index={i} setValue={setValue} variant="unstyled" highlightMissing={false} />)

            return [
                name,
                displayValue
            ]
        }),
    }

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
        if (newEmail && newEmail.values) {
            newEmail = new Email(newEmail.values, newEmail);
            newEmail.values.setValue('Last Populated', { value: new Date(), source: 'remote' });

            console.log('Refreshing email: ', newEmail, ' from state: ', editorState);
            setEditorState({ ...editorState, email: { ...editorState.email, ...newEmail, referenceDocURL: editorState.email?.referenceDocURL, notionURL: editorState.email?.notionURL, notionId: editorState.email?.notionId } });
            setIsLoading(false);
            setHasResolvedRemote(false);

        } else {
            console.log('Error refreshing email: ', newEmail, ' from state: ', editorState);
            setIsLoading(false);
            setHasResolvedRemote(false);

        }
    }

    const handleRefresh = async (force: boolean = false) => {
        if ((templateId || campaignId) && !force)
            return showMessage('Deleting While Uploaded', {
                templateId: templateId,
                campaignId: campaignId,
                deleteEmail: () => handleRefresh(true),
            });

        if (isLoading) return;
        setIsLoading(true);

        const userValues = values.source('user');
        console.log('Refreshing email with user values: ', userValues.asDict(), ' from state: ', editorState);

        const emailId = editorState.email?.name;
        const newEmailStr = await getEmailFromSchedule(emailId);
        let newEmail = JSON.parse(newEmailStr ?? '{}');
        if (newEmail && newEmail.values) {
            newEmail = new Email(newEmail.values, newEmail);
            newEmail.values.setValue('Last Populated', { value: new Date(), source: 'remote' });

            userValues.initialValues.map((value) => {
                newEmail.values.addValue(value.name, { value: value.getCurrentValue(), source: 'user' });
            });

            console.log('Refreshing email: ', newEmail.values.getValueObj('title'), ' from state: ', editorState);
            setEditorState({ ...editorState, email: { ...editorState.email, ...newEmail, referenceDocURL: editorState.email?.referenceDocURL, notionURL: editorState.email?.notionURL, notionId: editorState.email?.notionId } });
            setIsLoading(false);
            setHasResolvedRemote(false);
        } else {
            console.log('Error refreshing email: ', newEmail, ' from state: ', editorState);
            setIsLoading(false);
            setHasResolvedRemote(false);
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
        <Flex align="center" justify="center" direction='column' className="w-full h-full " gap={20}>
            <ScrollArea type="never" className="w-full" >
                <Flex align="center" justify="center" direction='column' className="px-5 py-20" gap={20} style={{ position: 'relative' }}>

                    <EmailEditCard />

                    <Flex direction='column' align="center" justify="center" className="w-[38rem]" gap={10} mt={-10} mb={isVariation ? 0 : 6} >
                        <Box w='100%' mt={10} mb={10} >
                            <AuthStatus className=" !justify-start " showAC={false} />
                        </Box>

                        <HadIssue.Provider value={[hadIssue, setHadIssue]}>
                            <CreateReferenceDoc shouldAutoStart={!hadIssue} />
                            <GetNotionPage shouldAutoStart={!hadIssue} />
                            <CreateCollaborativeNotes shouldAutoStart={!hadIssue} hasResolvedRemote={hasResolvedRemote} />
                        </HadIssue.Provider>
                    </Flex>


                    <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] border-1 relative" mt={28} gap={20}>
                        <Box className="absolute " top={-34} left={-2.5} ml={4} >
                            <RemoteSource
                                name="Airtable"
                                icon={<Flex className="" justify='center' align='center' w={16} h={16} mr={-2} ml={-4}><Image src='./interface/airtable.png' h={12} w={12} /></Flex>}
                                edit={() => openPopup(AIRTABLE_LINK)}
                                refresh={() => handleRefresh()}
                                date={values?.resolveValue('Last Populated', true)}
                                className="!border-gray-200 !bg-gray-0 border-1 "
                                refreshMessage="Reset"
                                isLoading={isLoading}
                            />
                        </Box>
                        <Box className="absolute" top={-20} right={5} >
                            <Text c='gray.5' fz='10' onClick={() => setShowHidden((prev) => !prev)} className="cursor-pointer ">{showHidden ? 'Hide Internal Values' : 'Show Hidden Values'}</Text>
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
                                        <Button variant="filled" className="ml-auto " onClick={handleSubmit} disabled={!hasResolvedRemote || !template}>{template ? 'Approve Values' : 'Needs Working Template'}</Button>
                                    </Flex>
                                </>
                        }
                    </Flex>
                </Flex>
            </ScrollArea >
        </Flex >
    );
}





