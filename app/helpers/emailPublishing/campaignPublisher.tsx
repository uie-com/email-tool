"use client";

import { EditorContext, GlobalSettingsContext } from "@/domain/schema";
import { ActionIcon, Anchor, Box, Button, Flex, Group, HoverCard, Image, Loader, Select, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { useContext, useEffect, useState, createContext, useMemo } from "react";
import { RequireValues } from "../components/require";
import { EmailViewCard } from "../components/email";
import { IconAlertCircle, IconArrowBackUp, IconArrowRight, IconCheck, IconChecklist, IconClipboardCheck, IconClipboardText, IconClipboardX, IconCopy, IconExternalLink, IconFileExport, IconLink, IconListCheck, IconListDetails, IconMail, IconMailbox, IconMailCheck, IconMailPlus, IconMailQuestion, IconMessageCheck, IconMessageSearch, IconMessageX, IconPlaylistX, IconProgressX, IconRefresh, IconRosetteDiscountCheck, IconRosetteDiscountCheckFilled, IconRosetteDiscountCheckOff, IconSend, IconSendOff, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { delCampaign, delTemplate, getCampaign, getMessage, getTemplate, populateCampaignMessageWithTemplate, postCampaign, postCampaignMessage, postTemplate, putCampaign, putCampaignInternal, putMessage, testCampaign } from "@/domain/data/activeCampaignActions";
import { createCampaignLink, createGoogleDocLink, createNotionUri, createTemplateLink } from "@/domain/parse/parseLinks";
import { HadIssue, RemoteStep, StateContent } from "../components/remote";
import moment from "moment-timezone";
import { AuthStatus } from "./emailPublisher";
import { isEmailReviewed } from "@/domain/data/airtableActions";
import { createEmailInSlack, deleteEmailInSlack } from "@/domain/data/slackActions";
import { MARKETING_REVIEWERS, GET_REVIEW_INDEX, GET_DEFAULT_PRIORITY, PRIORITY_FLAGS, PRIORITY_ICONS, MARKETING_REVIEWER_IDS, SLACK_LIST_URL } from "@/domain/settings/slack";
import { copy, openPopup } from "@/domain/parse/parse";
import { copyGoogleDocByUrl, deleteGoogleDocByUrl } from "@/domain/data/googleActions";
import { Values } from "@/domain/schema/valueCollection";
import { createNotionCard, deleteNotionCard, findNotionCard, updateNotionCard } from "@/domain/data/notionActions";
import { NOTION_CALENDAR } from "@/domain/settings/notion";
import { saveScheduleOpen } from "@/domain/data/saveData";

export function CampaignPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [hadIssue, setHadIssue] = useState(false);

    const handleOpenSchedule = () => {
        saveScheduleOpen();
        setEditorState({
            step: 0
        })
    }

    return (
        <HadIssue.Provider value={[hadIssue, setHadIssue]}>
            <RequireValues key={'rvc'} requiredValues={['Send Date', 'Subject', 'Email Name', 'Campaign Name', 'Template Name', 'List ID', 'Segment ID', 'Send Date', 'Subject', 'From Name', 'From Email', 'Reply To']} />
            <EmailViewCard />
            <AuthStatus />
            <CreateTemplate shouldAutoStart={false} />
            <CreateCampaign shouldAutoStart={!hadIssue} />
            <CreateReferenceDoc shouldAutoStart={!hadIssue} />
            <GetNotionPage shouldAutoStart={false} />
            <TestTemplate shouldAutoStart={false} />
            <SendReview shouldAutoStart={false} />
            <MarkComplete shouldAutoStart={false} />
            {
                editorState.email?.isSentOrScheduled ?
                    <Flex gap={10} direction="row" align="center" justify="end" w='100%' px='24' mt={6}>
                        <Button variant="filled" color="green" h={40} rightSection={<IconArrowRight strokeWidth={2} />} onClick={handleOpenSchedule} >Return to Schedule</Button>
                    </Flex>
                    : null
            }
        </HadIssue.Provider>
    );
}

function CreateTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Export Template</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creating an editable Template with this HTML...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconAlertCircle size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create a Template',
            subtitle: 'You may need to create a Template manually.',
            rightContent:
                <Anchor href={createTemplateLink(editorState.email?.templateId ?? '')} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Edit Templates
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconChecklist size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Template',
            subtitle: 'Created a Template with this HTML.',
            rightContent:
                // <Anchor href={editorState.email?.campaignId ? createCampaignLink(editorState.email?.campaignId) : createTemplateLink(editorState.email?.templateId)} target="_blank">
                <Button variant="light" color="green.5" h={40} onClick={() => openPopup(editorState.email?.campaignId ? createCampaignLink(editorState.email?.campaignId) : createTemplateLink(editorState.email?.templateId))} rightSection={<IconExternalLink />} >
                    Edit Template
                </Button>
            // </Anchor> 
        }
    };

    const isReady = () => {
        return editorState.email?.HTML !== undefined && editorState.email?.HTML.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const html = email.HTML ?? '';
        const emailName = values.resolveValue("Template Name", true) ?? '';

        if (html.trim().length === 0)
            return setMessage('Template HTML is required and wasn\'t found.');
        if (emailName.trim().length === 0)
            return setMessage('Email Name is required and wasn\'t found.');

        const template = (await postTemplate(emailName, html)).template;
        console.log("Created template " + emailName, template);

        if (!template.id) return setMessage(template);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: template.id,
            }
        }));

        return true;
    }

    const deleteTemplate = async () => {
        const templateId = editorState.email?.templateId;
        if (!templateId) return;

        console.log("Deleting template", templateId);
        const res = await delTemplate(templateId);
        console.log("Deleted template", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: undefined,
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
            tryUndo={deleteTemplate}
            allowsUndo
        />
    )
}

