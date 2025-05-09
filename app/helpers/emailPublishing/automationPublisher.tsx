"use client";

import { EditorContext, GlobalSettingsContext } from "@/domain/schema/context";
import { ActionIcon, Anchor, Box, Button, Flex, Group, HoverCard, Image, Loader, Select, Stack, Text, Textarea, TextInput, ThemeIcon } from "@mantine/core";
import { useContext, useEffect, useState, createContext, useMemo } from "react";
import { RequireValues } from "../components/require";
import { EmailViewCard } from "../components/email";
import { IconAlertCircle, IconArrowBackUp, IconArrowLeft, IconArrowRight, IconCalendarCheck, IconCalendarEvent, IconCalendarX, IconCheck, IconChecklist, IconClipboardCheck, IconClipboardText, IconClipboardX, IconConfetti, IconCopy, IconExternalLink, IconFile, IconFileCheck, IconFileExport, IconFileX, IconLink, IconListCheck, IconListDetails, IconMail, IconMailbox, IconMailCheck, IconMailPlus, IconMailQuestion, IconMailX, IconMessageCheck, IconMessageSearch, IconMessageX, IconPlaylistX, IconProgressX, IconRefresh, IconRosetteDiscountCheck, IconRosetteDiscountCheckFilled, IconRosetteDiscountCheckOff, IconSend, IconSendOff, IconTextCaption, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { delCampaign, delTemplate, getCampaign, getMessage, getTemplate, populateCampaignMessageWithTemplate, postCampaign, postCampaignMessage, postTemplate, putCampaign, putCampaignInternal, putMessage, testCampaign } from "@/domain/data/activeCampaignActions";
import { createAutomationLink, createCampaignLink, createGoogleDocLink, createNotionUri, createTemplateLink } from "@/domain/parse/parseLinks";
import { HadIssue, RemoteStep, StateContent } from "../components/remote";
import moment from "moment-timezone";
import { copy, openPopup } from "@/domain/parse/parse";
import { AuthStatus } from "./emailPublisher";
import { CopyOverlay } from "../components/clipboard";
import { copyGoogleDocByUrl, deleteGoogleDocByUrl } from "@/domain/data/googleActions";
import { GET_DEFAULT_PRIORITY, GET_REVIEW_INDEX, MARKETING_REVIEWER_IDS, MARKETING_REVIEWERS, PRIORITY_FLAGS, PRIORITY_ICONS, SLACK_LIST_URL } from "@/domain/settings/slack";
import { createEmailInSlack, deleteEmailInSlack, markEmailSentInSlack, markEmailUnsentInSlack } from "@/domain/data/slackActions";
import { Values } from "@/domain/schema/valueCollection";
import { NOTION_CALENDAR } from "@/domain/settings/notion";
import { createNotionCard, deleteNotionCard, findNotionCard, updateNotionCard } from "@/domain/data/notionActions";
import { loadState, markReviewedEmails, SavedEmailsContext, saveScheduleOpen } from "@/domain/data/saveData";
import { REVIEW_ACTIVE_REFRESH_INTERVAL } from "@/domain/settings/save";

export function AutomationPublisher() {
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
            <RequireValues key={'rvc'} requiredValues={['Send Date', 'Email Name', 'Template Name', 'Automation ID', 'Subject', 'From Name', 'From Email', 'Reply To']} />
            <EmailViewCard />
            <AuthStatus />
            <CreateTemplate shouldAutoStart={false} />
            <RenderTemplate shouldAutoStart={false} />
            <CreatePostmarkAction shouldAutoStart={false} />
            <CreateWaitAction shouldAutoStart={false} />
            <TestTemplate shouldAutoStart={!hadIssue} />
            <ReviewTestEmail shouldAutoStart={false} />

            <SendReview shouldAutoStart={editorState.email?.hasSentReview ?? false} />
            <MarkComplete shouldAutoStart={false} />
            {
                editorState.email?.isSentOrScheduled ?
                    <Flex gap={10} direction="row" align="center" justify="end" w='100%' px='24' mt={6}>
                        <Button variant="filled" color="green" h={40} rightSection={<IconArrowRight strokeWidth={2} />} onClick={handleOpenSchedule} >Return to Schedule</Button>
                    </Flex>
                    : null
            }{
                editorState.email?.hasSentReview && !editorState.email?.isSentOrScheduled ?
                    <Flex gap={10} direction="row" align="center" justify="end" w='100%' px='24' mt={6}>
                        <Button variant="outline" color="blue" h={40} rightSection={<IconArrowRight strokeWidth={2} />} onClick={handleOpenSchedule} >Return to Schedule</Button>
                    </Flex>
                    : null
            }
        </HadIssue.Provider >
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
                // <Anchor href={createTemplateLink(editorState.email?.templateId ?? '')} target="_blank">
                <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId ?? ''))} >
                    Edit Templates
                </Button>
            // </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconChecklist size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Template',
            subtitle: 'Created a Template with this HTML.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy(editorState.email?.templateId)}>
                        <IconCopy />
                    </ActionIcon> */}
                    {/* <Anchor href={editorState.email?.campaignId ? createCampaignLink(editorState.email?.campaignId) : createTemplateLink(editorState.email?.templateId)} target="_blank"> */}
                    <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />}
                        onClick={() => openPopup(editorState.email?.campaignId ? createCampaignLink(editorState.email?.campaignId) : createTemplateLink(editorState.email?.templateId))} >
                        Edit Template
                    </Button>
                    {/* </Anchor> */}
                </Flex>

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

function RenderTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId))} >Open Template</Button>
            // </Anchor>,
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId))} >Open Template</Button>
            // </Anchor>,
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Open popup, review template, then save and exit.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconFileX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Open Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                    <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >Open Template</Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconFileCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewed Template',
            subtitle: 'Make sure preview appears correctly for template.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasRendered: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        // openPopup(createTemplateLink(editorState.email?.templateId));

        await new Promise((resolve) => setTimeout(resolve, 5000));

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasRendered: editorState.email?.templateId,
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

function CreatePostmarkAction({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Box className=" relative w-full mt-2">
                                <Textarea description='ActiveCampaign Template' value={editorState.email?.values?.resolveValue('Template Name', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Template Name" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Subject' value={editorState.email?.values?.resolveValue('Subject', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Subject" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Postmark Tag' value={editorState.email?.values?.resolveValue('Email Tag', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Email Tag" />
                            </Box>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        {/* <Text size="xs" c="dimmed">Use Cmd + Shift + Option + Click to open the Automation in new window.</Text> */}
                        <Text size="xs">Make sure to create an exit preventer at the end of the automation.</Text>
                        {
                            editorState.email?.values?.resolveValue('Program', true) === 'Stand Out' ?
                                <Text size="xs">For Stand Out, always clean up past email sends.</Text>
                                : null
                        }
                        <Text size="xs" c="dimmed">Allow pop-ups to open links in new window.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final action for review.</Text>
                    </Box>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Box className=" relative w-full mt-2">
                                <Textarea description='ActiveCampaign Template' value={editorState.email?.values?.resolveValue('Template Name', true)} autosize />
                                <CopyOverlay name="Template Name" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Subject' value={editorState.email?.values?.resolveValue('Subject', true)} autosize />
                                <CopyOverlay name="Subject" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Postmark Tag' value={editorState.email?.values?.resolveValue('Email Tag', true)} autosize />
                                <CopyOverlay name="Email Tag" />
                            </Box>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        {/* <Text size="xs" c="dimmed">Make sure to allow pop-ups, or use Cmd + Shift + Option + Click to open the Automation in new window.</Text> */}
                        <Text size="xs">Make sure to create an exit preventer at the end of the automation.</Text>
                        <Text size="xs" c="dimmed">Allow pop-ups to open links in new window.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final action for review.</Text>
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMailX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,

        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Postmark Action',
            subtitle: 'Postmark action added to automation.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
            && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostmarkAction: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostmarkAction: editorState.email?.templateId,
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

function CreateWaitAction({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const openPopup = (url: string) => {
        return window.open(url, '_blank', 'noopener,noreferrer,popup');
    }

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Month' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} onChange={() => { }} />
                                    <CopyOverlay name="Month" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Date' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} onChange={() => { }} />
                                    <CopyOverlay name="Date" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Year' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} onChange={() => { }} />
                                    <CopyOverlay name="Year" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                </Box>
                            </Flex>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full">
                                    <TextInput description='Time' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} onChange={() => { }} />
                                    <CopyOverlay name="Time" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                </Box>
                                <Box className=" relative w-full">
                                    <TextInput description='Timezone' value={'America/New_York'} onChange={() => { }} />
                                    <CopyOverlay name="Timezone" value={'America/New_York'} />
                                </Box>
                            </Flex>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Month' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                    <CopyOverlay name="Month" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Date' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                    <CopyOverlay name="Date" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Year' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                    <CopyOverlay name="Year" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                </Box>
                            </Flex>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full">
                                    <TextInput description='Time' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                    <CopyOverlay name="Time" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                </Box>
                                <Box className=" relative w-full">
                                    <TextInput description='Timezone' value={'America/New_York'} />
                                    <CopyOverlay name="Timezone" value={'America/New_York'} />
                                </Box>
                            </Flex>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconCalendarX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,

        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconCalendarCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Wait Action',
            subtitle: 'Email scheduled with wait action.',
            rightContent:
                // <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank">
                <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))}>
                    Edit Automation
                </Button>
            // </Anchor>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId;
    }

    const isDone = () => {
        return editorState.email?.hasWaitAction !== undefined && editorState.email?.hasWaitAction === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasWaitAction: false,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasWaitAction: true,
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

function TestTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);

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
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
            && editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId
            && editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
    }

    const isDone = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId;

    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("Template Name", true) ?? '';
        const templateId = email.templateId;

        const subject = values.resolveValue("Subject", true) ?? '';
        const preHeader = values.resolveValue("Preview", true) ?? '';
        const fromName = values.resolveValue("From Name", true) ?? '';
        const fromEmail = values.resolveValue("From Email", true) ?? '';
        const replyToEmail = values.resolveValue("Reply To", true) ?? '';
        const sendDateMessage = values.resolveValue("Send Date", true).format('[[]M-D [AT] h:mmA[]]').replace(':00', '') ?? '';

        const notFound = (...vs: (string | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(emailName, templateId, subject, fromName, fromEmail, replyToEmail))
            return setMessage('A value that is required for publishing wasn\'t found.');

        const postCampaignResponse = await postCampaign({
            name: "TEST CAMPAIGN: " + emailName + " (Delete Me)",
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
        console.log("Created temp campaign message", messageResponse);

        const upgradedMessageResponse = await putMessage(messageResponse['id'], { editorVersion: "3", }, globalSettings.activeCampaignToken ?? '');
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaignMessageWithTemplate(campaignId + '', messageId + '', templateId ?? '', globalSettings.activeCampaignToken ?? '');
        console.log("Populated temp campaign message", res);

        const usedTemplate = await getTemplate(templateId ?? '');
        const finalMessage = await getMessage(messageId);
        const finalCampaign = await getCampaign(campaignId);
        console.log("Final temp campaign result: ", { usedTemplate, finalMessage, finalCampaign });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                messageId: finalMessage.message.id,
                campaignId: finalCampaign.campaign.id,
            }
        }));

        const response = await testCampaign({
            messageId: messageId ?? '',
            campaignId: campaignId ?? '',
            toEmail: testEmail ?? '',
            subject: sendDateMessage + ' ' + subject,
        });
        console.log("Sent Test Email", response);


        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: templateId,
            }
        }));

        console.log("Deleting temp campaign", campaignId);
        const delRes = await delCampaign(campaignId, globalSettings.activeCampaignToken ?? '');
        console.log("Deleted temp campaign", delRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
                messageId: undefined,
                sentTest: templateId,
            }
        }));

        return true;
    }

    const deleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return true;

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
            tryUndo={deleteCampaign}
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

                    <Button variant="light" color="blue.6" h={40} rightSection={<IconCopy />} mt={10} onClick={() => copy(editorState.email?.values?.resolveValue('Subject', true) ?? '')}>
                        Copy Subject
                    </Button>
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
            && editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId
            && editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId
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
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [reviewer, setReviewer] = useState(MARKETING_REVIEWERS[GET_REVIEW_INDEX(editorState.email?.templateId ?? '') % MARKETING_REVIEWERS.length]);
    const [priority, setPriority] = useState<string | undefined>(undefined);
    const defaultPriority = useMemo(() => GET_DEFAULT_PRIORITY(editorState.email), [editorState.email?.values?.resolveValue('Send Date', true)]);

    const [isPostPending, setIsPostPending] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);

    const handleCreateTicket = async () => {
        if (isPostPending) return;
        setIsPostPending(true);

        const priorityFlag = PRIORITY_FLAGS[PRIORITY_ICONS.indexOf(priority ?? '')] ?? defaultPriority;
        const userId = MARKETING_REVIEWER_IDS[MARKETING_REVIEWERS.indexOf(reviewer)] ?? MARKETING_REVIEWER_IDS[0];
        const notionUrl = editorState.email?.notionURL ?? '';

        const res = await createEmailInSlack(notionUrl, editorState.email?.referenceDocURL ?? '', editorState.email?.values?.resolveValue('Subject', true), editorState.email?.values?.resolveValue('Email ID', true), userId, priorityFlag);
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

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
            }
        }));

        return await new Promise((resolve) => {
            setInterval(async () => {
                console.log('Refreshing reviews...', emailStates);
                const newSaves = await markReviewedEmails(emailStates);
                const saveMatch = newSaves.find((s) => s === editorState.email?.name);

                let fullSave = await loadState(saveMatch ?? '');
                if (fullSave) {
                    fullSave = {
                        ...fullSave,
                        email: {
                            ...fullSave.email,
                            isReviewed: true,
                        }
                    }
                    await editEmail(fullSave);
                }

                if (saveMatch)
                    resolve(true);

            }, REVIEW_ACTIVE_REFRESH_INTERVAL)
        });
    }

    const handleSkipReview = () => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
                isReviewed: true,
            }
        }));
    }

    useEffect(() => { }, [editorState.email?.hasSentReview, editorState.email?.isReviewed]);


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
                !hasPosted ? <Button variant="light" color="gray.6" h={40} disabled={isPostPending} loading={isPostPending} > Already has Ticket</Button> :
                    <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Mark Sent</Button>
            ,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            {
                                !hasPosted ?
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
                                    :
                                    <Flex gap={20} direction="column" align="start" justify="space-between">
                                        <Text size="xs">Add screenshots and switch Review to 'Template Email Review' to post the review ticket. Then mark sent.</Text>

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
                                <Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={15}>
                                    <Button variant="outline" color="blue.5" mt={10} h={40} onClick={handleCreateTicket} disabled={isPostPending} loading={isPostPending}>Create Ticket</Button>
                                </Flex>
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
            subtitle: 'Sent review ticket to ' + (reviewer ?? MARKETING_REVIEWER_IDS[0]) + '.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex direction="row" align="end" justify="end" mt={10} mr={-5} gap={20} w='100%'>

                            <Button variant="outline" color="red" h={40} mr={'auto'} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket(true)} >
                                Delete Ticket
                            </Button>
                            <Button variant="light" color="gray" h={40} leftSection={<IconCheck />} onClick={() => handleSkipReview()} >
                                Mark Reviewed
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
            rightContent: null
            // rightContent: <ThemeIcon size={36} bg='none' c='blue' ml={12} mr={0}><IconConfetti strokeWidth={2.5} size={36} /></ThemeIcon>
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId
            && editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId
            && editorState.email?.hasWaitAction !== undefined && editorState.email?.hasWaitAction === true
            && editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0
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
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const isDone = () => {
        return editorState.email?.isSentOrScheduled !== undefined && editorState.email?.isSentOrScheduled === editorState.email?.templateId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        const slackRes = await markEmailUnsentInSlack(editorState.email?.values?.resolveValue('Email ID', true));

        if (!slackRes.success) {
            console.log("Error marking email unsent in slack", slackRes.error);
            return setMessage('Error marking email unsent in slack: ' + slackRes.error);
        }
        console.log("Marked email unsent in slack", slackRes);

        const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', false);
        if (!notionRes.success) {
            console.log("Error marking email unsent in notion", notionRes.error);
            return setMessage('Error marking email unsent in notion: ' + notionRes.error);
        }
        console.log("Marked email unsent in notion", notionRes);


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

        const slackRes = await markEmailSentInSlack(editorState.email?.values?.resolveValue('Email ID', true));

        if (!slackRes.success) {
            console.log("Error marking email sent in slack", slackRes.error);
            return setMessage('Error marking email sent in slack: ' + slackRes.error);
        }
        console.log("Marked email sent in slack", slackRes);

        const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', true);
        if (!notionRes.success) {
            console.log("Error marking email sent in notion", notionRes.error);
            return setMessage('Error marking email sent in notion: ' + notionRes.error);
        }
        console.log("Marked email sent in notion", notionRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isSentOrScheduled: editorState.email?.templateId,
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