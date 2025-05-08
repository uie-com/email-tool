"use client";

import { ActionIcon, Anchor, Box, Button, Flex, Image, Loader, ScrollArea, Table, TableData, Text, TextInput, ThemeIcon } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext, GlobalSettingsContext, MessageContext } from "@/domain/schema/context";
import moment from "moment-timezone";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variable, Variables } from "@/domain/schema/variableCollection";
import { VariableInput } from "./components/form";
import { PRE_APPROVED_VALUES } from "@/domain/settings/settings";
import { EMAIL_EDIT_VALUES, EmailEditCard } from "./components/email";
import { EditorState, Email } from "@/domain/schema";
import { isPreApprovedTemplate, SavedEmailsContext } from "@/domain/data/saveData";
import { RemoteSource, RemoteStep, StateContent } from "./components/remote";
import { copy, openPopup } from "@/domain/parse/parse";
import { AIRTABLE_LINK, createGoogleDocLink, createNotionUri } from "@/domain/parse/parseLinks";
import { getEmailFromSchedule } from "@/domain/data/scheduleActions";
import { copyGoogleDocByUrl, deleteGoogleDocByUrl } from "@/domain/data/googleActions";
import { IconClipboardText, IconClipboardX, IconExternalLink, IconLink, IconClipboardCheck, IconCopy, IconListDetails, IconPlaylistX } from "@tabler/icons-react";
import { findNotionCard, createNotionCard, updateNotionCard, deleteNotionCard } from "@/domain/data/notionActions";
import { NOTION_CALENDAR } from "@/domain/settings/notion";


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

            const templateObject = values.getValueObj('template');

            setEditorState((prev) => ({ ...prev, email: { ...prev.email, values: values, templateHTML: templateObject?.source('remote').currentValue, template: templateObject?.source('user', 'settings').currentValue } }));
            console.log('Resolved values: ', values, ' from state: ', ({ ...editorState, email: { ...editorState.email, values: values, templateHTML: templateObject?.source('remote').currentValue, template: templateObject?.source('user', 'settings').currentValue } }));
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
        if (newEmail && newEmail.values) {
            newEmail = new Email(newEmail.values, newEmail);
            newEmail.values.setValue('Last Populated', { value: new Date(), source: 'remote' });

            console.log('Refreshing email: ', newEmail, ' from state: ', editorState);
            setEditorState({ ...editorState, email: { ...editorState.email, ...newEmail } });
            setIsLoading(false);
            setRefresh(true);
        } else {
            console.log('Error refreshing email: ', newEmail, ' from state: ', editorState);
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
        <Flex align="center" justify="center" direction='column' className="w-full h-full " gap={20}>
            <ScrollArea type="never" className="w-full" >
                <Flex align="center" justify="center" direction='column' className="px-5 py-20" gap={20} style={{ position: 'relative' }}>

                    <EmailEditCard />

                    <Flex direction='column' align="center" justify="center" className="w-[38rem]" gap={10} mt={-10} mb={6} >
                        <CreateReferenceDoc shouldAutoStart={true} />
                        <GetNotionPage shouldAutoStart={true} />
                    </Flex>


                    <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] border-1 relative" mt={28} gap={20}>
                        <Box className="absolute " top={-36} left={-2.5} ml={4} >
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

function CreateReferenceDoc({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);

    useEffect(() => { }, [shouldAutoStart]);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Doc</Button>,
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Creating Reference Document',
            subtitle: 'Creating a Google Doc for content reference...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="gray.6"><IconClipboardX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Find Reference Doc',
            subtitle: 'Input a document manually.',
            rightContent:
                <Anchor href={(editorState.email?.values?.resolveValue('Source Reference Doc', true))} target="_blank">
                    <Button variant="light" color="gray.9" h={40} rightSection={<IconExternalLink />} >
                        Open Source
                    </Button>
                </Anchor>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' p={12}>
                    <Text size="xs">Either input a source document to duplicate and retry, <br />or input a completed reference document below and continue.</Text>
                    <TextInput description='Link to Source Reference Doc' value={editorState.email?.values?.resolveValue('Source Reference Doc', true)} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            const newValues = new Values(editorState.email?.values?.initialValues);
                            newValues.setValue('Source Reference Doc', { value: e.target.value, source: 'user' });
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    values: newValues,
                                }
                            }));
                        }} />
                    <TextInput description='Link to Final Reference Doc' value={editorState.email?.referenceDocURL} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    referenceDocURL: e.target.value,
                                }
                            }));
                        }} />
                </Flex>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconClipboardCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Reference Doc',
            subtitle: 'Created content reference doc.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.referenceDocURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon> */}
                    <Button variant="light" color="green.4" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup((editorState.email?.referenceDocURL ?? ''))} >
                        Open Doc
                    </Button>
                </Flex>

        }
    };

    const isReady = () => {
        return true;
    }

    const isDone = () => {
        return editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const sourceDoc = values.resolveValue("Source Reference Doc", true) ?? '';
        const docName = values.resolveValue("Template Name", true) ?? '';

        const res = await copyGoogleDocByUrl(sourceDoc, docName, globalSettings.googleAccessToken ?? '');

        if (!res.success || !res.newFileId) {
            console.log("Error copying doc", res.error);
            return setMessage(res.error);
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                referenceDocURL: createGoogleDocLink(res.newFileId),
            }
        }));

        return true;
    }

    const tryUndo = async () => {
        const referenceDocURL = editorState.email?.referenceDocURL;
        if (!referenceDocURL) return true;

        console.log("Deleting reference doc", referenceDocURL);
        const res = await deleteGoogleDocByUrl(referenceDocURL, globalSettings.googleAccessToken ?? '');
        if (!res.success) {
            console.log("Error deleting doc", res.error);
            return;
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                referenceDocURL: undefined,
            }
        }));

        return true;
    }

    return (
        <RemoteStep
            shouldAutoStart={shouldAutoStart}
            stateContent={stateContent}
            isReady={isReady}
            isDone={isDone}
            tryAction={tryAction}
            tryUndo={tryUndo}
            allowsUndo
        />
    )
}