function CreateCampaign({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);


    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Campaign</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Creating a Campaign with this Template...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMailQuestion size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: editorState.email?.campaignId ? 'Couldn\'t Link the Campaign' : 'Couldn\'t Create the Campaign',
            subtitle: editorState.email?.campaignId ? 'You may need to edit the Campaign manually.' : 'You may need to create the Campaign manually.',
            rightContent:
                <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        {editorState.email?.campaignId ? 'Edit Campaign' : 'Edit Campaigns'}
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Campaign',
            subtitle: 'Scheduled a Campaign with Template.',
            rightContent:
                // <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                <Button variant="light" color="green.5" h={40} onClick={() => openPopup(createCampaignLink(editorState.email?.campaignId))} rightSection={<IconExternalLink />} >
                    Edit Campaign
                </Button>
            // </Anchor>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
        return editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0;
    }

    const tryAction = async (setMessage: (m: string) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("Campaign Name", true) ?? '';
        const templateId = email.templateId;

        const listId = values.resolveValue("List ID", true) ?? '';
        const segmentId = values.resolveValue("Segment ID", true) ?? '';

        const sendDate = values.resolveValue("Send Date", true) ?? '';

        const subject = values.resolveValue("Subject", true) ?? '';
        const preHeader = values.resolveValue("Preview", true) ?? '';
        const fromName = values.resolveValue("From Name", true) ?? '';
        const fromEmail = values.resolveValue("From Email", true) ?? '';
        const replyToEmail = values.resolveValue("Reply To", true) ?? '';

        const notFound = (...vs: (string | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(emailName, templateId, listId, segmentId, subject, fromName, fromEmail, replyToEmail))
            return setMessage('A value that is required for publishing wasn\'t found.');

        if (!moment(sendDate).isValid())
            return setMessage('Send Date is required and wasn\'t found.');
        const scheduledDate = moment(sendDate).tz("America/New_York").format();

        const postCampaignResponse = await postCampaign({
            name: emailName,
        }); // Create an empty campaign object
        console.log("Created empty campaign", postCampaignResponse);
        const campaignId = postCampaignResponse['id'];

        const messageResponse = await postCampaignMessage(campaignId, {
            subject,
            fromEmail,
            replyToEmail,
            preHeader,
            fromName,
            editorVersion: 3,
        }, globalSettings.activeCampaignToken ?? '');
        console.log("Created campaign message", messageResponse);

        const upgradedMessageResponse = await putMessage(messageResponse['id'], { editorVersion: "3", }, globalSettings.activeCampaignToken ?? '');
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaignMessageWithTemplate(campaignId + '', messageId + '', templateId ?? '', globalSettings.activeCampaignToken ?? '');
        console.log("Populated campaign message", res);

        const targetedCampaignResponse = await putCampaignInternal(campaignId, {
            listIds: [listId],
            segmentId,
        }, globalSettings.activeCampaignToken ?? '');
        console.log("Filled in campaign", targetedCampaignResponse);

        const scheduledCampaignResponse = await putCampaignInternal(campaignId, {
            scheduledDate,
            predictiveSendEnabled: false
        }, globalSettings.activeCampaignToken ?? '');
        console.log("Filled in campaign", scheduledCampaignResponse);

        const usedTemplate = await getTemplate(templateId ?? '');
        const finalMessage = await getMessage(messageId);
        const finalCampaign = await getCampaign(campaignId);
        console.log("Final result: ", { usedTemplate, finalMessage, finalCampaign });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                messageId: finalMessage.message.id,
                campaignId: finalCampaign.campaign.id,
            }
        }));

        return true;
    }

    const deleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return;

        console.log("Deleting campaign", campaignId);
        const res = await delCampaign(campaignId, globalSettings.activeCampaignToken ?? '');
        console.log("Deleted campaign", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
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
            tryUndo={deleteCampaign}
            allowsUndo
        />
    )
}

