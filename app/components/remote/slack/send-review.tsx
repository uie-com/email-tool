import { MARKETING_REVIEWERS, MARKETING_REVIEWER_IDS, PRIORITY_FLAGS, PRIORITY_ICONS, SLACK_LIST_URL } from "@/config/integration-settings";
import { REVIEW_ACTIVE_REFRESH_INTERVAL } from "@/config/save-settings";
import { EditorContext } from "@/domain/context";
import { SavedEmailsContext, isPreApprovedTemplate, loadState, markReviewedEmails } from "@/domain/email/save/saveData";
import { getScreenshotOfPostmarkScheduledEmail } from "@/domain/integrations/airtable/postmarkScheduleActions";
import { updateNotionCard } from "@/domain/integrations/notion/notionActions";
import { calculatePriority, getLastReviewer, getNextReviewer, logReviewer } from "@/domain/integrations/slack/reviews";
import { createEmailInSlack as createTicketInSlack, deleteEmailInSlack, postPostmarkScheduledEmailInSlack } from "@/domain/integrations/slack/slackActions";
import { Values } from "@/domain/values/valueCollection";
import { Anchor, Box, Button, Flex, Image, Loader, Select, Text, ThemeIcon } from "@mantine/core";
import { IconArrowBackUp, IconCheck, IconExternalLink, IconMessage, IconMessageCheck, IconMessageSearch, IconMessageX } from "@tabler/icons-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RemoteStep, StateContent } from "../step-template";