function GetNotionPage({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [didCreate, setDidCreate] = useState(false);
    const [updatingCard, setUpdatingCard] = useState(false);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Find Card</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: (updatingCard ? 'Adding Ref Doc to ' : (didCreate ? 'New' : 'Found')) + ' Notion Card',
            subtitle: (didCreate ? 'Created' : 'Found') + ' a Notion card for the email....',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconPlaylistX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Notion Card',
            subtitle: 'Couldn\'t find or create a Notion card.',
            rightContent:
                <Anchor href={(NOTION_CALENDAR)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Open Notion
                    </Button>
                </Anchor>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' p={12}>
                    <Text size="xs">Input the Link to the Notion Card to Continue</Text>
                    <TextInput description='Link to Notion Card' value={editorState.email?.notionURL} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    notionURL: e.target.value,
                                }
                            }));
                        }} />

                </Flex>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: (didCreate ? 'Created' : 'Found') + ' Notion Card',
            subtitle: 'Notion card ' + (didCreate ? 'created' : 'found') + ' and linked.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.notionURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon> */}
                    <Anchor href={createNotionUri(editorState.email?.notionURL ?? '')} target="_blank" ml={5}>
                        <Button variant="light" color="green.5" h={40} pl={18} rightSection={<IconExternalLink strokeWidth={1.5} />} >
                            Open Card
                        </Button>
                    </Anchor>
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const isDone = () => {
        return editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("Email Name", true) ?? '';
        const sendDate = moment(values.resolveValue("Send Date", true) ?? '').format('YYYY-MM-DD');
        const shareReviewBy = values.resolveValue((values.resolveValue("Share Review By", true) ?? ''), true);
        const referenceDocURL = email?.referenceDocURL ?? '';

        const isPreApproved = isPreApprovedTemplate(editorState.email?.template, emailStates);


        setDidCreate(false);

        let res = await findNotionCard(sendDate, emailName, shareReviewBy);
        if (!res || !res.success) {
            console.log("Error querying Notion", res);
            if (res.error)
                setMessage(res?.error ?? 'Error searching Notion: ' + res?.error);
            else
                setMessage('No Notion card found. Created one called ' + emailName + ' for ' + sendDate);
        }

        if (!res.url) {
            setDidCreate(true);

            const notionCard = await createNotionCard(sendDate, emailName);
            if (notionCard && notionCard.success && notionCard.url && notionCard.id) {
                res = notionCard;
            } else {
                return setMessage('Error creating Notion card: ' + notionCard?.error);
            }
        }

        setUpdatingCard(true);

        const notionId = res.id;
        const updateRes = await updateNotionCard(notionId ?? '', referenceDocURL, false, isPreApproved);
        if (!updateRes.success) {
            console.log("Error updating Notion card", updateRes.error);
            return setMessage('Error updating Notion card: ' + updateRes.error);
        }
        console.log("Updated Notion card", updateRes);

        setUpdatingCard(false);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                notionURL: res.url,
                notionId: res.id,
            }
        }));

        const a = document.createElement('a');
        a.href = createNotionUri(res.url);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return true;
    }

    const tryUndo = async () => {
        const notionId = editorState.email?.notionId;
        if (!notionId) return true;

        console.log("Deleting notion card", notionId);
        const res = await deleteNotionCard(notionId);
        if (!res.success) {
            console.log("Error deleting notion card", res.error);
            return true;
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                notionURL: undefined,
                notionId: undefined,
            }
        }));

        return true;
    }

    return (
        <RemoteStep
            shouldAutoStart={shouldAutoStart}
            stateContent={stateContent}
            isReady={isReady}
            isDone={isDone}
            tryAction={tryAction}
            tryUndo={tryUndo}
            allowsUndo
        />
    )
}