function CreateReferenceDoc({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);

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
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Doc</Button>
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
                    <TextInput description='Link to Final Reference Doc' value={editorState.email?.values?.resolveValue('Source Reference Doc', true)} w='100%' rightSection={<IconLink />}
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
                    <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.referenceDocURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon>
                    <Anchor href={(editorState.email?.referenceDocURL ?? '')} target="_blank">
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} >
                            Open Doc
                        </Button>
                    </Anchor>
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0;
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
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Doc</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: (updatingCard ? 'Adding Ref Doc to' : (didCreate ? 'Creating' : 'Finding')) + ' Notion Card',
            subtitle: (didCreate ? 'Creating' : 'Finding') + 'a Notion card for the email....',
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
                    <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.notionURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon>
                    <Anchor href={createNotionUri(editorState.email?.notionURL ?? '')} target="_blank">
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} >
                            Open Card
                        </Button>
                    </Anchor>
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId
            && editorState.email?.hasWaitAction !== undefined && editorState.email?.hasWaitAction === true
            && editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
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
        const referenceDocURL = email?.referenceDocURL ?? '';

        setDidCreate(false);

        let res = await findNotionCard(sendDate, emailName);
        if (!res || !res.success) {
            console.log("Error querying Notion", res);
            setMessage(res?.error ?? 'Error searching Notion: ' + res?.error);
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
        const updateRes = await updateNotionCard(notionId ?? '', referenceDocURL, false);
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

        return true;
    }

    const tryUndo = async () => {
        const notionId = editorState.email?.notionId;
        if (!notionId) return true;

        console.log("Deleting notion card", notionId);
        const res = await deleteNotionCard(notionId);
        if (!res.success) {
            console.log("Error deleting notion card", res.error);
            return;
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

function TestTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [testEmail, setTestEmail] = useState<string | undefined>(editorState.email?.values?.resolveValue("Test Email", true));

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Send Test</Button>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' className=" p-2">
                    <Box className=" relative w-full mt-2">
                        <TextInput description='Test Email' value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sending Test Email',
            subtitle: 'Sending test email...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconSendOff size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Send Test Email',
            subtitle: 'You may need to continue in Active Campaign.',
            rightContent:
                <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Open Campaign
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailbox size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sent Test Email',
            subtitle: 'Sent test email to ' + testEmail + '.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.messageId !== undefined && editorState.email?.messageId.length > 0
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0
            && editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0

    }

    const isDone = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.campaignId;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const messageId = parseInt(email.messageId ?? '');
        const campaignId = parseInt(email.campaignId ?? '');
        const testEmail = values.resolveValue("Test Email", true) ?? '';
        const subject = values.resolveValue("Subject", true) ?? '';

        const notFound = (...vs: (string | number | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(messageId, campaignId, testEmail, subject))
            return setMessage('A value that is required for publishing wasn\'t found.');

        const response = await testCampaign({
            messageId: messageId ?? '',
            campaignId: campaignId ?? '',
            toEmail: testEmail ?? '',
            subject: subject,
        });
        console.log("Send Test Email", response);


        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: editorState.email?.campaignId,
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
            allowsRedo
            allowsUndo={false}
        />
    )
}