export function SendReview({ parentShouldAutoStart }: { parentShouldAutoStart: boolean }) {

    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [reviewer, setReviewer] = useState<number>(getNextReviewer());
    const defaultPriority = useMemo(() => calculatePriority(editorState.email), [editorState.email?.values?.resolveValue('Send Date', true)]);
    const [priority, setPriority] = useState<number>(defaultPriority);

    const [isPostPending, setIsPostPending] = useState(false);
    const [hasPosted, setHasPosted] = useState(editorState.email?.hasPostedReview ?? false);
    const [shouldAutoStart, setShouldAutoStart] = useState(parentShouldAutoStart);


    const sendButton = useRef<HTMLButtonElement>(null);

    const slackEmailId = useMemo(() => {
        return editorState.email?.values?.resolveValue('Sent QA Email ID', true) ?? editorState.email?.values?.resolveValue('QA Email ID', true) ?? '';
    }, [editorState.email?.values]);

    const isPreApproved = isPreApprovedTemplate(editorState.email?.template, emailStates);

    const handleCreateTicket = async () => {
        if (isPostPending) return;
        setIsPostPending(true);

        const priorityFlag = priority ? PRIORITY_FLAGS[priority] : PRIORITY_FLAGS[defaultPriority];
        const userId = reviewer ? MARKETING_REVIEWER_IDS[reviewer] : MARKETING_REVIEWER_IDS[0];
        const notionUrl = editorState.email?.notionURL ?? '';
        const slackEmailId = editorState.email?.values?.resolveValue('QA Email ID', true) ?? '';
        const uuid = editorState.email?.uuid ?? '';
        let subject = editorState.email?.values?.resolveValue('Subject', true) ?? '';
        let usingPostmarkScheduler = 'No';

        const sendType = editorState.email?.values?.getCurrentValue('Send Type');
        // if (sendType === 'POSTMARK') {
        //     usingPostmarkScheduler = 'Yes';
        //     const scheduledItem = await getPostmarkScheduledEmail(uuid);
        //     if (scheduledItem) {
        //         subject = `\n\n📣  Subject\n${scheduledItem.fields['Subject']}\n\n📆  Scheduled For\n${moment(scheduledItem.fields['Schedule Date']).format('dddd, MMM DD  [at]  hh:mm A')}\n\n\n📧  Template Name\n${scheduledItem.fields['Template']}\n\n👥  Automation Name\n${scheduledItem.fields['Automation']}\n\n🔖  Email Tag\n${scheduledItem.fields['Email Tag']}\n\n`;
        //         subject = 'https://airtable.com/app1KqzidZW6oePcC/shr0wUGrfFuf7mWn7/tblb7LRhKpSB1YGYH/viwHqcQZ0NdT2Oi8K/' + editorState.email?.postmarkToolId + '?blocks=hide';
        //     }
        // }

        if (sendType === 'POSTMARK') {
            usingPostmarkScheduler = 'Yes';
            const scheduledItem = await getScreenshotOfPostmarkScheduledEmail(editorState.email?.postmarkToolId);
            if (scheduledItem) {
                subject = scheduledItem;
            }
        }

        const res = await createTicketInSlack(
            notionUrl,
            editorState.email?.referenceDocURL ?? '',
            subject,
            slackEmailId,
            userId,
            priorityFlag,
            uuid,
            usingPostmarkScheduler
        );

        console.log("Created ticket in slack", res);
        editorState.email?.values?.setValue('Sent QA Email ID', slackEmailId);
        logReviewer(reviewer);

        const notionId = editorState.email?.notionId;
        const referenceDocURL = editorState.email?.referenceDocURL ?? '';
        const updateRes = await updateNotionCard(notionId ?? '', referenceDocURL, false, isPreApproved, true);
        console.log("Updated Notion status to started", updateRes);

        setHasPosted(true);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostedReview: true,
                hasSentReview: false,

                values: new Values(editorState.email?.values?.initialValues ?? []),
            }
        }));

        if (sendType === 'POSTMARK') {
            setTimeout(() => {
                if (sendButton.current) {
                    sendButton.current.click();
                }
            }, 5000);
        }


        setIsPostPending(false);

    }

    const handleDeleteTicket = async (forceRefresh: boolean = false) => {
        if (isPostPending) return;
        setIsPostPending(true);
        const res = await deleteEmailInSlack(editorState.email?.uuid ?? '');
        console.log("Deleted email in slack", res);

        setHasPosted(false);
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostedReview: false,
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

    const checkIfApproved = async (): Promise<boolean> => {
        console.log('Refreshing reviews...', emailStates);
        const newSaves = await markReviewedEmails(emailStates);
        const saveMatch = newSaves?.find((s) => s === editorState.email?.name);

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

        return !!saveMatch;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const uuid = editorState.email?.uuid ?? '';

        if (editorState.email?.values?.getCurrentValue('Send Type') === 'POSTMARK') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const autoPost = await postPostmarkScheduledEmailInSlack(uuid);
            console.log("Posted postmark scheduled email in slack", autoPost);
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostedReview: true,
                hasSentReview: true,
            }
        }));

        if (pollInterval.current)
            clearInterval(pollInterval.current);

        return await new Promise((resolve) => {
            if (pollInterval.current)
                clearInterval(pollInterval.current);

            pollInterval.current = setInterval(async () => {
                const saveMatch = await checkIfApproved();

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
                hasPostedReview: true,
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
            subtitle: 'Create Slack review ticket for \'' + slackEmailId + '\'.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create Slack review ticket for \'' + slackEmailId + '\'.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create Slack review ticket for \'' + slackEmailId + '\'.',
            rightContent:
                !hasPosted ?
                    <Button variant="light" color="gray.6" h={40} disabled={isPostPending} loading={isPostPending} > Already has Ticket</Button> :
                    (editorState.email?.values?.getCurrentValue('Send Type') === 'POSTMARK' ?
                        <Button variant="outline" color="blue.5" h={40} rightSection={<IconMessage />} ref={sendButton} loading={editorState.email.usesPostmarkTool} >{editorState.email.usesPostmarkTool ? 'Sending' : 'Send'}</Button>
                        : <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Mark Sent</Button>
                    )
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
                                                value={MARKETING_REVIEWERS[reviewer]}
                                                data={MARKETING_REVIEWERS}
                                                onChange={(v) => setReviewer(MARKETING_REVIEWERS.indexOf(v ?? ''))}
                                                disabled={isPostPending || hasPosted}
                                            />
                                        </Box>
                                        <Box className=" relative w-24 mt-2">
                                            <Select
                                                description='Priority'
                                                value={PRIORITY_ICONS[priority]}
                                                defaultValue={PRIORITY_ICONS[defaultPriority]}
                                                data={PRIORITY_ICONS}
                                                onChange={(v) => setPriority(PRIORITY_ICONS.indexOf(v ?? ''))}
                                                disabled={isPostPending || hasPosted}
                                            />
                                        </Box>
                                    </Flex>
                                    :
                                    editorState.email?.usesPostmarkTool ?
                                        '' : (<Flex gap={20} direction="column" align="start" justify="space-between">
                                            <Text size="xs">Add screenshots and switch Review to '{isPreApproved ? 'Pre-Approved' : ''} Template Email Review' to post the review ticket. Then mark sent.</Text>

                                            <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={100} >
                                                <Image src={'./tutorials/upload-screenshots.gif'} />
                                            </Box>
                                            <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={270}>
                                                <Image src={'./tutorials/send-review.gif'} />
                                            </Box>
                                        </Flex>)

                            }
                        </Flex>
                        {
                            (!hasPosted ?
                                <Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={15}>
                                    <Button variant="outline" color="blue.5" mt={10} h={40} onClick={handleCreateTicket} disabled={isPostPending} loading={isPostPending}>Create Ticket</Button>
                                </Flex>
                                :
                                editorState.email?.usesPostmarkTool ? ''
                                    : (<Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={20}>
                                        <Anchor href={SLACK_LIST_URL} target="_blank">
                                            <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >
                                                Open Slack List
                                            </Button>
                                        </Anchor>
                                        <Button variant="light" color="gray" h={40} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket()} >
                                            Delete Ticket
                                        </Button>
                                    </Flex>))

                        }
                    </Flex>
                    <Box px={10}>
                        {hasPosted && !editorState.email?.usesPostmarkTool ?
                            <Text size="xs">The last reviewer was {MARKETING_REVIEWERS[getLastReviewer()]}.</Text>
                            : ''
                        }
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Waiting for Reviews',
            subtitle: 'Polling for ticket \'' + slackEmailId + '\'.',
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
            subtitle: 'Ticket was marked as approved.',
            rightContent: null
            // rightContent: <ThemeIcon size={36} bg='none' c='blue' ml={12} mr={0}><IconConfetti strokeWidth={2.5} size={36} /></ThemeIcon>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined
            && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined
            && (
                editorState.email?.sentTest === editorState.email?.templateId
                || editorState.email?.sentTest === editorState.email?.campaignId
            )
            && editorState.email?.notionURL !== undefined
            && editorState.email?.notionURL.length > 0
            && (
                (
                    editorState.email?.hasPostmarkAction !== undefined
                    && editorState.email?.hasPostmarkAction === editorState.email?.templateId
                    && editorState.email?.hasWaitAction !== undefined
                    && editorState.email?.hasWaitAction === true
                ) || (
                    editorState.email?.campaignId !== undefined
                    && editorState.email?.campaignId === editorState.email?.campaignId
                )
            )
            && editorState.email?.isDevReviewed !== undefined
            && editorState.email?.isDevReviewed === true
    }

    const isDone = () => {
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        await handleDeleteTicket();

        pollInterval.current && clearInterval(pollInterval.current);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: false,
                isReviewed: false,
            }
        }));

        setHasPosted(false);
        setIsPostPending(false);

        return true;
    }

    if (editorState.email?.values?.getCurrentValue('Is Variation') === 'Is Variation' || editorState.email?.values?.getCurrentValue('Is Excluded From QA Review') === 'Is Excluded From QA Review') {
        return null; // Skip if this is a variation email or excluded from QA review
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