function ReviewTestEmail({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' className="">
                    <Anchor href={createNotionUri(editorState.email?.notionURL ?? '')} target="_blank">
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} mt={5}>
                            Open Checklist
                        </Button>
                    </Anchor>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>,
            expandedContent:
                <Flex gap={20} direction="row" align="start" justify="end" w='100%' className="">
                    <Button variant="light" color="blue.6" h={40} rightSection={<IconExternalLink />} mt={10} onClick={() => openPopup('https://mail.google.com/mail/u/0/#search/' + editorState.email?.values?.resolveValue('Test Email', true))}>
                        Gmail
                    </Button>
                    <Anchor href={'message://'} target="_blank">
                        <Button variant="light" color="blue.6" h={40} rightSection={<IconExternalLink />} mt={10}>
                            Apple Mail
                        </Button>
                    </Anchor>
                    <Anchor href={createNotionUri(editorState.email?.notionURL ?? '')} target="_blank">
                        <Button variant="filled" color="blue.5" h={40} rightSection={<IconExternalLink />} mt={10}>
                            Open Checklist
                        </Button>
                    </Anchor>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewing Test Email',
            subtitle: 'Reviewing email against Notion QA Checklist.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconPlaylistX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Error Marking Test Email Reviewed',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewed Test Email',
            subtitle: 'Reviewed email against Notion QA Checklist.',
            rightContent: null
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.campaignId
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId === editorState.email?.campaignId
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0
            && editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0;
    }

    const isDone = () => {
        return editorState.email?.isDevReviewed !== undefined && editorState.email?.isDevReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isDevReviewed: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isDevReviewed: true,
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
            allowsUndo={true}
        />
    )
}

function SendReview({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const [reviewer, setReviewer] = useState(MARKETING_REVIEWERS[GET_REVIEW_INDEX(editorState.email?.templateId ?? '') % MARKETING_REVIEWERS.length]);
    const [priority, setPriority] = useState<string | undefined>(undefined);
    const defaultPriority = useMemo(() => GET_DEFAULT_PRIORITY(editorState.email), [editorState.email?.values?.resolveValue('Send Date', true)]);

    const [isPostPending, setIsPostPending] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);

    const handleCreateTicket = async () => {
        if (isPostPending) return;
        setIsPostPending(true);

        const priorityFlag = PRIORITY_FLAGS[PRIORITY_ICONS.indexOf(priority ?? '')] ?? PRIORITY_FLAGS[1];
        const userId = MARKETING_REVIEWER_IDS[MARKETING_REVIEWERS.indexOf(reviewer)] ?? MARKETING_REVIEWER_IDS[0];

        const res = await createEmailInSlack(undefined, editorState.email?.referenceDocURL ?? '', editorState.email?.values?.resolveValue('Subject', true), editorState.email?.values?.resolveValue('Email ID', true), userId, priorityFlag);
        console.log("Created email in slack", res);

        setHasPosted(true);
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
            }
        }));
        setIsPostPending(false);
    }

    const handleDeleteTicket = async (forceRefresh: boolean = false) => {
        if (isPostPending) return;
        setIsPostPending(true);
        const res = await deleteEmailInSlack(editorState.email?.values?.resolveValue('Email ID', true));
        console.log("Deleted email in slack", res);

        setHasPosted(false);
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: false,
            }
        }));
        setIsPostPending(false);

        if (forceRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        }
    }


    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent:
                !hasPosted ? null :
                    <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Mark Sent</Button>
            ,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            {
                                !hasPosted ?
                                    <Flex gap={10} direction="column" align="start" justify="space-between">
                                        <Flex gap={10} direction="row" align="start" justify="space-between">

                                            <Box className=" relative w-full mt-2">
                                                <Select
                                                    description='Reviewer'
                                                    value={reviewer}
                                                    data={MARKETING_REVIEWERS}
                                                    onChange={(v) => setReviewer(v ?? '')}
                                                    disabled={isPostPending || hasPosted}
                                                />
                                            </Box>
                                            <Box className=" relative w-24 mt-2">
                                                <Select
                                                    description='Priority'
                                                    value={priority}
                                                    defaultValue={PRIORITY_ICONS[PRIORITY_FLAGS.indexOf(defaultPriority)]}
                                                    data={PRIORITY_ICONS}
                                                    onChange={(v) => setPriority(v ?? '')}
                                                    disabled={isPostPending || hasPosted}
                                                />
                                            </Box>
                                        </Flex>
                                        <Text size="xs" c="dimmed" mt={2}>Last marketing reviewer was {MARKETING_REVIEWERS[(GET_REVIEW_INDEX(editorState.email?.templateId ?? '') - 1) % MARKETING_REVIEWERS.length]}.</Text>
                                    </Flex>

                                    :
                                    <Flex gap={20} direction="column" align="start" justify="space-between">
                                        <Text size="xs">Add screenshots and switch Review to 'Template Email Review' to post the review ticket.</Text>

                                        <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={100} >
                                            <Image src={'./tutorials/upload-screenshots.gif'} />
                                        </Box>
                                        <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={270}>
                                            <Image src={'./tutorials/send-review.gif'} />
                                        </Box>
                                    </Flex>
                            }
                        </Flex>
                        {
                            !hasPosted ?
                                <Button variant="outline" color="blue.5" mt={10} h={40} onClick={handleCreateTicket} disabled={isPostPending} loading={isPostPending}>Create Ticket</Button>
                                :
                                <Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={20}>
                                    <Anchor href={SLACK_LIST_URL} target="_blank">
                                        <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >
                                            Open Slack List
                                        </Button>
                                    </Anchor>
                                    <Button variant="light" color="gray" h={40} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket()} >
                                        Delete Ticket
                                    </Button>
                                </Flex>

                        }
                    </Flex>
                    {/* <Box px={10}>
                        <Text size="xs">Remember to add screenshots and switch Review to 'Template Email Review'.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box> */}
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Waiting for Reviews',
            subtitle: 'Sent review ticket to ' + reviewer + '.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex direction="row" align="end" justify="end" mt={10} mr={-5} gap={20} w='100%'>
                            <Button variant="light" color="gray" h={40} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket(true)} >
                                Delete Ticket
                            </Button>
                            <Anchor href={SLACK_LIST_URL} target="_blank">
                                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >
                                    Open Slack List
                                </Button>
                            </Anchor>
                        </Flex>
                    </Flex>
                    {/* <Box px={10}>
                        <Text size="xs">Remember to add screenshots and switch Review to 'Template Email Review'.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box> */}
                </Flex>
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMessageX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Find Review Ticket',
            subtitle: 'Try to send the review again.',
            rightContent:
                <Anchor href={SLACK_LIST_URL} target="_blank">
                    <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />}>Open Slack</Button>
                </Anchor >
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMessageCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Email Approved',
            subtitle: 'Final email review marked as approved.',
            rightContent: ''
            // rightContent: <ThemeIcon size={36} bg='none' c='blue' ml={12} mr={0}><IconConfetti strokeWidth={2.5} size={36} /></ThemeIcon>
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.campaignId
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId === editorState.email?.campaignId
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0
            && editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0
            && editorState.email?.isDevReviewed !== undefined && editorState.email?.isDevReviewed === true
    }

    const isDone = () => {
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        await handleDeleteTicket();

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: false,
                isReviewed: false,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        return await new Promise((resolve) => {
            setInterval(async () => {
                if (!editorState.email?.hasSentReview)
                    resolve(false);

                const isReviewed = await isEmailReviewed(editorState.email?.values?.resolveValue('Email ID', true));
                console.log('isReviewed', isReviewed);
                if (isReviewed) {
                    setEditorState((prev) => ({
                        ...prev,
                        email: {
                            ...prev.email,
                            isReviewed: true,
                            hasSentReview: true,
                        }
                    }));
                    resolve(true);
                }
            }, 15000)
        });
    }

    return (
        <RemoteStep
            shouldAutoStart={shouldAutoStart}
            stateContent={stateContent}
            isReady={isReady}
            isDone={isDone}
            tryAction={tryAction}
            tryUndo={tryUndo}
            allowsUndo={false}
            allowsRedo={true}
        />
    )
}

function MarkComplete({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const sentOrScheduled = useMemo(() => {
        const sendDate = editorState.email?.values?.resolveValue('Send Date', true);
        const hoursUntilSend = moment(sendDate).diff(moment(), 'hours');
        return hoursUntilSend > 1 ? 'Scheduled' : 'Sent';
    }, [editorState.email?.values?.resolveValue('Send Date', true)]);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark {sentOrScheduled}</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirming email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconRosetteDiscountCheckOff size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Can\'t confirm if ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark {sentOrScheduled}</Button>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirmed ' + sentOrScheduled,
            subtitle: 'Confirmed email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: null
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0
            && editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const isDone = () => {
        return editorState.email?.isSentOrScheduled !== undefined && editorState.email?.isSentOrScheduled === editorState.email?.campaignId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isSentOrScheduled: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isSentOrScheduled: editorState.email?.campaignId,
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
            allowsUndo={true}
        />
    )
}